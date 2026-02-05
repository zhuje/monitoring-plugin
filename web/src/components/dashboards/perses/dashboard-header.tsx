import type { FC, PropsWithChildren } from 'react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { Divider, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import { DocumentTitle, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { CombinedDashboardMetadata } from './hooks/useDashboardsData';

import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom-v5-compat';
import { getDashboardsListUrl, usePerspective } from '../../hooks/usePerspective';

import {
  chart_color_blue_100,
  chart_color_blue_300,
  t_global_spacer_md,
  t_global_spacer_xl,
} from '@patternfly/react-tokens';
import { listPersesDashboardsDataTestIDs } from '../../data-test';
import { usePatternFlyTheme } from '../../hooks/usePatternflyTheme';
import { DashboardCreateDialog } from './dashboard-create-dialog';
import { PagePadding } from './dashboard-page-padding';

const DASHBOARD_VIEW_PATH = 'v2/dashboards/view';

const shouldHideFavoriteButton = (): boolean => {
  const currentUrl = window.location.href;
  return currentUrl.includes(DASHBOARD_VIEW_PATH);
};

const DashboardBreadCrumb: React.FunctionComponent<{ dashboardDisplayName?: string }> = ({
  dashboardDisplayName,
}) => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);

  const { perspective } = usePerspective();
  const { theme } = usePatternFlyTheme();
  const navigate = useNavigate();

  const handleDashboardsClick = () => {
    navigate(getDashboardsListUrl(perspective));
  };

  const lightThemeColor = chart_color_blue_100.value;

  const darkThemeColor = chart_color_blue_300.value;

  const linkColor = theme == 'dark' ? lightThemeColor : darkThemeColor;

  return (
    <Breadcrumb ouiaId="perses-dashboards-breadcrumb">
      <BreadcrumbItem
        onClick={handleDashboardsClick}
        style={{
          cursor: 'pointer',
          color: linkColor,
          textDecoration: 'underline',
          paddingLeft: t_global_spacer_md.value,
        }}
        data-test={listPersesDashboardsDataTestIDs.PersesBreadcrumbDashboardItem}
      >
        {t('Dashboards')}
      </BreadcrumbItem>
      {dashboardDisplayName && (
        <BreadcrumbItem
          isActive
          data-test={listPersesDashboardsDataTestIDs.PersesBreadcrumbDashboardNameItem}
        >
          {dashboardDisplayName}
        </BreadcrumbItem>
      )}
    </Breadcrumb>
  );
};

const DashboardPageHeader: React.FunctionComponent<{ dashboardDisplayName?: string }> = ({
  dashboardDisplayName,
}) => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);
  const hideFavBtn = shouldHideFavoriteButton();

  return (
    <Stack>
      <StackItem>
        <DashboardBreadCrumb dashboardDisplayName={dashboardDisplayName} />
        <ListPageHeader
          title={t('Dashboards')}
          helpText={t('View and manage dashboards.')}
          hideFavoriteButton={hideFavBtn}
        />
      </StackItem>
      <StackItem>
        <Divider inset={{ default: 'insetMd' }} />
      </StackItem>
    </Stack>
  );
};

interface DashboardListPageHeaderProps {
  editableProjects: string[] | undefined;
  projectsWithPermissions: any[] | undefined;
  hasEditableProject: boolean;
  permissionsLoading: boolean;
  permissionsError: any;
}

const DashboardListPageHeader: React.FunctionComponent<DashboardListPageHeaderProps> = ({
  editableProjects,
  projectsWithPermissions,
  hasEditableProject,
  permissionsLoading,
  permissionsError,
}) => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);
  const hideFavBtn = shouldHideFavoriteButton();

  return (
    <ListPageHeader
      title={t('Dashboards')}
      helpText={t('View and manage dashboards.')}
      hideFavoriteButton={hideFavBtn}
    >
      <Split hasGutter isWrappable>
        <SplitItem>
          <DashboardCreateDialog
            editableProjects={editableProjects}
            projectsWithPermissions={projectsWithPermissions}
            hasEditableProject={hasEditableProject}
            permissionsLoading={permissionsLoading}
            permissionsError={permissionsError}
          />
        </SplitItem>
      </Split>
    </ListPageHeader>
  );
};

type MonitoringDashboardsPageProps = PropsWithChildren<{
  boardItems: CombinedDashboardMetadata[];
  changeBoard: (dashboardName: string) => void;
  dashboardDisplayName: string;
  activeProject?: string;
  editableProjects?: string[] | undefined;
  projectsWithPermissions?: any[] | undefined;
  hasEditableProject?: boolean;
  permissionsLoading?: boolean;
  permissionsError?: any;
}>;

export const DashboardHeader: FC<MonitoringDashboardsPageProps> = memo(
  ({ children, dashboardDisplayName }) => {
    const { t } = useTranslation(process.env.I18N_NAMESPACE);

    return (
      <>
        <DocumentTitle>{t('Metrics dashboards')}</DocumentTitle>
        <PagePadding top={t_global_spacer_md.value}>
          <DashboardPageHeader dashboardDisplayName={dashboardDisplayName} />
        </PagePadding>
        {children}
      </>
    );
  },
);

export const DashboardListHeader: FC<MonitoringDashboardsPageProps> = memo(
  ({
    children,
    editableProjects,
    projectsWithPermissions,
    hasEditableProject,
    permissionsLoading,
    permissionsError,
  }) => {
    const { t } = useTranslation(process.env.I18N_NAMESPACE);

    return (
      <>
        <DocumentTitle>{t('Metrics dashboards')}</DocumentTitle>
        <PagePadding right={t_global_spacer_xl.value}>
          <DashboardListPageHeader
            editableProjects={editableProjects}
            projectsWithPermissions={projectsWithPermissions}
            hasEditableProject={hasEditableProject}
            permissionsLoading={permissionsLoading}
            permissionsError={permissionsError}
          />
        </PagePadding>
        <Divider inset={{ default: 'insetMd' }} />
        {children}
      </>
    );
  },
);
