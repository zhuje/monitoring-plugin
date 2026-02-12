import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { PersesUserPermissions, useFetchPersesPermissions } from '../perses-client';
import { useOcpProjects } from './useOcpProjects';

interface Projects {
  editableProjects: string[] | undefined;
  projectsWithPermissions: string[] | undefined;
  usePersesUserPermissionsError: string;
}

const useUsername = (): string => {
  const getUser = (state: any) => state.sdkCore?.user;
  const user = useSelector(getUser);
  return user?.metadata?.name || user?.username;
};

const getEditableProjects = (
  persesUserPermissions: PersesUserPermissions,
  allAvailableProjects: Set<string>,
): string[] => {
  // Projects with Dashboard Actions 'create', 'edit', 'delete'
  const editableProjectNames: string[] = [];
  Object.entries(persesUserPermissions).forEach(([projectName, permissions]) => {
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
      } else if (projectName !== '*') {
        // Handle specific project permissions
        editableProjectNames.push(projectName);
      }
    }
  });
  return editableProjectNames;
};

export const usePersesUserPermissions = () => {
  const username = useUsername();
  const { ocpProjects } = useOcpProjects();

  console.log('!JZ 1. usePersesUserPermissions >> ', { username, allProjects: ocpProjects });

  const { persesUserPermissions, persesPermissionsLoading, persesPermissionsError } =
    useFetchPersesPermissions(username);

  console.log('!JZ 2. usePersesUserPermissions >> ', {
    userPermissions: persesUserPermissions,
    permissionsLoading: persesPermissionsLoading,
    permissionsError: persesPermissionsError,
  });

  const { editableProjects, projectsWithPermissions, usePersesUserPermissionsError }: Projects =
    useMemo(() => {
      if (persesPermissionsLoading) {
        return {
          editableProjects: undefined,
          projectsWithPermissions: undefined,
          usePersesUserPermissionsError: 'Permissions are still loading',
        };
      }
      if (!persesUserPermissions) {
        return {
          editableProjects: undefined,
          projectsWithPermissions: undefined,
          usePersesUserPermissionsError: 'User has no permissions',
        };
      }

      // Add all projects from Perses permissions (projects user has access to)
      const persesProjectNames = Object.keys(persesUserPermissions).filter((name) => name !== '*');
      console.log('!JZ 3. usePersesUserPermissions >> ', {
        persesProjectNames,
      });

      // Create a combined list of viewable projects (both Perses and OpenShift), use Set for dedup
      const allAvailableProjects = new Set<string>([...persesProjectNames]);

      // persesProjectNames.forEach((projectName) => {
      //   allAvailableProjects.add(projectName);
      // });

      console.log('!JZ 4. usePersesUserPermissions >> persesProjectNames + allAvailableProjects', {
        persesProjectNames,
      });

      // Add all OpenShift projects
      ocpProjects?.forEach((project) => {
        if (project.metadata?.name) {
          allAvailableProjects.add(project.metadata.name);
        }
      });

      console.log('!JZ 5. usePersesUserPermissions >> persesProjectNames + allAvailableProjects', {
        allAvailableProjects,
      });

      const editableProjectNames = getEditableProjects(persesUserPermissions, allAvailableProjects);

      console.log('!JZ 6. usePersesUserPermissions >> persesProjectNames + allAvailableProjects', {
        editableProjectNames,
      });

      // Sort projects alphabetically
      const sortedEditableProjects = editableProjectNames.sort();
      const sortedProjects = Array.from(allAvailableProjects).sort((a, b) => a.localeCompare(b));

      return {
        editableProjects: sortedEditableProjects,
        projectsWithPermissions: sortedProjects,
        usePersesUserPermissionsError: undefined,
      };
    }, [persesPermissionsLoading, persesUserPermissions, ocpProjects]);

  const hasEditableProject = useMemo(() => {
    return editableProjects ? editableProjects.length > 0 : false;
  }, [editableProjects]);

  return {
    editableProjects,
    projectsWithPermissions,
    hasEditableProject,
    permissionsLoading: persesPermissionsLoading,
    permissionsError: persesPermissionsError,
    usePersesUserPermissionsError,
  };
};
