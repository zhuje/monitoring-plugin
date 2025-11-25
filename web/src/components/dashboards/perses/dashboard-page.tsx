import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type FC } from 'react';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';
import { DashboardListPage } from './dashboard-list-page';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
});

const MonitoringDashboardsPage_: FC = () => {
  // Simply return the dashboard list page - all logic is handled there
  return <DashboardListPage />;
};

const MonitoringDashboardsPageWrapper: FC = () => {
  return (
    <QueryParamProvider adapter={ReactRouter5Adapter}>
      <QueryClientProvider client={queryClient}>
        <MonitoringDashboardsPage_ />
      </QueryClientProvider>
    </QueryParamProvider>
  );
};

export default MonitoringDashboardsPageWrapper;
