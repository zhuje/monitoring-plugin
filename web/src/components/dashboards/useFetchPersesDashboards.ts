import * as React from 'react';
import * as _ from 'lodash';
import { useSafeFetch } from '../console/utils/safe-fetch-hook';
import { useBoolean } from '../hooks/useBoolean';

export const useFetchPersesDashboards = (): [[], boolean, string] => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const safeFetch = React.useCallback(useSafeFetch(), []);
  const [boards, setBoards] = React.useState();
  const [error, setError] = React.useState<string>();
  const [isLoading, , , setLoaded] = useBoolean(true);

  const PERSES_ENDPOINT = '/api/proxy/plugin/monitoring-plugin/perses/';

  React.useEffect(() => {
    safeFetch(PERSES_ENDPOINT)
      .then((response) => {
        setLoaded();
        setError(undefined);
        setBoards(response.json);
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
