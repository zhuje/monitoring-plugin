import { useCallback, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom-v5-compat';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';
import { DashboardLayout } from './dashboard-layout';
import { useDashboardsData } from './hooks/useDashboardsData';
import { ProjectEmptyState } from './emptystates/ProjectEmptyState';
import { LoadingInline } from '../../console/console-shared/src/components/loading/LoadingInline';
import { OCPDashboardApp } from './dashboard-app';
import {
  DashboardResource,
  EphemeralDashboardResource,
  getResourceExtendedDisplayName,
} from '@perses-dev/core';
import buildURL from './perses/url-builder';
import { getCSRFToken } from '@openshift-console/dynamic-plugin-sdk/lib/utils/fetch/console-fetch-utils';
import { useSnackbar } from '@perses-dev/components';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const DashboardPage_: FC = () => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);
  const [searchParams] = useSearchParams();

  const {
    activeProjectDashboardsMetadata,
    changeBoard,
    dashboardName,
    setActiveProject,
    activeProject,
    combinedInitialLoad,
  } = useDashboardsData();

  const resource = 'dashboards';
  const HTTPMethodPUT = 'PUT';
  const HTTPHeader: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  async function updateDashboard(entity: DashboardResource): Promise<DashboardResource> {
    const url = buildURL({
      resource: resource,
      project: entity.metadata.project,
      name: entity.metadata.name,
    });

    const response = await fetch(url, {
      method: HTTPMethodPUT,
      headers: {
        ...HTTPHeader,
        'X-CSRFToken': getCSRFToken(),
      },
      body: JSON.stringify(entity),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  function useUpdateDashboardMutation(): UseMutationResult<
    DashboardResource,
    Error,
    DashboardResource
  > {
    const queryClient = useQueryClient();

    return useMutation<DashboardResource, Error, DashboardResource>({
      mutationKey: [resource],
      mutationFn: (dashboard) => {
        return updateDashboard(dashboard);
      },
      onSuccess: () => {
        return queryClient.invalidateQueries({ queryKey: [resource] });
      },
    });
  }

  const updateDashboardMutation = useUpdateDashboardMutation();
  const { successSnackbar, exceptionSnackbar } = useSnackbar();

  const handleDashboardSave = useCallback(
    (data: DashboardResource | EphemeralDashboardResource) => {
      if (data.kind !== 'Dashboard') {
        throw new Error('Invalid kind');
      }
      return updateDashboardMutation.mutateAsync(data, {
        onSuccess: (updatedDashboard: DashboardResource) => {
          successSnackbar(
            `Dashboard ${getResourceExtendedDisplayName(
              updatedDashboard,
            )} has been successfully updated`,
          );
          return updatedDashboard;
        },
        onError: (err) => {
          exceptionSnackbar(err);
          throw err;
        },
      });
    },
    [exceptionSnackbar, successSnackbar, updateDashboardMutation],
  );

  // Get dashboard and project from URL parameters
  const urlDashboard = searchParams.get('dashboard');
  const urlProject = searchParams.get('project');

  // Set active project if provided in URL
  if (urlProject && urlProject !== activeProject) {
    setActiveProject(urlProject);
  }

  // Change dashboard if provided in URL
  if (urlDashboard && urlDashboard !== dashboardName) {
    changeBoard(urlDashboard);
  }

  if (combinedInitialLoad) {
    return <LoadingInline />;
  }

  if (activeProjectDashboardsMetadata?.length === 0) {
    return <ProjectEmptyState />;
  }

  // Find the dashboard that matches either the URL parameter or the current dashboardName
  const targetDashboardName = urlDashboard || dashboardName;
  const currentDashboard = activeProjectDashboardsMetadata.find(
    (d) => d.name === targetDashboardName,
  );

  if (!currentDashboard) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>{t('Dashboard not found')}</h2>
        <p>
          {t('The dashboard "{{name}}" was not found in project "{{project}}".', {
            name: targetDashboardName,
            project: activeProject || urlProject,
          })}
        </p>
      </div>
    );
  }

  return (
    <DashboardLayout
      activeProject={activeProject}
      setActiveProject={setActiveProject}
      activeProjectDashboardsMetadata={activeProjectDashboardsMetadata}
      changeBoard={changeBoard}
      dashboardName={currentDashboard.name}
    >
      <OCPDashboardApp
        dashboardResource={currentDashboard.persesDashboard}
        isReadonly={false}
        isVariableEnabled={true}
        isDatasourceEnabled={true}
        onSave={handleDashboardSave}
        emptyDashboardProps={{
          title: t('Empty Dashboard'),
          description: t('To get started add something to your dashboard'),
        }}
      />
    </DashboardLayout>
  );
};

const DashboardPage: React.FC = () => {
  return (
    <QueryParamProvider adapter={ReactRouter5Adapter}>
      <QueryClientProvider client={queryClient}>
        <DashboardPage_ />
      </QueryClientProvider>
    </QueryParamProvider>
  );
};

export default DashboardPage;
