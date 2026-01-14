import {
  fetchPersesProjects,
  fetchPersesDashboardsMetadata,
  fetchPersesDashboardsByProject,
} from '../perses-client';
import { useQuery } from '@tanstack/react-query';
import { NumberParam, useQueryParam } from 'use-query-params';
import { QueryParams } from '../../../query-params';

export const usePerses = (project?: string | number) => {
  const [refreshInterval] = useQueryParam(QueryParams.RefreshInterval, NumberParam);

  const {
    isLoading: persesProjectsLoading,
    error: persesProjectsError,
    data: persesProjects,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchPersesProjects,
    enabled: true,
    refetchInterval: refreshInterval,
  });

  const {
    isLoading: persesDashboardsLoading,
    error: persesDashboardsError,
    data: persesDashboards,
  } = useQuery({
    queryKey: ['dashboards'],
    queryFn: fetchPersesDashboardsMetadata,
    enabled: true,
    refetchInterval: refreshInterval,
  });

  const {
    isLoading: persesProjectDashboardsLoading,
    error: persesProjectDashboardsError,
    data: persesProjectDashboards,
  } = useQuery({
    queryKey: ['dashboards', 'project', project],
    queryFn: () => fetchPersesDashboardsByProject(project!),
    enabled: !!project,
    refetchInterval: refreshInterval,
  });

  return {
    // All Dashboards
    persesDashboards: persesDashboards ?? [],
    persesDashboardsError,
    persesDashboardsLoading,
    // All Projects
    persesProjectsLoading,
    persesProjects: persesProjects ?? [],
    persesProjectsError,
    // Dashboards of a given project
    persesProjectDashboards: persesProjectDashboards ?? [],
    persesProjectDashboardsError,
    persesProjectDashboardsLoading,
  };
};
