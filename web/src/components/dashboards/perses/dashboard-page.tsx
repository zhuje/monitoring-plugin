import { Overview } from '@openshift-console/dynamic-plugin-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FC } from 'react';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';
import { LoadingInline } from '../../console/console-shared/src/components/loading/LoadingInline';
import { PersesWrapper } from './PersesWrapper';
import { DashboardSkeleton } from './dashboard-skeleton';
import { DashboardEmptyState } from './emptystates/DashboardEmptyState';
import { ProjectEmptyState } from './emptystates/ProjectEmptyState';
import { useDashboardsData } from './hooks/useDashboardsData';
// import PersesBoard from './perses-dashboards';
import { ProjectBar } from './project/ProjectBar';
import { DashboardApp } from '@perses-dev/dashboards/dist/views/ViewDashboard/DashboardApp';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
});

const MonitoringDashboardsPage_: FC = () => {
  const {
    changeBoard,
    activeProjectDashboardsMetadata,
    combinedInitialLoad,
    activeProject,
    setActiveProject,
    dashboardName,
  } = useDashboardsData();

  if (combinedInitialLoad) {
    return <LoadingInline />;
  }

  if (!activeProject) {
    // If we have loaded all of the requests fully and there are no projects, then
    return <ProjectEmptyState />; // empty state
  }

  return (
    <>
      <PersesWrapper project={activeProject}>
        {activeProjectDashboardsMetadata.length === 0 ? (
          <DashboardEmptyState />
        ) : (
          <Overview>
            <DashboardSkeleton
              boardItems={activeProjectDashboardsMetadata}
              changeBoard={changeBoard}
              dashboardName={dashboardName}
              activeProject={activeProject}
            >
              <ProjectBar activeProject={activeProject} setActiveProject={setActiveProject} />

              {/* <PersesBoard /> */}
              <DashboardApp
                dashboardResource={activeProjectDashboardsMetadata[0].persesDashboard}
                isReadonly={false}
                isVariableEnabled={true}
                isDatasourceEnabled={true}
              />
            </DashboardSkeleton>
          </Overview>
        )}
      </PersesWrapper>
    </>
  );
};

const MonitoringDashboardsPageWrapper: FC = () => {
  return (
    <QueryParamProvider adapter={ReactRouter5Adapter}>
      <QueryClientProvider client={queryClient}>
        <MonitoringDashboardsPage_ />
      </QueryClientProvider>
    </QueryParamProvider>
  );
};

export default MonitoringDashboardsPageWrapper;
