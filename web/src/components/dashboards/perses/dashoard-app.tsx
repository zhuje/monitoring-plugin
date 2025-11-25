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
import { useDataViewFilters, useDataViewSort } from '@patternfly/react-data-view';
import { DataViewTr, DataViewTh } from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import { ThProps } from '@patternfly/react-table';
import { useSearchParams } from 'react-router-dom-v5-compat';

const perPageOptions = [
  { title: '10', value: 10 },
  { title: '20', value: 20 },
];
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

const DASHBOARD_COLUMNS = [
  { label: 'Dashboard Name', key: 'name' as keyof DashboardRow, index: 0 },
  { label: 'Project', key: 'project' as keyof DashboardRow, index: 1 },
  { label: 'Created on', key: 'created' as keyof DashboardRow, index: 2 },
  { label: 'Last Modified', key: 'modified' as keyof DashboardRow, index: 3 },
];

const sortDashboardData = (
  data: DashboardRow[],
  sortBy: keyof DashboardRow | undefined,
  direction: 'asc' | 'desc' | undefined,
): DashboardRow[] =>
  sortBy && direction
    ? [...data].sort((a, b) =>
        direction === 'asc'
          ? a[sortBy] < b[sortBy]
            ? -1
            : a[sortBy] > b[sortBy]
            ? 1
            : 0
          : a[sortBy] > b[sortBy]
          ? -1
          : a[sortBy] < b[sortBy]
          ? 1
          : 0,
      )
    : data;

const DashboardsTable: React.FunctionComponent = () => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);

  const [searchParams, setSearchParams] = useSearchParams();
  const { sortBy, direction, onSort } = useDataViewSort({ searchParams, setSearchParams });

  const { filters, onSetFilters, clearAllFilters } = useDataViewFilters<DashboardRowFilters>({
    initialFilters: { name: '', project: '' },
    searchParams,
    setSearchParams,
  });
  const pagination = useDataViewPagination({ perPage: 5 });
  const { page, perPage } = pagination;

  const { persesDashboards, persesDashboardsLoading } = usePerses();

  const sortByIndex = useMemo(
    () => DASHBOARD_COLUMNS.findIndex((item) => item.key === sortBy),
    [sortBy],
  );

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: sortByIndex,
      direction,
      defaultDirection: 'asc',
    },
    onSort: (_event, index, direction) => onSort(_event, DASHBOARD_COLUMNS[index].key, direction),
    columnIndex,
  });

  const tableColumns: DataViewTh[] = DASHBOARD_COLUMNS.map((column, index) => ({
    cell: t(column.label),
    props: { sort: getSortParams(index) },
  }));

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

  const sortedAndFilteredData = useMemo(
    () => sortDashboardData(filteredData, sortBy as keyof DashboardRow, direction),
    [filteredData, sortBy, direction],
  );

  const pageRows: DataViewTr[] = useMemo(
    () =>
      sortedAndFilteredData
        .slice((page - 1) * perPage, (page - 1) * perPage + perPage)
        .map(({ name, project, created, modified }) => [name, project, created, modified]),
    [page, perPage, sortedAndFilteredData],
  );

  const PaginationTool = () => {
    return (
      <Pagination
        perPageOptions={perPageOptions}
        itemCount={sortedAndFilteredData.length}
        {...pagination}
      />
    );
  };

  return (
    <DataView>
      <DataViewToolbar
        ouiaId="PersesDashList-DataViewHeader"
        clearAllFilters={clearAllFilters}
        pagination={<PaginationTool />}
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
      <DataViewTable
        aria-label="Perses Dashboards List"
        ouiaId={'PersesDashList-DataViewTable'}
        columns={tableColumns}
        rows={pageRows}
      />
      <DataViewToolbar ouiaId="PersesDashList-DataViewFooter" pagination={PaginationTool} />
    </DataView>
  );
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

      <DashboardsTable />

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
