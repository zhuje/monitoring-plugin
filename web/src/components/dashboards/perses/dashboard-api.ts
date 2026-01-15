import { DashboardResource, StatusError } from '@perses-dev/core';
import buildURL from './perses/url-builder';
import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

const resource = 'dashboards';

const updateDashboard = async (entity: DashboardResource): Promise<DashboardResource> => {
  const url = buildURL({
    resource: resource,
    project: entity.metadata.project,
    name: entity.metadata.name,
  });

  return consoleFetchJSON.put(url, entity);
};

export const useUpdateDashboardMutation = (): UseMutationResult<
  DashboardResource,
  Error,
  DashboardResource
> => {
  const queryClient = useQueryClient();

  return useMutation<DashboardResource, Error, DashboardResource>({
    mutationKey: [resource],
    mutationFn: updateDashboard,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: [resource] });
    },
  });
};

// const createDashboard = (entity: DashboardResource): Promise<DashboardResource> => {
//   const url = buildURL({ resource: resource, project: entity.metadata.project });
//   return fetchJson<DashboardResource>(url, {
//     method: HTTPMethodPOST,
//     headers: HTTPHeader,
//     body: JSON.stringify(entity),
//   });
// };

const createDashboard = async (entity: DashboardResource): Promise<DashboardResource> => {
  const url = buildURL({
    resource: resource,
    project: entity.metadata.project,
    // Don't include name in URL for POST (create) - only for PUT (update)
  });

  return consoleFetchJSON.post(url, entity);
};

export const useCreateDashboardMutation = (
  onSuccess?: (data: DashboardResource, variables: DashboardResource) => Promise<unknown> | unknown,
): UseMutationResult<DashboardResource, StatusError, DashboardResource> => {
  const queryClient = useQueryClient();

  return useMutation<DashboardResource, StatusError, DashboardResource>({
    mutationKey: [resource],
    mutationFn: (dashboard) => {
      return createDashboard(dashboard);
    },
    onSuccess: onSuccess,
    onSettled: () => {
      return queryClient.invalidateQueries({ queryKey: [resource] });
    },
  });
};
