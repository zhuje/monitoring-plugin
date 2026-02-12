import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { fetchPersesUserPermissions } from '../perses-client';
import { useAllAccessibleProjects } from './useAllAccessibleProjects';

const getUser = (state: any) => state.sdkCore?.user;

interface ProjectInfo {
  metadata: {
    name: string;
    namespace: string;
  };
  spec: {
    display: {
      name: string;
    };
  };
}

export const usePersesUserPermissions = () => {
  const user = useSelector(getUser);
  const username = user?.metadata?.name || user?.username;
  const { allProjects } = useAllAccessibleProjects();

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

  const { editableProjects, projectsWithPermissions, usePersesUserPermissionsError } =
    useMemo(() => {
      if (permissionsLoading) {
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

      // Add all projects from Perses permissions (projects user has access to)
      const persesProjectNames = Object.keys(userPermissions).filter((name) => name !== '*');
      persesProjectNames.forEach((projectName) => {
        allAvailableProjects.add(projectName);
      });

      // Add all OpenShift projects
      allProjects?.forEach((project) => {
        if (project.metadata?.name) {
          allAvailableProjects.add(project.metadata.name);
        }
      });

      Object.entries(userPermissions).forEach(([projectName, permissions]) => {
        // Check if user has dashboard edit permissions (create, update, delete)
        const hasDashboardPermissions = permissions.some((permission) => {
          const allActions = permission.actions.includes('*');

          const individualActions =
            permission.actions.includes('create') &&
            permission.actions.includes('update') &&
            permission.actions.includes('delete');

          const hasPermission =
            permission.scopes.includes('Dashboard') && (individualActions || allActions);

          return hasPermission;
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
                spec: {
                  display: {
                    name,
                  },
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
              spec: {
                display: {
                  name: projectName,
                },
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
            spec: {
              display: {
                name: projectName,
              },
            },
          });
        }
      });

      // Sort projects alphabetically for better UX
      const sortedEditableProjects = editableProjectNames.sort();
      const sortedProjects = projects.sort((a, b) =>
        a.metadata.name.localeCompare(b.metadata.name),
      );

      return {
        editableProjects: sortedEditableProjects,
        projectsWithPermissions: sortedProjects,
      };
    }, [permissionsLoading, userPermissions, allProjects]);

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
