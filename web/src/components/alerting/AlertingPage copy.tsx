import classNames from 'classnames';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Route, RouteComponentProps, Switch } from 'react-router-dom';

// Monitoring Plugin - 4.17

import '../_monitoring.scss';
import {
  getAlertRulesUrl,
  getAlertsUrl,
  getSilencesUrl,
  usePerspective,
} from '../hooks/usePerspective';
import AlertsPage from '../alerting/AlertsPage';
import SilencesPage from '../alerting/SilencesPage';
import AlertRulesPage from '../alerting/AlertRulesPage';

const Tab: React.FC<{ active: boolean; children: React.ReactNode }> = ({ active, children }) => (
  <li
    className={classNames('co-m-horizontal-nav__menu-item', {
      'co-m-horizontal-nav-item--active': active,
    })}
  >
    {children}
  </li>
);

const AlertingPage: React.FC<RouteComponentProps<{ url: string }>> = ({ match }) => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);
  const { perspective } = usePerspective();

  const alertsPath = getAlertsUrl(perspective);
  const rulesPath = getAlertRulesUrl(perspective);
  const silencesPath = getSilencesUrl(perspective);

  // const mcpEnabled = useMCPAvailable();
  // useMCPAvailable() use this to end a request to this endpoint
  // /api/proxy/plugin/monitoring-console-plugin/backend/

  // fetch is being made from the monitoring-plugin to the monitoring-console-plugin

  // if this exists then render the Tab

  // make we're going to have to backport this to 4.18, 4.17 so
  // make the changes as simple and modulare as possible -- meaning like seperate files because
  // might need to manually insert the code into backported versions and that is a pain

  // this change is going to exist in the monitoring-plugin

  // the long term solution is to update an extension point in the console-sdk
  // to allow for any page to to have accept 'add tab' extension point

  const { url } = match;

  return (
    <>
      <div className="co-m-nav-title co-m-nav-title--detail">
        <h1 className="co-m-pane__heading">
          <div className="co-m-pane__name co-resource-item">
            <span className="co-resource-item__resource-name" data-test-id="resource-title">
              {t('Alerting')}
            </span>
          </div>
        </h1>
      </div>
      <ul className="co-m-horizontal-nav__menu">
        <Tab active={url === alertsPath}>
          <Link to={alertsPath}>{t('Alerts')}</Link>
        </Tab>
        <Tab active={url === silencesPath}>
          <Link to={silencesPath}>{t('Silences')}</Link>
        </Tab>
        <Tab active={url === rulesPath}>
          <Link to={rulesPath}>{t('Alerting rules')}</Link>
        </Tab>
      </ul>
      <Switch>
        <Route path={alertsPath} exact component={AlertsPage} />
        <Route path={rulesPath} exact component={AlertRulesPage} />
        <Route path={silencesPath} exact component={SilencesPage} />
      </Switch>
    </>
  );
};

export default AlertingPage;
