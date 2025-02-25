import classNames from 'classnames';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Route, RouteComponentProps, Switch } from 'react-router-dom';

import '../_monitoring.scss';
import {
  getAlertRulesUrl,
  getAlertsUrl,
  getIncidentsUrl,
  getSilencesUrl,
  usePerspective,
} from '../hooks/usePerspective';

import { useFeatures } from '../hooks/useFeatures';
import incidentsPageWithFallback from '../Incidents/IncidentsPage';

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
  const { areIncidentsActive } = useFeatures();

  const alertsPath = getAlertsUrl(perspective);
  const rulesPath = getAlertRulesUrl(perspective);
  const silencesPath = getSilencesUrl(perspective);
  const incidentsPath = getIncidentsUrl(perspective);

  const { url } = match;

  if (areIncidentsActive) {
    console.log('JZ areIncidentsActive: ', areIncidentsActive);
    console.log('JZ incidentsPath: ', incidentsPath);
    console.log('JZ alertsPath: ', alertsPath);
  }

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
        {areIncidentsActive && (
          <Tab active={url === incidentsPath}>
            <Link to={incidentsPath}>Incidents</Link>
          </Tab>
        )}
      </ul>
      <Switch>
        <Route path={incidentsPath} exact component={incidentsPageWithFallback} />
      </Switch>
    </>
  );
};

export default AlertingPage;
