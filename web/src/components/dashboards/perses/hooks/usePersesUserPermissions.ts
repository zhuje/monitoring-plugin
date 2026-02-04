import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { fetchPersesUserPermissions } from '../perses-client';
import { useAllAccessibleProjects } from './useAllAccessibleProjects';

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
  const { allProjects, projectsLoaded } = useAllAccessibleProjects();

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

  console.log('!JZ 2. usePersesUserPermissions >> ', {
    userPermissions,
    permissionsLoading,
    permissionsError,
  });
  console.log('!JZ 3. usePersesUserPermissions userPermissions detailed >> ', userPermissions);

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

      Object.entries(userPermissions).forEach(([projectName, permissions]) => {
        console.log('!JZ 4. Processing project permissions:', { projectName, permissions });

        // Check if user has dashboard edit permissions (create, update, delete)
        const hasDashboardPermissions = permissions.some((permission) => {
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

          console.log('!JZ 5b. Checking permission:', { permission, hasPermission });
          return hasPermission;
        });

        console.log('!JZ 6. Project dashboard permissions result:', {
          projectName,
          hasDashboardPermissions,
        });

        if (hasDashboardPermissions) {
          // Handle wildcard permissions - expand to all actual projects
          if (projectName === '*' && projectsLoaded && allProjects?.length > 0) {
            const actualProjectNames = allProjects.map((project) => project.metadata?.name).filter(Boolean);
            editableProjectNames.push(...actualProjectNames);

            // Add all actual projects to projects list
            allProjects.forEach((project) => {
              if (project.metadata?.name) {
                projects.push({
                  metadata: {
                    name: project.metadata.name,
                    namespace: project.metadata.name,
                  },
                });
              }
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
    }, [userPermissions, permissionsLoading]);

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
