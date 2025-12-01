import React, { ReactNode } from 'react';
import { DashboardEmptyState } from './emptystates/DashboardEmptyState';
import { DashboardSkeleton } from './dashboard-skeleton';
import { CombinedDashboardMetadata } from './hooks/useDashboardsData';
import { ProjectBar } from './project/ProjectBar';
import { PersesWrapper } from './PersesWrapper';
import { Overview } from '@openshift-console/dynamic-plugin-sdk';

export interface DashboardLayoutProps {
  /** Active project name */
  activeProject: string;
  /** Function to change active project */
  setActiveProject: (project: string) => void;
  /** Array of dashboard metadata for the active project */
  activeProjectDashboardsMetadata: CombinedDashboardMetadata[];
  /** Function to change selected dashboard */
  changeBoard: (boardName: string) => void;
  /** Currently selected dashboard name */
  dashboardName: string;
  /** Child content to render inside the dashboard layout */
  children: ReactNode;
}

/**
 * Reusable dashboard layout component that provides the standard structure
 * for dashboard pages including project bar, empty states, and skeleton layout.
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeProject,
  setActiveProject,
  activeProjectDashboardsMetadata,
  changeBoard,
  dashboardName,
  children,
}) => {
  return (
    <>
      <ProjectBar activeProject={activeProject} setActiveProject={setActiveProject} />
      <PersesWrapper project={activeProject}>
        {activeProjectDashboardsMetadata?.length === 0 ? (
          <DashboardEmptyState />
        ) : (
          <DashboardSkeleton
            boardItems={activeProjectDashboardsMetadata}
            changeBoard={changeBoard}
            dashboardName={dashboardName}
            activeProject={activeProject}
          >
            <Overview>{children}</Overview>
          </DashboardSkeleton>
        )}
      </PersesWrapper>
    </>
  );
};
