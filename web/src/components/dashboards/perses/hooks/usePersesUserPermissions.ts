import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { fetchPersesUserPermissions } from '../perses-client';
import { useAllAccessibleProjects } from './useAllAccessibleProjects';
import { usePerses } from './usePerses';

// TODO: These will be available in future versions of the plugin SDK
const getUser = (state: any) => state.sdkCore?.user;

interface ProjectInfo {
  metadata: {
    name: string;
    namespace: string;
  };
}

export const usePersesUserPermissions = () => {
  const user = useSelector(getUser);
  const username = user?.metadata?.name || user?.username;
  const { allProjects } = useAllAccessibleProjects();
  const { persesProjects, persesProjectsLoading } = usePerses();

  // eslint-disable-next-line no-console
  console.log('!JZ 1. usePersesUserPermissions >> ', { username });

  const {
    data: userPermissions,
    isLoading: permissionsLoading,
    error: permissionsError,
  } = useQuery({
    queryKey: ['perses-user-permissions', username],
    queryFn: () => fetchPersesUserPermissions(username),
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: true,
    retry: 2,
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.warn('Failed to fetch Perses user permissions:', error);
    },
  });

  // eslint-disable-next-line no-console
  console.log('!JZ 2. usePersesUserPermissions >> ', {
    userPermissions,
    permissionsLoading,
    permissionsError,
  });
  // eslint-disable-next-line no-console
  console.log('!JZ 3. usePersesUserPermissions userPermissions detailed >> ', userPermissions);

  const { editableProjects, projectsWithPermissions, usePersesUserPermissionsError } =
    useMemo(() => {
      if (permissionsLoading || persesProjectsLoading) {
        return {
          editableProjects: undefined,
          projectsWithPermissions: undefined,
          usePersesUserPermissionsError: 'Permissions are still loading',
        };
      }
      if (!userPermissions) {
        return {
          editableProjects: undefined,
          projectsWithPermissions: undefined,
          usePersesUserPermissionsError: 'User has no permissions',
        };
      }

      const editableProjectNames: string[] = [];
      const projects: ProjectInfo[] = [];

      // Create a combined list of all available projects (both Perses and OpenShift)
      const allAvailableProjects = new Set<string>();

      // Add all Perses projects
      persesProjects?.forEach((project) => {
        if (project.metadata?.name) {
          allAvailableProjects.add(project.metadata.name);
        }
      });

      // Add all OpenShift projects
      allProjects?.forEach((project) => {
        if (project.metadata?.name) {
          allAvailableProjects.add(project.metadata.name);
        }
      });

      // eslint-disable-next-line no-console
      console.log('!JZ Combined available projects:', {
        persesProjects: persesProjects?.map((p) => p.metadata?.name),
        openshiftProjects: allProjects?.map((p) => p.metadata?.name),
        combined: Array.from(allAvailableProjects),
      });

      Object.entries(userPermissions).forEach(([projectName, permissions]) => {
        // eslint-disable-next-line no-console
        console.log('!JZ 4. Processing project permissions:', { projectName, permissions });

        // Check if user has dashboard edit permissions (create, update, delete)
        const hasDashboardPermissions = permissions.some((permission) => {
          // eslint-disable-next-line no-console
          console.log('!JZ 5a. Permission details:', {
            permission,
            scope: permission.scopes,
            actions: permission.actions,
            permissionKeys: Object.keys(permission),
          });

          const allActions = permission.actions.includes('*');

          const individualActions =
            permission.actions.includes('create') &&
            permission.actions.includes('update') &&
            permission.actions.includes('delete');

          const hasPermission =
            permission.scopes.includes('Dashboard') && (individualActions || allActions);

          // eslint-disable-next-line no-console
          console.log('!JZ 5b. Checking permission:', { permission, hasPermission });
          return hasPermission;
        });

        // eslint-disable-next-line no-console
        console.log('!JZ 6. Project dashboard permissions result:', {
          projectName,
          hasDashboardPermissions,
        });

        if (hasDashboardPermissions) {
          // Handle wildcard permissions to all projects
          if (projectName === '*') {
            const allProjectNames = Array.from(allAvailableProjects);
            editableProjectNames.push(...allProjectNames);

            // Add all available projects to projects list
            allProjectNames.forEach((name) => {
              projects.push({
                metadata: {
                  name,
                  namespace: name,
                },
              });
            });
          } else if (projectName !== '*') {
            // Handle specific project permissions
            editableProjectNames.push(projectName);
            projects.push({
              metadata: {
                name: projectName,
                namespace: projectName,
              },
            });
          }
        } else if (projectName !== '*') {
          // Add projects the user has any permissions for (but not editable)
          projects.push({
            metadata: {
              name: projectName,
              namespace: projectName,
            },
          });
        }
      });

      return {
        editableProjects: editableProjectNames,
        projectsWithPermissions: projects,
      };
    }, [permissionsLoading, persesProjectsLoading, userPermissions, allProjects, persesProjects]);

  const hasEditableProject = editableProjects ? editableProjects.length > 0 : false;

  return {
    userPermissions,
    editableProjects,
    projectsWithPermissions,
    hasEditableProject,
    permissionsLoading,
    permissionsError,
    username,
    usePersesUserPermissionsError,
  };
};
