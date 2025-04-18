import {
  AlertingRulesSourceExtension,
  isAlertingRulesSource,
  useActiveNamespace,
  useResolvedExtensions,
} from '@openshift-console/dynamic-plugin-sdk';
import * as React from 'react';
import { Route, Routes, useLocation, useParams } from 'react-router-dom-v5-compat';

import MonitoringDashboardsPage from './dashboards/perses/dashboard-page';
import MonitoringLegacyDashboardsPage from './dashboards/legacy/legacy-dashboard-page';
import { QueryBrowserPage } from './metrics';
import { CreateSilence } from './alerting/SilenceForm';
import { Details, ListPage, TargetsUI } from './targets';

import { usePerspective } from './hooks/usePerspective';
import AlertsPage from './alerting/AlertsPage';
import AlertsDetailsPage from './alerting/AlertsDetailPage';
import { useRulesAlertsPoller } from './hooks/useRulesAlertsPoller';
import { useSilencesPoller } from './hooks/useSilencesPoller';
import SilencesPage from './alerting/SilencesPage';
import SilencesDetailsPage from './alerting/SilencesDetailPage';
import AlertRulesDetailsPage from './alerting/AlertRulesDetailsPage';
import AlertRulesPage from './alerting/AlertRulesPage';
import AlertingPage from './alerting/AlertingPage';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';

export const PersesContext = React.createContext(false);

const PollingPagesRouter = () => {
  console.log('1. JZ PollingPagesRouter');

  const { alertingContextId, perspective } = usePerspective();

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
    console.log('1. JZ POLLING PAGES ROUTER DEV PERSPECTIVE');
    return <AlertingRouter />;
  }

  return <AlertingRouter />;
};

const AlertingRouter: React.FC = () => {
  console.log('1. AlertingRouter');
  // path root = /monitoring/...
  return (
    <Routes>
      <Route path="alerts/:ruleID" element={<AlertsDetailsPage />} />
      <Route path="alertrules/:id" element={<AlertRulesDetailsPage />} />
      <Route path="silences/:id" element={<SilencesDetailsPage />} />
      <Route element={<AlertingPage />}>
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="alertrules" element={<AlertRulesPage />} />
        <Route path="silences" element={<SilencesPage />} />
      </Route>
    </Routes>
  );
};

const DevelopmentAlertingRouter = () => {
  return (
    <Routes>
      <Route path="alerts" element={<AlertsPage />} />
      <Route path="alerts/:ruleID" element={<AlertsDetailsPage />} />
      <Route path="rules/:id" element={<AlertRulesDetailsPage />} />
      <Route path="silences" element={<SilencesPage />} />
      <Route path="silences/:id" element={<SilencesDetailsPage />} />
    </Routes>
  );
};

const NonPollingRouter = () => {
  console.log('1. JZ NonPollingRouter!!');
  const location = useLocation();
  console.log('1. JZ NonPollingRouter route:', location.pathname);
  const param = useParams();
  console.log('1. JZ NonPollingRouter param:', param);

  return (
    <Routes>
      {/* This redirect also handles the `${root}/#/alerts?...` link URLs generated by
    Alertmanager (because the `#` is considered the end of the URL) */}
      <Route path={`silences/~new`} element={<CreateSilence />} />
      <Route path={`v2/dashboards`} element={<MonitoringDashboardsPage />} />
      <Route path={`dashboards/:dashboardName?`} element={<MonitoringLegacyDashboardsPage />} />
      {/* <Route path={`/${root}/graph`} exact component={PrometheusRouterRedirect} /> */}
      <Route path={`query-browser`} element={<QueryBrowserPage />} />
      <Route path={`targets`} element={<TargetsUI />}>
        <Route index element={<ListPage />} />
        <Route path=":scrapeUrl" element={<Details />} />
      </Route>
      <Route path="*" element={<PollingPagesRouter />} />
    </Routes>
  );
};

const DevelopmentRouter = () => {
  console.log('1. JZ DevelopmentRouter');

  return (
    <Routes>
      <Route path="*" element={<PollingPagesRouter />} />
      <Route index element={<MonitoringLegacyDashboardsPage />} />
      <Route path={`silences/~new`} element={<CreateSilence />} />
      <Route path={`metrics`} element={<QueryBrowserPage />} />
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
  const { perspective } = usePerspective();

  console.log('0. JZ perspective: ', { perspective });

  return (
    <QueryParamProvider adapter={ReactRouter5Adapter}>
      {(() => {
        switch (perspective) {
          case 'admin':
          case 'virtualization-perspective':
            return <NonPollingRouter />;
          case 'dev':
            return <DevelopmentRouter />;
          case 'acm':
            return <AcmRouter />;
        }
      })()}
    </QueryParamProvider>
  );
};

// // Handles links that have the Prometheus UI's URL format (expected for links in alerts sent by
// // Alertmanager). The Prometheus UI specifies the PromQL query with the GET param `g0.expr`, so we
// // use that if it exists. Otherwise, just go to the query browser page with no query.
// const PrometheusRouterRedirect = () => {
//   const params = getAllQueryArguments();
//   // leaving perspective redirect to future work
//   return <Redirect to={`/monitoring/query-browser?query0=${params['g0.expr'] || ''}`} />;
// };

export default MonitoringRouter;
