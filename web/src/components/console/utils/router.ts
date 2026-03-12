import * as _ from 'lodash-es';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom-v5-compat';

// Custom adapter for use-query-params that works with react-router-dom-v5-compat
export const ReactRouterV5CompatAdapter = ({
  children,
}: {
  children: (adapter: any) => React.ReactElement;
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const adapter = {
    replace(location2: { search?: string; state?: any }) {
      navigate(location2.search || '?', { replace: true, state: location2.state });
    },
    push(location2: { search?: string; state?: any }) {
      navigate(location2.search || '?', { replace: false, state: location2.state });
    },
    get location() {
      return location;
    },
  };

  return children(adapter);
};

export const getQueryArgument = (arg: string) =>
  new URLSearchParams(window.location.search).get(arg);

export const getAllQueryArguments = () => {
  const all: { [key: string]: string } = {};
  const params = new URLSearchParams(window.location.search);

  for (const [k, v] of params.entries()) {
    all[k] = v;
  }

  return all;
};

export const useRouterUtils = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const setQueryArgument = (k: string, v: string) => {
    const params = new URLSearchParams(location.search);
    if (params.get(k) !== v) {
      params.set(k, v);
      navigate(`${location.pathname}?${params.toString()}${location.hash}`, { replace: true });
    }
  };

  const setQueryArguments = (newParams: { [k: string]: string }) => {
    const params = new URLSearchParams(location.search);
    let update = false;
    _.each(newParams, (v, k) => {
      if (params.get(k) !== v) {
        update = true;
        params.set(k, v);
      }
    });
    if (update) {
      navigate(`${location.pathname}?${params.toString()}${location.hash}`, { replace: true });
    }
  };

  const setAllQueryArguments = (newParams: { [k: string]: string }) => {
    const params = new URLSearchParams();
    let update = false;
    _.each(newParams, (v, k) => {
      if (params.get(k) !== v) {
        update = true;
        params.set(k, v);
      }
    });
    if (update) {
      navigate(`${location.pathname}?${params.toString()}${location.hash}`, { replace: true });
    }
  };

  const removeQueryArgument = (k: string) => {
    const params = new URLSearchParams(location.search);
    if (params.has(k)) {
      params.delete(k);
      navigate(`${location.pathname}?${params.toString()}${location.hash}`, { replace: true });
    }
  };

  return {
    setQueryArgument,
    setQueryArguments,
    setAllQueryArguments,
    removeQueryArgument,
  };
};
