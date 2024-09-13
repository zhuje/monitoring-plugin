import * as _ from 'lodash-es';
import * as React from 'react';
import classNames from 'classnames';
import { Alert, Button } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

import { IncompleteDataError, TimeoutError } from './http-error';
import * as restrictedSignImg from './restricted-sign.svg';

const LAST_LANGUAGE_LOCAL_STORAGE_KEY = 'bridge/last-language';
const getLastLanguage = (): string => localStorage.getItem(LAST_LANGUAGE_LOCAL_STORAGE_KEY);

const Box: React.FC<BoxProps> = ({ children, className }) => (
  <div className={classNames('cos-status-box', className)}>{children}</div>
);

const LoadError: React.FC<LoadErrorProps> = ({ label, className, message, canRetry = true }) => {
  const { t } = useTranslation();
  return (
    <Box className={className}>
      <div className="pf-u-text-align-center cos-error-title">
        {_.isString(message)
          ? t('Error Loading {{label}}: {{message}}', {
              label,
              message,
            })
          : t('Error Loading {{label}}', { label })}
      </div>
      {canRetry && (
        <div className="pf-u-text-align-center">
          {t('Please ')}{' '}
          <Button
            type="button"
            onClick={window.location.reload.bind(window.location)}
            variant="link"
            isInline
          >
            {t('try again')}
          </Button>
          .
        </div>
      )}
    </Box>
  );
};
LoadError.displayName = 'LoadError';

const Loading: React.FC<LoadingProps> = ({ className }) => (
  <div
    className={classNames('co-m-loader co-an-fade-in-out', className)}
    data-test="loading-indicator"
  >
    <div className="co-m-loader-dot__one" />
    <div className="co-m-loader-dot__two" />
    <div className="co-m-loader-dot__three" />
  </div>
);
Loading.displayName = 'Loading';

export const LoadingInline: React.FC = () => <Loading className="co-m-loader--inline" />;
LoadingInline.displayName = 'LoadingInline';

export const LoadingBox: React.FC<LoadingBoxProps> = ({ className, message }) => (
  <Box className={classNames('cos-status-box--loading', className)}>
    <Loading />
    {message && <div className="cos-status-box__loading-message">{message}</div>}
  </Box>
);
LoadingBox.displayName = 'LoadingBox';

export const EmptyBox: React.FC<EmptyBoxProps> = ({ label }) => {
  const { t } = useTranslation();
  return (
    <Box>
      <div data-test="empty-message" className="pf-u-text-align-center">
        {label ? t('~No {{label}} found', { label }) : t('Not found')}
      </div>
    </Box>
  );
};
EmptyBox.displayName = 'EmptyBox';

const MsgBox: React.FC<MsgBoxProps> = ({ title, detail, className = '' }) => (
  <Box className={className}>
    {title && (
      <div className="cos-status-box__title" data-test="msg-box-title">
        {title}
      </div>
    )}
    {detail && (
      <div className="pf-u-text-align-center cos-status-box__detail" data-test="msg-box-detail">
        {detail}
      </div>
    )}
  </Box>
);
MsgBox.displayName = 'MsgBox';

const AccessDenied: React.FC<AccessDeniedProps> = ({ message }) => {
  const { t } = useTranslation();
  return (
    <div>
      <Box className="pf-u-text-align-center">
        <img className="cos-status-box__access-denied-icon" src={restrictedSignImg} />
        <MsgBox
          title={t('Restricted Access')}
          detail={t("You don't have access to this section due to cluster policy.")}
        />
      </Box>
      {_.isString(message) && (
        <Alert isInline className="co-alert" variant="danger" title={t('Error details')}>
          {message}
        </Alert>
      )}
    </div>
  );
};
AccessDenied.displayName = 'AccessDenied';

const Data: React.FC<DataProps> = ({ label, data, children }) => {
  if (!data || _.isEmpty(data)) {
    return (
      <div className="loading-box loading-box__loaded">
        <EmptyBox label={label} />
      </div>
    );
  }
  return <div className="loading-box loading-box__loaded">{children}</div>;
};
Data.displayName = 'Data';

export const StatusBox: React.FC<StatusBoxProps> = (props) => {
  const { loadError, loaded, skeleton, data, ...dataProps } = props;
  const { t } = useTranslation();

  if (loadError) {
    const status = _.get(loadError, 'response.status');
    if (status === 404) {
      return (
        <div className="co-m-pane__body">
          <h1 className="co-m-pane__heading co-m-pane__heading--center">{t('404: Not Found')}</h1>
        </div>
      );
    }
    if (status === 403) {
      return <AccessDenied message={loadError.message} />;
    }

    if (loadError instanceof IncompleteDataError && !_.isEmpty(data)) {
      return (
        <Data data={data} {...dataProps}>
          <Alert
            variant="info"
            isInline
            title={t(
              '{{labels}} content is not available in the catalog at this time due to loading failures.',
              {
                labels: new Intl.ListFormat(getLastLanguage() || 'en', {
                  style: 'long',
                  type: 'conjunction',
                }).format(loadError.labels),
              },
            )}
          />
          {props.children}
        </Data>
      );
    }

    if (loaded && loadError instanceof TimeoutError) {
      return (
        <Data data={data} {...dataProps}>
          <div className="co-m-timeout-error text-muted">
            {t('Timed out fetching new data. The data below is stale.')}
          </div>
          {props.children}
        </Data>
      );
    }

    return (
      <LoadError
        message={loadError.message}
        label={props.label}
        className="loading-box loading-box__errored"
      />
    );
  }

  if (!loaded) {
    return skeleton ? <>{skeleton}</> : <LoadingBox className="loading-box loading-box__loading" />;
  }
  return <Data data={data} {...dataProps} />;
};
StatusBox.displayName = 'StatusBox';

type BoxProps = {
  children: React.ReactNode;
  className?: string;
};

type LoadErrorProps = {
  label: string;
  className?: string;
  message?: string;
  canRetry?: boolean;
};

type LoadingProps = {
  className?: string;
};

type LoadingBoxProps = {
  className?: string;
  message?: string;
};

type EmptyBoxProps = {
  label?: string;
};

type MsgBoxProps = {
  title?: string;
  detail?: React.ReactNode;
  className?: string;
};

type AccessDeniedProps = {
  message?: string;
};

type DataProps = {
  label?: string;
  data?: any;
  children?: React.ReactNode;
};

type StatusBoxProps = {
  label?: string;
  loadError?: any;
  loaded?: boolean;
  data?: any;
  skeleton?: React.ReactNode;
  children?: React.ReactNode;
};
