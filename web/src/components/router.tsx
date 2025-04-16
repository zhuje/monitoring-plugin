import {
  AlertingRulesSourceExtension,
  isAlertingRulesSource,
  useActiveNamespace,
  useResolvedExtensions,
} from '@openshift-console/dynamic-plugin-sdk';
import * as React from 'react';
import { Route, Routes } from 'react-router-dom-v5-compat';

import MonitoringDashboardsPage from './dashboards/perses/dashboard-page';
import MonitoringLegacyDashboardsPage from './dashboards/legacy/legacy-dashboard-page';
import { QueryBrowserPage } from './metrics';
import { CreateSilence, EditSilence } from './alerting/SilenceForm';
import { TargetsUI } from './targets';

import { UrlRoot, usePerspective } from './hooks/usePerspective';
import AlertsPage from './alerting/AlertsPage';
import AlertsDetailsPage from './alerting/AlertsDetailPage';
import { useRulesAlertsPoller } from './hooks/useRulesAlertsPoller';
import { useSilencesPoller } from './hooks/useSilencesPoller';
import SilencesPage from './alerting/SilencesPage';
import SilencesDetailsPage from './alerting/SilencesDetailPage';
import AlertRulesDetailsPage from './alerting/AlertRulesDetailsPage';
import AlertingPage from './alerting/AlertingPage';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';

export const PersesContext = React.createContext(false);

const PollingPagesRouter = () => {
  const { alertingContextId, perspective, urlRoot } = usePerspective();
  console.debug('PollingPagesRouter');

  const [namespace] = useActiveNamespace();

  const [customExtensions] =
    useResolvedExtensions<AlertingRulesSourceExtension>(isAlertingRulesSource);

  const alertsSource = React.useMemo(
    () =>
      customExtensions
        .filter((extension) => extension.properties.contextId === alertingContextId)
        .map((extension) => extension.properties),
    [customExtensions, alertingContextId],
  );

  useRulesAlertsPoller(namespace, alertsSource);
  useSilencesPoller({ namespace });

  if (perspective === 'dev') {
    return <DevelopmentAlertingRouter />;
  }

  return <AlertingRouter root={urlRoot} />;
};

const AlertingRouter: React.FC<{ root: UrlRoot }> = ({ root }) => {
  console.debug('AlertingRouter', `${root}/alerts`);
  return (
    <Routes>
      <Route path={`/${root}/alerts`} element={<AlertingPage />} />
      <Route path={`/${root}/alertrules`} element={<AlertingPage />} />
      <Route path={`${root}/silences`} element={<AlertingPage />} />
      <Route path={`${root}/incidents`} element={<AlertingPage />} />
      <Route path={`${root}/alertrules/:id`} element={<AlertRulesDetailsPage />} />
      <Route path={`${root}/alerts/:ruleID`} element={<AlertsDetailsPage />} />
      <Route path={`${root}/silences/:id`} element={<SilencesDetailsPage />} />
    </Routes>
  );
};

const DevelopmentAlertingRouter = () => {
  console.debug('DevelopmentAlertingRouter');

  return (
    <Routes>
      <Route path="dev-monitoring/ns/:ns/alerts" element={<AlertsPage />} />
      <Route path="dev-monitoring/ns/:ns/alerts/:ruleID" element={<AlertsDetailsPage />} />
      <Route path="dev-monitoring/ns/:ns/rules/:id" element={<AlertRulesDetailsPage />} />
      <Route path="dev-monitoring/ns/:ns/silences" element={<SilencesPage />} />
      <Route path="dev-monitoring/ns/:ns/silences/:id" element={<SilencesDetailsPage />} />
    </Routes>
  );
};

const NonPollingRouter: React.FC<{ root: UrlRoot }> = ({ root }) => {
  console.debug('NonPollingRouter');
  return (
    <Routes>
      {/* This redirect also handles the `${root}/#/alerts?...` link URLs generated by
    Alertmanager (because the `#` is considered the end of the URL) */}
      <Route path={`${root}/silences/~new`} element={<CreateSilence />} />

      <Route path={`${root}/v2/dashboards`} element={<MonitoringDashboardsPage />} />
      <Route
        path={`${root}/dashboards/:dashboardName?`}
        element={<MonitoringLegacyDashboardsPage />}
      />

      <Route path={`${root}/query-browser`} element={<QueryBrowserPage />} />

      <Route path={`${root}/targets`} element={<TargetsUI />} />

      <Route path="*" element={<PollingPagesRouter />} />
    </Routes>
  );
};

const DevelopmentRouter = () => {
  console.debug('DevelopmentRouter');

  return (
    <Routes>
      <Route path="dev-monitoring/ns/:ns/" element={<MonitoringLegacyDashboardsPage />} />
      <Route path="dev-monitoring/ns/:ns/silences/~new" element={<CreateSilence />} />
      <Route path="dev-monitoring/ns/:ns/metrics" element={<QueryBrowserPage />} />

      <Route path="*" element={<PollingPagesRouter />} />
    </Routes>
  );
};

const AcmRouter = () => (
  <Routes>
    {/* This redirect also handles the `multicloud/monitoring/#/alerts?...` link URLs generated by
  Alertmanager (because the `#` is considered the end of the URL) */}
    <Route path="multicloud/monitoring/silences/~new" element={<CreateSilence />} />

    <Route path="multicloud/monitoring/v2/dashboards" element={<MonitoringDashboardsPage />} />

    <Route element={<PollingPagesRouter />} />
  </Routes>
);

const MonitoringRouter = () => {
  const { perspective, urlRoot } = usePerspective();

  return (
    <QueryParamProvider adapter={ReactRouter5Adapter}>
      {(() => {
        switch (perspective) {
          case 'admin':
          case 'virtualization-perspective':
            return <NonPollingRouter root={urlRoot} />;
          case 'dev':
            return <DevelopmentRouter />;
          case 'acm':
            return <AcmRouter />;
        }
      })()}
    </QueryParamProvider>
  );
};
export default MonitoringRouter;
