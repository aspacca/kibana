/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiComboBox, EuiFormRow } from '@elastic/eui';
import { Controller, FieldErrors, Control } from 'react-hook-form';
import React from 'react';
import { i18n } from '@kbn/i18n';
import { useSelector } from 'react-redux';
import { serviceLocationsSelector } from '../../../state/monitor_management/selectors';
import { SimpleFormData } from '../simple_monitor_form';
import { ConfigKey } from '../../../../../../common/constants/monitor_management';

export const ServiceLocationsField = ({
  errors,
  control,
}: {
  errors: FieldErrors;
  control: Control<SimpleFormData, any>;
}) => {
  const locations = useSelector(serviceLocationsSelector);

  return (
    <EuiFormRow
      fullWidth
      label={LOCATIONS_LABEL}
      helpText={!errors?.[ConfigKey.LOCATIONS] ? SELECT_ONE_OR_MORE_LOCATIONS : undefined}
      isInvalid={!!errors?.[ConfigKey.LOCATIONS]}
      error={SELECT_ONE_OR_MORE_LOCATIONS}
    >
      <Controller
        name={ConfigKey.LOCATIONS}
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <EuiComboBox
            fullWidth
            aria-label={SELECT_ONE_OR_MORE_LOCATIONS}
            placeholder={SELECT_ONE_OR_MORE_LOCATIONS}
            options={locations.map((location) => ({
              ...location,
              'data-test-subj': `syntheticsServiceLocation--${location.id}`,
            }))}
            selectedOptions={field.value}
            isClearable={true}
            data-test-subj="syntheticsServiceLocations"
            {...field}
            isInvalid={!!errors?.[ConfigKey.LOCATIONS]}
          />
        )}
      />
    </EuiFormRow>
  );
};

const SELECT_ONE_OR_MORE_LOCATIONS = i18n.translate(
  'xpack.synthetics.monitorManagement.selectOneOrMoreLocations',
  {
    defaultMessage: 'Select one or more locations',
  }
);

const LOCATIONS_LABEL = i18n.translate('xpack.synthetics.monitorManagement.locationsLabel', {
  defaultMessage: 'Locations',
});
