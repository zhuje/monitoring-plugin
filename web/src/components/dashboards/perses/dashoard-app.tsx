import { ReactElement, ReactNode, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { ChartsProvider, ErrorAlert, ErrorBoundary, useChartsTheme } from '@perses-dev/components';
import { DashboardResource, EphemeralDashboardResource } from '@perses-dev/core';
import { useDatasourceStore } from '@perses-dev/plugin-system';
import {
  PanelDrawer,
  Dashboard,
  PanelGroupDialog,
  DeletePanelGroupDialog,
  DashboardDiscardChangesConfirmationDialog,
  DeletePanelDialog,
  EmptyDashboardProps,
  EditJsonDialog,
  SaveChangesConfirmationDialog,
  LeaveDialog,
} from '@perses-dev/dashboards';
import {
  OnSaveDashboard,
  useDashboard,
  useDiscardChangesConfirmationDialog,
  useEditMode,
} from '@perses-dev/dashboards';
import { OCPDashboardToolbar } from './dashboard-toolbar';

import { Pagination } from '@patternfly/react-core';
import { DataViewToolbar } from '@patternfly/react-data-view/dist/dynamic/DataViewToolbar';
import { DataViewFilters } from '@patternfly/react-data-view/dist/dynamic/DataViewFilters';
import { DataViewTextFilter } from '@patternfly/react-data-view/dist/dynamic/DataViewTextFilter';
import { useDataViewPagination } from '@patternfly/react-data-view/dist/dynamic/Hooks';
import { DataView } from '@patternfly/react-data-view/dist/dynamic/DataView';
import { DataViewTable } from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import { usePerses } from './hooks/usePerses';
import { useTranslation } from 'react-i18next';
import { useDataViewFilters } from '@patternfly/react-data-view';
import { useSearchParams } from 'react-router-dom-v5-compat';

// const TableToolBar = () => {
//   return (
//     <DataViewToolbar
//       clearAllFilters={() => console.log('clearAllFilters called')}
//       filters={
//         <DataViewFilters onChange={() => console.log('onSetFilters calles')} values={{}}>
//           <DataViewTextFilter filterId="name" title="Name" placeholder="Filter by name" />
//           <DataViewTextFilter filterId="branch" title="Branch" placeholder="Filter by branch" />
//         </DataViewFilters>
//       }
//     />
//   );
// };

const perPageOptions = [
  { title: '10', value: 10 },
  { title: '20', value: 20 },
];

// interface Repository {
//   name: string;
//   branches: string | null;
//   prs: string | null;
//   workspaces: string;
//   lastCommit: string;
// }

// const repositories: Repository[] = [
//   {
//     name: 'Repository one',
//     branches: 'Branch one',
//     prs: 'Pull request one',
//     workspaces: 'Workspace one',
//     lastCommit: 'Timestamp one',
//   },
//   {
//     name: 'Repository two',
//     branches: 'Branch two',
//     prs: 'Pull request two',
//     workspaces: 'Workspace two',
//     lastCommit: 'Timestamp two',
//   },
//   {
//     name: 'Repository three',
//     branches: 'Branch three',
//     prs: 'Pull request three',
//     workspaces: 'Workspace three',
//     lastCommit: 'Timestamp three',
//   },
//   {
//     name: 'Repository four',
//     branches: 'Branch four',
//     prs: 'Pull request four',
//     workspaces: 'Workspace four',
//     lastCommit: 'Timestamp four',
//   },
//   {
//     name: 'Repository five',
//     branches: 'Branch five',
//     prs: 'Pull request five',
//     workspaces: 'Workspace five',
//     lastCommit: 'Timestamp five',
//   },
//   {
//     name: 'Repository six',
//     branches: 'Branch six',
//     prs: 'Pull request six',
//     workspaces: 'Workspace six',
//     lastCommit: 'Timestamp six',
//   },
// ];

// const rows = repositories.map((item) => Object.values(item));

// const columns = ['Repositories', 'Branches', 'Pull requests', 'Workspaces', 'Last commit'];

// const ouiaId = 'LayoutExample';

// const MyTable: React.FunctionComponent = () => {
//   const pagination = useDataViewPagination({ perPage: 5 });
//   const { page, perPage } = pagination;

//   const pageRows = useMemo(
//     () => rows.slice((page - 1) * perPage, (page - 1) * perPage + perPage),
//     [page, perPage],
//   );
//   return (
//     <DataView>
//       <TableToolBar />
//       <DataViewToolbar
//         ouiaId="DataViewHeader"
//         pagination={
//           <Pagination
//             perPageOptions={perPageOptions}
//             itemCount={repositories.length}
//             {...pagination}
//           />
//         }
//       />
//       <DataViewTable
//         aria-label="Repositories table"
//         ouiaId={ouiaId}
//         columns={columns}
//         rows={pageRows}
//       />
//       <DataViewToolbar
//         ouiaId="DataViewFooter"
//         pagination={
//           <Pagination
//             isCompact
//             perPageOptions={perPageOptions}
//             itemCount={repositories.length}
//             {...pagination}
//           />
//         }
//       />
//     </DataView>
//   );
// };

interface DashboardRow {
  name: string;
  project: string;
  created: string;
  modified: string;
}

type FilterableFields<T> = {
  [K in keyof T]?: string;
};
type DashboardRowFilters = FilterableFields<Pick<DashboardRow, 'name' | 'project'>>;

const DashboardsTable: React.FunctionComponent = () => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);

  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, onSetFilters, clearAllFilters } = useDataViewFilters<DashboardRowFilters>({
    initialFilters: { name: '', project: '' },
    searchParams,
    setSearchParams,
  });
  const pagination = useDataViewPagination({ perPage: 5 });
  const { page, perPage } = pagination;

  const { persesProjects, persesProjectsLoading, persesDashboards, persesDashboardsLoading } =
    usePerses();

  const tableCol = [t('Dashboard Name'), t('Project'), t('Created on'), t('Last Modified')];
  const tableRows: DashboardRow[] = useMemo(() => {
    if (persesDashboardsLoading) {
      return [];
    }
    return persesDashboards.map((board) => ({
      name: board?.metadata?.name,
      project: board?.metadata?.project,
      created: board?.metadata?.createdAt,
      modified: board?.metadata?.updatedAt,
    }));
  }, [persesDashboards, persesDashboardsLoading]);

  const filteredData = useMemo(
    () =>
      tableRows.filter(
        (item) =>
          (!filters.name ||
            item.name?.toLocaleLowerCase().includes(filters.name?.toLocaleLowerCase())) &&
          (!filters.project ||
            item.project?.toLocaleLowerCase().includes(filters.project?.toLocaleLowerCase())),
      ),
    [filters.name, filters.project, tableRows],
  );

  // const pageRows = useMemo(() => {
  //   const numRows = tableRows.map((item) => Object.values(item));
  //   return numRows.slice((page - 1) * perPage, (page - 1) * perPage + perPage);
  // }, [tableRows, page, perPage]);

  const pageRows = useMemo(
    () =>
      filteredData
        .slice((page - 1) * perPage, (page - 1) * perPage + perPage)
        .map((item) => Object.values(item)),
    [page, perPage, filteredData],
  );

  console.log('!JZ usePerses', {
    filteredData,
    dashboardRows: tableRows,
    persesProjects,
    persesProjectsLoading,
    persesDashboards,
    persesDashboardsLoading,
  });

  return (
    <DataView>
      <DataViewToolbar
        ouiaId="PersesDashList-DataViewHeader"
        clearAllFilters={clearAllFilters}
        pagination={
          <Pagination
            perPageOptions={perPageOptions}
            itemCount={filteredData.length}
            {...pagination}
          />
        }
        filters={
          <DataViewFilters onChange={(_e, values) => onSetFilters(values)} values={filters}>
            <DataViewTextFilter filterId="name" title="Name" placeholder="Filter by name" />
            <DataViewTextFilter
              filterId="project"
              title="Project"
              placeholder="Filter by project"
            />
          </DataViewFilters>
        }
      />
      {/* <DataViewToolbar
        ouiaId="PersesDashList-DataViewHeader"
        pagination={
          <Pagination
            perPageOptions={perPageOptions}
            itemCount={tableRows.length}
            {...pagination}
          />
        }
      /> */}
      <DataViewTable
        aria-label="Perses Dashboards List"
        ouiaId={'PersesDashList-DataViewTable'}
        columns={tableCol}
        rows={pageRows}
      />
      <DataViewToolbar
        ouiaId="PersesDashList-DataViewFooter"
        pagination={
          <Pagination
            perPageOptions={perPageOptions}
            itemCount={filteredData.length}
            {...pagination}
          />
        }
      />
    </DataView>
  );
};

const HelloWorld = () => {
  return <h1> Hello world!!! </h1>;
};

export interface DashboardAppProps {
  dashboardResource: DashboardResource | EphemeralDashboardResource;
  emptyDashboardProps?: Partial<EmptyDashboardProps>;
  isReadonly: boolean;
  isVariableEnabled: boolean;
  isDatasourceEnabled: boolean;
  isCreating?: boolean;
  isInitialVariableSticky?: boolean;
  // If true, browser confirmation dialog will be shown
  // when navigating away with unsaved changes (closing tab, ...).
  isLeavingConfirmDialogEnabled?: boolean;
  dashboardTitleComponent?: ReactNode;
  onSave?: OnSaveDashboard;
  onDiscard?: (entity: DashboardResource) => void;
}

export const OCPDashboardApp = (props: DashboardAppProps): ReactElement => {
  const {
    dashboardResource,
    emptyDashboardProps,
    isReadonly,
    isVariableEnabled,
    isDatasourceEnabled,
    isCreating,
    isInitialVariableSticky,
    isLeavingConfirmDialogEnabled,
    onSave,
    onDiscard,
  } = props;

  // ---------- Table Creation for Dashboard List

  // ---------- Table Creation for Dashboard List

  const chartsTheme = useChartsTheme();

  const { isEditMode, setEditMode } = useEditMode();
  const { dashboard, setDashboard } = useDashboard();
  const [originalDashboard, setOriginalDashboard] = useState<
    DashboardResource | EphemeralDashboardResource | undefined
  >(undefined);
  const { setSavedDatasources } = useDatasourceStore();

  const { openDiscardChangesConfirmationDialog, closeDiscardChangesConfirmationDialog } =
    useDiscardChangesConfirmationDialog();

  const handleDiscardChanges = (): void => {
    // Reset to the original spec and exit edit mode
    if (originalDashboard) {
      setDashboard(originalDashboard);
    }
    setEditMode(false);
    closeDiscardChangesConfirmationDialog();
    if (onDiscard) {
      onDiscard(dashboard as unknown as DashboardResource);
    }
  };

  const onEditButtonClick = (): void => {
    setEditMode(true);
    setOriginalDashboard(dashboard);
    setSavedDatasources(dashboard.spec.datasources ?? {});
  };

  const onCancelButtonClick = (): void => {
    // check if dashboard has been modified
    if (JSON.stringify(dashboard) === JSON.stringify(originalDashboard)) {
      setEditMode(false);
    } else {
      openDiscardChangesConfirmationDialog({
        onDiscardChanges: () => {
          handleDiscardChanges();
        },
        onCancel: () => {
          closeDiscardChangesConfirmationDialog();
        },
      });
    }
  };

  // Create Table for Dashboards List

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowX: 'hidden',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h1> --------- TESTING ----------- </h1>
      {/* 
      <MyTable /> */}

      <DashboardsTable />

      <h1> Hello World !! </h1>
      <h1> --------- TESTING ----------- </h1>

      <OCPDashboardToolbar
        dashboardName={dashboardResource.metadata.name}
        initialVariableIsSticky={isInitialVariableSticky}
        onSave={onSave}
        isReadonly={isReadonly}
        isVariableEnabled={isVariableEnabled}
        isDatasourceEnabled={isDatasourceEnabled}
        onEditButtonClick={onEditButtonClick}
        onCancelButtonClick={onCancelButtonClick}
      />
      <Box sx={{ paddingTop: 2, paddingX: 2, height: '100%' }}>
        <ErrorBoundary FallbackComponent={ErrorAlert}>
          <Dashboard
            emptyDashboardProps={{
              onEditButtonClick,
              ...emptyDashboardProps,
            }}
          />
        </ErrorBoundary>
        <ChartsProvider chartsTheme={chartsTheme} enablePinning={false} enableSyncGrouping={false}>
          <PanelDrawer />
        </ChartsProvider>
        <PanelGroupDialog />
        <DeletePanelGroupDialog />
        <DeletePanelDialog />
        <DashboardDiscardChangesConfirmationDialog />
        <EditJsonDialog isReadonly={!isEditMode} disableMetadataEdition={!isCreating} />
        <SaveChangesConfirmationDialog />
        {isLeavingConfirmDialogEnabled &&
          isEditMode &&
          (LeaveDialog({ original: originalDashboard, current: dashboard }) as ReactElement)}
      </Box>
    </Box>
  );
};
