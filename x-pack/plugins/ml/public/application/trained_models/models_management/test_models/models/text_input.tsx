/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { FC, useState, useEffect } from 'react';
import { i18n } from '@kbn/i18n';
import useObservable from 'react-use/lib/useObservable';
import { EuiTextArea } from '@elastic/eui';
import { RUNNING_STATE } from './inference_base';
import type { InferrerType } from '.';

export const TextInput: FC<{
  placeholder?: string;
  inferrer: InferrerType;
}> = ({ placeholder, inferrer }) => {
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    inferrer.inputText$.next(inputText);
  }, [inputText]);

  const runningState = useObservable(inferrer.runningState$);

  return (
    <EuiTextArea
      placeholder={
        placeholder ??
        i18n.translate('xpack.ml.trainedModels.testModelsFlyout.generalTextInput.inputText', {
          defaultMessage: 'Input text',
        })
      }
      value={inputText}
      disabled={runningState === RUNNING_STATE.RUNNING}
      fullWidth
      onChange={(e) => {
        setInputText(e.target.value);
      }}
    />
  );
};

export const getGeneralInputComponent = (inferrer: InferrerType, placeholder?: string) => (
  <TextInput placeholder={placeholder} inferrer={inferrer} />
);
