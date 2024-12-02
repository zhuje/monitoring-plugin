import * as React from 'react';
import * as _ from 'lodash';
import { useSafeFetch } from '../console/utils/safe-fetch-hook';
import { useBoolean } from '../hooks/useBoolean';

export const useFetchPersesDashboards = (): [[], boolean, string] => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const safeFetch = React.useCallback(useSafeFetch(), []);
  const [boards, setBoards] = React.useState();
  const [error, setError] = React.useState<string>();
  const [isLoading, , setLoaded] = useBoolean(false);

  const PERSES_ENDPOINT_LIST_DASHBOARDS_METADATA =
    '/api/proxy/plugin/monitoring-console-plugin/perses/api/v1/dashboards?metadata_only=true';

  React.useEffect(() => {
    safeFetch(PERSES_ENDPOINT_LIST_DASHBOARDS_METADATA)
      .then((response) => {
        console.log('API ressponse : ', JSON.stringify(response, null, 2));
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
  }, [safeFetch, setLoaded]);

  return [boards, isLoading, error];
};
