/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiSteps,
  EuiTitle,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import { snExternalServiceConfig } from '@kbn/actions-plugin/common';
import { ActionConnectorFieldsProps } from '../../../../types';
import { ServiceNowActionConnector } from './types';
import { CredentialsApiUrl } from './credentials_api_url';
import { isFieldInvalid } from './helpers';
import { ApplicationRequiredCallout } from './application_required_callout';
import { SNStoreLink } from './sn_store_button';
import { CredentialsAuth, OAuth } from './auth_types';

const title = i18n.translate(
  'xpack.triggersActionsUI.components.builtinActionTypes.serviceNow.updateFormTitle',
  {
    defaultMessage: 'Update ServiceNow connector',
  }
);

const step1InstallTitle = i18n.translate(
  'xpack.triggersActionsUI.components.builtinActionTypes.serviceNow.updateFormInstallTitle',
  {
    defaultMessage: 'Install the Elastic ServiceNow app',
  }
);

const step2InstanceUrlTitle = i18n.translate(
  'xpack.triggersActionsUI.components.builtinActionTypes.serviceNow.updateFormUrlTitle',
  {
    defaultMessage: 'Enter your ServiceNow instance URL',
  }
);

const step3CredentialsTitle = i18n.translate(
  'xpack.triggersActionsUI.components.builtinActionTypes.serviceNow.updateFormCredentialsTitle',
  {
    defaultMessage: 'Provide authentication credentials',
  }
);

const cancelButtonText = i18n.translate(
  'xpack.triggersActionsUI.components.builtinActionTypes.serviceNow.cancelButtonText',
  {
    defaultMessage: 'Cancel',
  }
);

const confirmButtonText = i18n.translate(
  'xpack.triggersActionsUI.components.builtinActionTypes.serviceNow.confirmButtonText',
  {
    defaultMessage: 'Update',
  }
);

const warningMessage = i18n.translate(
  'xpack.triggersActionsUI.components.builtinActionTypes.serviceNow.warningMessage',
  {
    defaultMessage: 'This updates all instances of this connector and cannot be reversed.',
  }
);

export interface Props {
  action: ActionConnectorFieldsProps<ServiceNowActionConnector>['action'];
  applicationInfoErrorMsg: string | null;
  errors: ActionConnectorFieldsProps<ServiceNowActionConnector>['errors'];
  isLoading: boolean;
  readOnly: boolean;
  editActionSecrets: ActionConnectorFieldsProps<ServiceNowActionConnector>['editActionSecrets'];
  editActionConfig: ActionConnectorFieldsProps<ServiceNowActionConnector>['editActionConfig'];
  onCancel: () => void;
  onConfirm: () => void;
}

const UpdateConnectorComponent: React.FC<Props> = ({
  action,
  applicationInfoErrorMsg,
  errors,
  isLoading,
  readOnly,
  editActionSecrets,
  editActionConfig,
  onCancel,
  onConfirm,
}) => {
  const { apiUrl, isOAuth, jwtKeyId, userIdentifierValue, clientId } = action.config;
  const { username, password, privateKeyPassword, privateKey, clientSecret } = action.secrets;

  let hasErrorsOrEmptyFields;

  hasErrorsOrEmptyFields = apiUrl === undefined || isFieldInvalid(apiUrl, errors.apiUrl);

  if (isOAuth) {
    hasErrorsOrEmptyFields =
      hasErrorsOrEmptyFields ||
      jwtKeyId === undefined ||
      userIdentifierValue === undefined ||
      clientId === undefined ||
      privateKeyPassword === undefined ||
      privateKey === undefined ||
      clientSecret === undefined ||
      isFieldInvalid(jwtKeyId, errors.apiUrl) ||
      isFieldInvalid(userIdentifierValue, errors.userIdentifierValue) ||
      isFieldInvalid(clientId, errors.clientId) ||
      isFieldInvalid(privateKeyPassword, errors.privateKeyPassword) ||
      isFieldInvalid(privateKey, errors.privateKey) ||
      isFieldInvalid(clientSecret, errors.clientSecret);
  } else {
    hasErrorsOrEmptyFields =
      hasErrorsOrEmptyFields ||
      username === undefined ||
      password === undefined ||
      isFieldInvalid(username, errors.username) ||
      isFieldInvalid(password, errors.password);
  }

  return (
    <EuiFlyout ownFocus onClose={onCancel} data-test-subj="updateConnectorForm">
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h1>{title}</h1>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody
        banner={
          <EuiCallOut
            size="m"
            color="danger"
            iconType="alert"
            data-test-subj="snUpdateInstallationCallout"
            title={warningMessage}
          />
        }
      >
        <EuiFlexGroup>
          <EuiSteps
            steps={[
              {
                title: step1InstallTitle,
                children: (
                  <FormattedMessage
                    id="xpack.triggersActionsUI.components.builtinActionTypes.serviceNowAction.serviceNowAppRunning"
                    defaultMessage="The Elastic App from the ServiceNow app store must be installed prior to running the update. {visitLink} to install the app"
                    values={{
                      visitLink: (
                        <SNStoreLink
                          appId={snExternalServiceConfig[action.actionTypeId].appId ?? ''}
                        />
                      ),
                    }}
                  />
                ),
              },
              {
                title: step2InstanceUrlTitle,
                children: (
                  <CredentialsApiUrl
                    action={action}
                    errors={errors}
                    readOnly={readOnly}
                    isLoading={isLoading}
                    editActionConfig={editActionConfig}
                  />
                ),
              },
              {
                title: step3CredentialsTitle,
                children: isOAuth ? (
                  <OAuth
                    action={action}
                    errors={errors}
                    readOnly={readOnly}
                    isLoading={isLoading}
                    editActionSecrets={editActionSecrets}
                    editActionConfig={editActionConfig}
                  />
                ) : (
                  <CredentialsAuth
                    action={action}
                    errors={errors}
                    readOnly={readOnly}
                    isLoading={isLoading}
                    editActionSecrets={editActionSecrets}
                  />
                ),
              },
            ]}
          />
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>
            {applicationInfoErrorMsg && (
              <ApplicationRequiredCallout
                message={applicationInfoErrorMsg}
                appId={snExternalServiceConfig[action.actionTypeId].appId ?? ''}
              />
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty data-test-subj="snUpdateInstallationCancel" onClick={onCancel}>
              {cancelButtonText}
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              data-test-subj="snUpdateInstallationSubmit"
              onClick={onConfirm}
              color="danger"
              fill
              disabled={hasErrorsOrEmptyFields}
              isLoading={isLoading}
            >
              {confirmButtonText}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
};

export const UpdateConnector = memo(UpdateConnectorComponent);
