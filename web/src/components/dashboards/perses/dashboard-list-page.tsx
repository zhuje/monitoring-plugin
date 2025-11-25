import React, { ReactNode, useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from './dashboard-layout';
import { useDashboardsData } from './hooks/useDashboardsData';

import { Pagination } from '@patternfly/react-core';
import { DataViewToolbar } from '@patternfly/react-data-view/dist/dynamic/DataViewToolbar';
import { DataViewFilters } from '@patternfly/react-data-view/dist/dynamic/DataViewFilters';
import { DataViewTextFilter } from '@patternfly/react-data-view/dist/dynamic/DataViewTextFilter';
import { useDataViewPagination } from '@patternfly/react-data-view/dist/dynamic/Hooks';
import { DataView } from '@patternfly/react-data-view/dist/dynamic/DataView';
import { DataViewTable } from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import { usePerses } from './hooks/usePerses';
import { useDataViewFilters, useDataViewSort } from '@patternfly/react-data-view';
import { DataViewTr, DataViewTh } from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import { ThProps } from '@patternfly/react-table';
import { Link, useSearchParams } from 'react-router-dom-v5-compat';

const perPageOptions = [
  { title: '10', value: 10 },
  { title: '20', value: 20 },
];

interface DashboardName {
  link: ReactNode;
  label: string;
}

interface DashboardRow {
  name: DashboardName;
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
    ? [...data].sort((a, b) => {
        const aValue = sortBy === 'name' ? a.name.label : a[sortBy];
        const bValue = sortBy === 'name' ? b.name.label : b[sortBy];

        if (direction === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      })
    : data;

export const DashboardsTable: React.FunctionComponent = () => {
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
    return persesDashboards.map((board) => {
      const dashboardName: DashboardName = {
        link: (
          <Link
            to={`/monitoring/v2/dashboards/view?dashboard=${board?.metadata?.name}&project=${board?.metadata?.project}`}
            data-test={`perseslistpage-${board?.metadata?.name}`}
          >
            {board?.metadata?.name}
          </Link>
        ),
        label: board?.metadata?.name || '',
      };

      return {
        name: dashboardName,
        project: board?.metadata?.project || '',
        created: board?.metadata?.createdAt || '',
        modified: board?.metadata?.updatedAt || '',
      };
    });
  }, [persesDashboards, persesDashboardsLoading]);

  const filteredData = useMemo(
    () =>
      tableRows.filter(
        (item) =>
          (!filters.name ||
            item.name?.label?.toLocaleLowerCase().includes(filters.name?.toLocaleLowerCase())) &&
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
        .map(({ name, project, created, modified }) => [name.link, project, created, modified]),
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
      <h1> DASHBOARD-LIST-PAGE.TSX Hello world!! </h1>

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

export const DashboardListPage: FC = () => {
  const {
    activeProjectDashboardsMetadata,
    changeBoard,
    dashboardName,
    setActiveProject,
    activeProject,
  } = useDashboardsData();

  return (
    <DashboardLayout
      activeProject={activeProject}
      setActiveProject={setActiveProject}
      activeProjectDashboardsMetadata={activeProjectDashboardsMetadata}
      changeBoard={changeBoard}
      dashboardName={dashboardName}
    >
      <DashboardsTable />
    </DashboardLayout>
  );
};
