/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { getRulesListLazy } from '../../../common/get_rules_list';

const style = {
  flex: 1,
};

export const RulesListSandbox = () => {
  return <div style={style}>{getRulesListLazy()}</div>;
};
