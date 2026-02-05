import React, { ReactNode } from 'react';
import { DashboardListHeader } from './dashboard-header';
import { CombinedDashboardMetadata } from './hooks/useDashboardsData';
import { ProjectBar } from './project/ProjectBar';

interface DashboardListFrameProps {
  activeProject: string | null;
  setActiveProject: (project: string | null) => void;
  activeProjectDashboardsMetadata: CombinedDashboardMetadata[];
  changeBoard: (boardName: string) => void;
  dashboardName: string;
  children: ReactNode;
  editableProjects: string[] | undefined;
  projectsWithPermissions: any[] | undefined;
  hasEditableProject: boolean;
  permissionsLoading: boolean;
  permissionsError: any;
}

export const DashboardListFrame: React.FC<DashboardListFrameProps> = ({
  activeProject,
  setActiveProject,
  activeProjectDashboardsMetadata,
  changeBoard,
  dashboardName,
  children,
  editableProjects,
  projectsWithPermissions,
  hasEditableProject,
  permissionsLoading,
  permissionsError,
}) => {
  return (
    <>
      <ProjectBar activeProject={activeProject} setActiveProject={setActiveProject} />
      <DashboardListHeader
        boardItems={activeProjectDashboardsMetadata}
        changeBoard={changeBoard}
        dashboardDisplayName={dashboardName}
        activeProject={activeProject}
        editableProjects={editableProjects}
        projectsWithPermissions={projectsWithPermissions}
        hasEditableProject={hasEditableProject}
        permissionsLoading={permissionsLoading}
        permissionsError={permissionsError}
      >
        {children}
      </DashboardListHeader>
    </>
  );
};
