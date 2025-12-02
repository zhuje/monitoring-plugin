import type { FC, PropsWithChildren } from 'react';
import { memo } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import { PageSection, Stack, StackItem, Title } from '@patternfly/react-core';
import { CombinedDashboardMetadata } from './hooks/useDashboardsData';

import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { getDashboardsListUrl, usePerspective } from '../../hooks/usePerspective';
import { StringParam, useQueryParam } from 'use-query-params';
import { QueryParams } from '../../query-params';
import { useNavigate } from 'react-router-dom-v5-compat';

export const DashboardBreadCrumb: React.FunctionComponent = () => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);

  const { perspective } = usePerspective();
  const [dashboardName] = useQueryParam(QueryParams.Dashboard, StringParam);
  const navigate = useNavigate();

  const handleDashboardsClick = () => {
    navigate(getDashboardsListUrl(perspective));
  };

  return (
    <Breadcrumb ouiaId="perses-dashboards-breadcrumb">
      <BreadcrumbItem onClick={handleDashboardsClick} style={{ cursor: 'pointer' }}>
        {t('Dashboards ! ')}
      </BreadcrumbItem>
      {dashboardName && <BreadcrumbItem isActive>{dashboardName}</BreadcrumbItem>}
    </Breadcrumb>
  );
};

const HeaderTop: FC = memo(() => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);

  return (
    <Stack hasGutter>
      <StackItem>
        <DashboardBreadCrumb />
      </StackItem>
      <StackItem>
        <Title headingLevel="h1">{t('Dashboards')}</Title>
        {t('View and manage dashboards.')}
      </StackItem>
    </Stack>
  );
});

type MonitoringDashboardsPageProps = PropsWithChildren<{
  boardItems: CombinedDashboardMetadata[];
  changeBoard: (dashboardName: string) => void;
  dashboardName: string;
  activeProject?: string;
}>;

export const DashboardSkeleton: FC<MonitoringDashboardsPageProps> = memo(({ children }) => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);

  return (
    <>
      <Helmet>
        <title>{t('Metrics dashboards')}</title>
      </Helmet>
      <PageSection hasBodyWrapper={false}>
        <HeaderTop />
      </PageSection>
      {children}
    </>
  );
});
