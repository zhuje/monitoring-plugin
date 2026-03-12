import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type FC } from 'react';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouterV5CompatAdapter } from '../../console/utils/router';
import { DashboardList } from './dashboard-list';
import { ToastProvider } from './ToastProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const DashboardListPage: FC = () => {
  return (
    <QueryParamProvider adapter={ReactRouterV5CompatAdapter}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <DashboardList />
        </ToastProvider>
      </QueryClientProvider>
    </QueryParamProvider>
  );
};

export default DashboardListPage;
