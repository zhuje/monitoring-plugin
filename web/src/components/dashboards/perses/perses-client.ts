import { useQuery } from '@tanstack/react-query';
import { getCSRFToken } from '../../proxied-fetch';
import { DashboardResource, ProjectResource, fetchJson } from '@perses-dev/core';
import { NumberParam, useQueryParam } from 'use-query-params';
import { QueryParams } from '../../query-params';

const baseURL = '/api/proxy/plugin/monitoring-console-plugin/perses';

export const fetchPersesDashboardsMetadata = (): Promise<DashboardResource[]> => {
  const listDashboardsMetadata = '/api/v1/dashboards';
  const persesURL = `${baseURL}${listDashboardsMetadata}`;

  return ocpPersesFetchJson<DashboardResource[]>(persesURL);
};

export const fetchPersesProjects = (): Promise<ProjectResource[]> => {
  const listProjectURL = '/api/v1/projects';
  const persesURL = `${baseURL}${listProjectURL}`;

  return ocpPersesFetchJson<ProjectResource[]>(persesURL);
};

export async function ocpPersesFetchJson<T>(url: string): Promise<T> {
  // Use perses fetch as base fetch call as it handles refresh tokens
  return fetchJson(url, {
    headers: {
      'X-CSRFToken': getCSRFToken(),
    },
  });
}

export const fetchPersesDashboard = async (
  project: string,
  dashboardName: string,
): Promise<DashboardResource> => {
  const getDashboardURL = `/api/v1/projects/${project}/dashboards/${dashboardName}`;
  const persesURL = `${baseURL}${getDashboardURL}`;

  return await ocpPersesFetchJson<DashboardResource>(persesURL);
};

export const useFetchPersesDashboard = (project: string, dashboardName: string) => {
  const [refreshInterval] = useQueryParam(QueryParams.RefreshInterval, NumberParam);

  const {
    isLoading: persesDashboardLoading,
    error: persesDashboardError,
    data: persesDashboard,
  } = useQuery({
    queryKey: ['dashboards', project, dashboardName],
    queryFn: () => fetchPersesDashboard(project, dashboardName),
    enabled: true,
    refetchInterval: refreshInterval,
  });

  return {
    persesDashboard,
    persesDashboardError,
    persesDashboardLoading,
  };
};
