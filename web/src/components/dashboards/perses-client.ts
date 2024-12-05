import * as React from 'react';
import * as _ from 'lodash';
import { useSafeFetch } from '../console/utils/safe-fetch-hook';
import { useBoolean } from '../hooks/useBoolean';

type PersesHookResponse = [boards: [], isLoading: boolean, error: string];

const baseURL = '/api/proxy/plugin/monitoring-console-plugin/perses';
const PersesEndpoint = {
  listDashboardsMetadata: '/api/v1/dashboards?metadata_only=true',
};

const usePerses = (endpoint): PersesHookResponse => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const safeFetch = React.useCallback(useSafeFetch(), []);
  const [boards, setBoards] = React.useState();
  const [error, setError] = React.useState<string>();
  const [isLoading, , setLoaded] = useBoolean(false);

  const persesURL = `${baseURL}${endpoint}`;

  React.useEffect(() => {
    safeFetch(persesURL)
      .then((response) => {
        setError(undefined);
        setBoards(response);
        setLoaded();
      })
      .catch((err) => {
        setLoaded();
        if (err.name !== 'AbortError') {
          setError(_.get(err, 'json.error', err.message));
        }
      });
  }, [persesURL, safeFetch, setLoaded]);

  return [boards, isLoading, error];
};

export const usePersesClient = () => {
  const getDashboards = usePerses(PersesEndpoint.listDashboardsMetadata);
  return { getDashboards };
};
