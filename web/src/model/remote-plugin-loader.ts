import { PluginLoader } from '@perses-dev/plugin-system';
import { useMemo } from 'react';
import { PluginMetadata, PluginModuleResource } from '@perses-dev/plugin-system';

import { createInstance, ModuleFederation } from '@module-federation/enhanced/runtime';

// Set global variable for Perses plugin getPublicPath function
// This must be set before any Module Federation loading occurs
if (typeof window !== 'undefined') {
  (window as any).PERSES_PLUGIN_ASSETS_PATH = '/api/proxy/plugin/monitoring-console-plugin/perses';
  console.log('🔧 Set PERSES_PLUGIN_ASSETS_PATH:', (window as any).PERSES_PLUGIN_ASSETS_PATH);

  // Also set PERSES_APP_CONFIG as fallback
  (window as any).PERSES_APP_CONFIG = {
    api_prefix: '/api/proxy/plugin/monitoring-console-plugin/perses'
  };
  console.log('🔧 Set PERSES_APP_CONFIG:', (window as any).PERSES_APP_CONFIG);
}

import * as ReactQuery from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom';
import * as ReactHookForm from 'react-hook-form';
import * as ReactRouterDOM from 'react-router-dom';

let instance: ModuleFederation | null = null;
const getPluginRuntime = (): ModuleFederation => {
  if (instance === null) {
    const pluginRuntime = createInstance({
      name: '@perses/perses-ui-host',
      remotes: [], // all remotes are loaded dynamically
      shared: {
        react: {
          version: React.version,
          lib: () => React,
          shareConfig: {
            singleton: true,
            requiredVersion: `^${React.version}`,
          },
        },
        'react-dom': {
          version: '18.3.1',
          lib: () => ReactDOM,
          shareConfig: {
            singleton: true,
            requiredVersion: `^18.3.1`,
          },
        },
        'react-router-dom': {
          version: '6.26.0',
          lib: () => ReactRouterDOM,
          shareConfig: {
            singleton: true,
            requiredVersion: '^6.26.0',
          },
        },
        '@tanstack/react-query': {
          version: '4.39.1',
          lib: () => ReactQuery,
          shareConfig: {
            singleton: true,
            requiredVersion: '^4.39.1',
          },
        },
        'react-hook-form': {
          version: '7.52.2',
          lib: () => ReactHookForm,
          shareConfig: {
            singleton: true,
            requiredVersion: '^7.52.2',
          },
        },
        echarts: {
          version: '5.5.0',
          lib: () => require('echarts'),
          shareConfig: {
            singleton: true,
            requiredVersion: '^5.5.0',
          },
        },
        '@perses-dev/core': {
          version: '0.51.0-rc.1',
          lib: () => require('@perses-dev/core'),
          shareConfig: {
            singleton: true,
            requiredVersion: '^0.51.0-rc.1',
          },
        },
        '@perses-dev/components': {
          version: '0.51.0-rc.1',
          lib: () => require('@perses-dev/components'),
          shareConfig: {
            singleton: true,
            requiredVersion: '^0.51.0-rc.1',
          },
        },
        '@perses-dev/plugin-system': {
          version: '0.51.0-rc.1',
          lib: () => require('@perses-dev/plugin-system'),
          shareConfig: {
            singleton: true,
            requiredVersion: '^0.51.0-rc.1',
          },
        },
        '@perses-dev/explore': {
          version: '0.51.0-rc.1',
          lib: () => require('@perses-dev/explore'),
          shareConfig: {
            singleton: true,
            requiredVersion: '^0.51.0-rc.1',
          },
        },
        '@perses-dev/dashboards': {
          version: '0.51.0-rc.1',
          lib: () => require('@perses-dev/dashboards'),
          shareConfig: {
            singleton: true,
            requiredVersion: '^0.51.0-rc.1',
          },
        },
        // Below are the shared modules that are used by the plugins, this can be part of the SDK
        'date-fns': {
          version: '4.1.0',
          lib: () => require('date-fns'),
          shareConfig: {
            singleton: true,
            requiredVersion: '^4.1.0',
          },
        },
        'date-fns-tz': {
          version: '3.2.0',
          lib: () => require('date-fns-tz'),
          shareConfig: {
            singleton: true,
            requiredVersion: '^3.2.0',
          },
        },
        lodash: {
          version: '4.17.21',
          lib: () => require('lodash'),
          shareConfig: {
            singleton: true,
            requiredVersion: '^4.17.21',
          },
        },
        '@emotion/react': {
          version: '11.11.3',
          lib: () => require('@emotion/react'),
          shareConfig: {
            singleton: true,
            requiredVersion: '^11.11.3',
          },
        },
        '@emotion/styled': {
          version: '11.11.0',
          lib: () => require('@emotion/styled'),
          shareConfig: {
            singleton: true,
            requiredVersion: '^11.11.0',
          },
        },
        '@hookform/resolvers/zod': {
          version: '3.3.4',
          lib: () => require('@hookform/resolvers/zod'),
          shareConfig: {
            singleton: true,
            requiredVersion: '^3.3.4',
          },
        },
        'use-resize-observer': {
          version: '9.1.0',
          lib: () => require('use-resize-observer'),
          shareConfig: {
            singleton: true,
            requiredVersion: '^9.1.0',
          },
        },
        'mdi-material-ui': {
          version: '7.4.0',
          lib: () => require('mdi-material-ui'),
          shareConfig: {
            singleton: true,
            requiredVersion: '^7.4.0',
          },
        },
        immer: {
          version: '10.1.1',
          lib: () => require('immer'),
          shareConfig: {
            singleton: true,
            requiredVersion: '^10.1.1',
          },
        },
      },
    });

    instance = pluginRuntime;

    return instance;
  }
  return instance;
};

const registerRemote = (name: string, baseURL?: string): void => {
  const pluginRuntime = getPluginRuntime();
  const existingRemote = pluginRuntime.options.remotes.find((remote) => remote.name === name);

  if (!existingRemote) {
    const remoteEntryURL = baseURL
      ? `${baseURL}/${name}/mf-manifest.json`
      : `/plugins/${name}/mf-manifest.json`;

    pluginRuntime.registerRemotes([
      {
        name,
        entry: remoteEntryURL,
        alias: name,
      },
    ]);
  }
};

// Store the original fetch function to intercept manifest requests
const originalFetch = window.fetch;

// Intercept manifest fetches to modify static publicPath
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

  console.log('🌐 Fetch intercepted:', url);

  // Check if this is a manifest request
  if (url.includes('/mf-manifest.json')) {
    console.log('📄 Processing manifest:', url);
    const response = await originalFetch(input, init);

    if (response.ok) {
      const manifest = await response.json();
      console.log('📋 Original manifest metaData:', manifest.metaData);

      // Check if manifest has static publicPath that needs transformation
      if (manifest.metaData?.publicPath && manifest.metaData.publicPath.startsWith('/plugins/')) {
        const pluginName = manifest.id || manifest.name;
        const proxyPath = `/api/proxy/plugin/monitoring-console-plugin/perses`;

        console.log(`🔄 Transforming static publicPath for ${pluginName}:`,
                   manifest.metaData.publicPath, '->', `${proxyPath}${manifest.metaData.publicPath}`);

        // Transform the publicPath to include proxy
        manifest.metaData.publicPath = `${proxyPath}${manifest.metaData.publicPath}`;
      }

      // Also check for getPublicPath function and log it
      if (manifest.metaData?.getPublicPath) {
        console.log(`✅ Found getPublicPath function for ${manifest.id || manifest.name}:`, manifest.metaData.getPublicPath);
      }

      console.log('📋 Modified manifest metaData:', manifest.metaData);

      // Return a new response with the modified manifest
      return new Response(JSON.stringify(manifest), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }
  }

  return originalFetch(input, init);
};

export const loadPlugin = async (
  moduleName: string,
  pluginName: string,
  baseURL?: string,
): Promise<RemotePluginModule | null> => {
  registerRemote(moduleName, baseURL);

  const pluginRuntime = getPluginRuntime();

  return pluginRuntime.loadRemote<RemotePluginModule>(`${moduleName}/${pluginName}`);
};

export interface PersesPlugin {
  name: string;
  moduleName: string;
  baseURL?: string;
}

export type RemotePluginModule = Record<string, unknown>;

const isPluginMetadata = (plugin: unknown): plugin is PluginMetadata => {
  return (
    typeof plugin === 'object' &&
    plugin !== null &&
    'kind' in plugin &&
    'spec' in plugin &&
    typeof plugin.spec === 'object' &&
    plugin.spec !== null &&
    'name' in plugin.spec
  );
};

const isPluginModuleResource = (pluginModule: unknown): pluginModule is PluginModuleResource => {
  return (
    typeof pluginModule === 'object' &&
    pluginModule !== null &&
    'metadata' in pluginModule &&
    'spec' in pluginModule &&
    typeof pluginModule.spec === 'object' &&
    pluginModule.spec !== null &&
    'plugins' in pluginModule.spec &&
    Array.isArray(pluginModule.spec.plugins) &&
    pluginModule.spec.plugins.every(isPluginMetadata)
  );
};

type RemotePluginLoaderOptions = {
  /**
   * The API path for fetching available Perses plugins.
   * Used to construct the full URL to the `/api/v1/plugins` endpoint.
   * @default ''
   **/
  apiPrefix?: string;
  /**
   * The base URL for loading plugin assets (e.g., JavaScript files).
   * Used to construct the full URL to the `/plugins` directory
   * @default ''
   **/
  baseURL?: string;
};

// type ParsedPluginOptions = {
//   pluginsApiPath: string;
//   pluginsAssetsPath: string;
// };

const DEFAULT_PLUGINS_API_PATH = '/api/v1/plugins';
const DEFAULT_PLUGINS_ASSETS_PATH = '/plugins';

// const paramToOptions = (options?: RemotePluginLoaderOptions): ParsedPluginOptions => {
//   if (options === undefined) {
//     return {
//       pluginsApiPath: DEFAULT_PLUGINS_API_PATH,
//       pluginsAssetsPath: DEFAULT_PLUGINS_ASSETS_PATH,
//     };
//   }

//   return {
//     pluginsApiPath: `${options?.apiPrefix ?? ''}${DEFAULT_PLUGINS_API_PATH}`,
//     pluginsAssetsPath: `${options?.baseURL ?? ''}${DEFAULT_PLUGINS_ASSETS_PATH}`,
//   };
// };

/**
 * Get a PluginLoader that fetches the list of
 * installed plugins from a remote server and loads them as needed.
 * @param options - Optional configuration options for the remote plugin loader.
 */
export function remotePluginLoader(_options?: RemotePluginLoaderOptions): PluginLoader {
  // const { ApiPath, AssetsPath } = paramToOptions(options);

  const pluginsApiPath =
    '/api/proxy/plugin/monitoring-console-plugin/perses' + DEFAULT_PLUGINS_API_PATH;
  const pluginsAssetsPath =
    '/api/proxy/plugin/monitoring-console-plugin/perses' + DEFAULT_PLUGINS_ASSETS_PATH;

  return {
    getInstalledPlugins: async (): Promise<PluginModuleResource[]> => {
      const pluginsResponse = await fetch(pluginsApiPath);

      const plugins = await pluginsResponse.json();

      let pluginModules: PluginModuleResource[] = [];

      if (Array.isArray(plugins)) {
        pluginModules = plugins.filter(isPluginModuleResource);
      } else {
        console.error('RemotePluginLoader: Error loading plugins, response is not an array');
      }

      if (!pluginModules.length) {
        console.error('RemotePluginLoader: No valid plugins found');
      }

      return pluginModules;
    },
    importPluginModule: async (resource): Promise<RemotePluginModule> => {
      const pluginModuleName = resource.metadata.name;

      const pluginModule: RemotePluginModule = {};

      for (const plugin of resource.spec.plugins) {
        const remotePluginModule = await loadPlugin(
          pluginModuleName,
          plugin.spec.name,
          pluginsAssetsPath,
        );

        const remotePlugin = remotePluginModule?.[plugin.spec.name];
        if (remotePlugin) {
          pluginModule[plugin.spec.name] = remotePlugin;
        } else {
          console.error(`RemotePluginLoader: Error loading plugin ${plugin.spec.name}`);
        }
      }

      return pluginModule;
    },
  };
}

export function useApiPrefix(): string {
  // Use the build-time injected API prefix, fallback to proxy base path
  // Access the config lazily to avoid circular dependencies
  const apiPrefix =
    typeof process !== 'undefined' && process.env?.API_PREFIX ? process.env.API_PREFIX : '';
  return apiPrefix || '/api/proxy/plugin/monitoring-console-plugin/perses';
}

export function getBasePathName(): string {
  // Return the current window base pathname
  return window.location.pathname.split('/').slice(0, -1).join('/') || '';
}

export function useRemotePluginLoader(): PluginLoader {
  const apiPrefix = useApiPrefix();
  // const baseUrl = getBasePathName();

  const pluginLoader = useMemo(
    () => remotePluginLoader({ baseURL: apiPrefix, apiPrefix }),
    [apiPrefix],
  );

  return pluginLoader;
}
