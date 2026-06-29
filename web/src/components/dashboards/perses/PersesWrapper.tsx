import '../../../perses-config';
import { ThemeProvider } from '@mui/material';
import { ChartThemeColor, getThemeColors } from '@patternfly/react-charts/victory';
import {
  ChartsProvider,
  generateChartsTheme,
  getTheme,
  PersesChartsTheme,
  SnackbarProvider,
} from '@perses-dev/components';
import {
  BuiltinVariableDefinition,
  DashboardResource,
  Definition,
  DurationString,
  UnknownSpec,
} from '@perses-dev/core';
import {
  DashboardProvider,
  DatasourceStoreProvider,
  VariableProviderWithQueryParams,
  PanelFocusProvider,
} from '@perses-dev/dashboards';
import {
  DataQueriesProvider,
  PluginLoader,
  PluginRegistry,
  RouterProvider,
  TimeRangeProviderWithQueryParams,
  useInitialRefreshInterval,
  useInitialTimeRange,
  usePluginBuiltinVariableDefinitions,
  ValidationProvider,
} from '@perses-dev/plugin-system';
import { ReactNode, useMemo } from 'react';
import { usePatternFlyTheme } from '../../hooks/usePatternflyTheme';
import { OcpDatasourceApi } from './datasource-api';
import { PERSES_PROXY_BASE_PATH, useFetchPersesDashboard } from './perses-client';
import { CachedDatasourceAPI } from './perses/datasource-cache-api';
import {
  chart_color_blue_300,
  chart_color_blue_400,
  chart_color_blue_500,
} from '@patternfly/react-tokens';
import { QueryParams } from '../../query-params';
import { StringParam, useQueryParam } from 'use-query-params';
import { useTranslation } from 'react-i18next';
import { LoadingBox } from '../../../components/console/console-shared/src/components/loading/LoadingBox';
import { remotePluginLoader } from '@perses-dev/plugin-system';
import { Link, useNavigate } from 'react-router';
import { mapPatternFlyThemeToMUI } from './patternfly-theme-bridge';

// Override eChart defaults with PatternFly colors.
const patternflyBlue300 = chart_color_blue_300.value;
const patternflyBlue400 = chart_color_blue_400.value;
const patternflyBlue500 = chart_color_blue_500.value;
const patternflyBlue600 = chart_color_blue_300.value;
const defaultPaletteColors = [patternflyBlue400, patternflyBlue500, patternflyBlue600];

const chartColorScale = getThemeColors(ChartThemeColor.multiUnordered).chart.colorScale;
const patternflyChartsMultiUnorderedPalette = Array.isArray(chartColorScale)
  ? chartColorScale.flatMap((cssColor) => {
      // colors stored as 'var(--pf-chart-theme--multi-color-unordered--ColorScale--3400, #73c5c5)'
      // need to extract the hex value, because fillStyle() of <canvas> does not support CSS vars
      const match = cssColor.match(/#[a-fA-F0-9]+/);
      return match ? [match[0]] : [];
    })
  : [];

interface PersesWrapperProps {
  children?: ReactNode;
  project: string;
}

export function useRemotePluginLoader(): PluginLoader {
  const pluginLoader = useMemo(
    () =>
      remotePluginLoader({
        baseURL: window.PERSES_PLUGIN_ASSETS_PATH,
        apiPrefix: window.PERSES_PLUGIN_ASSETS_PATH,
      }),
    [],
  );

  return pluginLoader;
}

export function PersesWrapper({ children, project }: PersesWrapperProps) {
  const { theme } = usePatternFlyTheme();
  const navigate = useNavigate();

  const muiTheme = getTheme(theme, {
    shape: {
      borderRadius: 6,
    },
    ...mapPatternFlyThemeToMUI(theme),
  });

  const chartsTheme: PersesChartsTheme = generateChartsTheme(muiTheme, {
    echartsTheme: {
      color: patternflyChartsMultiUnorderedPalette,
    },
    thresholds: {
      defaultColor: patternflyBlue300,
      palette: defaultPaletteColors,
    },
  });

  const pluginLoader = useRemotePluginLoader();

  return (
    <ThemeProvider theme={muiTheme}>
      <RouterProvider RouterComponent={Link} navigate={navigate}>
        <ChartsProvider chartsTheme={chartsTheme}>
          <SnackbarProvider
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="default"
          >
            <PluginRegistry pluginLoader={pluginLoader}>
              {!project ? (
                <>{children}</>
              ) : (
                <InnerWrapper project={project}>{children}</InnerWrapper>
              )}
            </PluginRegistry>
          </SnackbarProvider>
        </ChartsProvider>
      </RouterProvider>
    </ThemeProvider>
  );
}

interface InnerWrapperProps {
  children?: ReactNode;
  project: string;
}

function InnerWrapper({ children, project }: InnerWrapperProps) {
  const [dashboardName] = useQueryParam(QueryParams.Dashboard, StringParam);
  const { data } = usePluginBuiltinVariableDefinitions();
  const { persesDashboard, persesDashboardLoading } = useFetchPersesDashboard(
    project,
    dashboardName,
  );
  const DEFAULT_DASHBOARD_DURATION = '30m';
  const DEFAULT_REFRESH_INTERVAL = '0s';

  const dashboardDuration = persesDashboard?.spec?.duration;
  const dashboardTimeInterval = persesDashboard?.spec?.refreshInterval;

  const effectiveDuration = dashboardDuration || DEFAULT_DASHBOARD_DURATION;
  const effectiveRefreshInterval = dashboardTimeInterval || DEFAULT_REFRESH_INTERVAL;

  const initialTimeRange = useInitialTimeRange(effectiveDuration);
  const initialRefreshInterval = useInitialRefreshInterval(effectiveRefreshInterval);

  const builtinVariables = useMemo(() => {
    const result = [
      {
        kind: 'BuiltinVariable',
        spec: {
          name: '__dashboard',
          value: () => dashboardName,
          source: 'Dashboard',
          display: {
            name: '__dashboard',
            description: 'The name of the current dashboard',
            hidden: true,
          },
        },
      } as BuiltinVariableDefinition,
      {
        kind: 'BuiltinVariable',
        spec: {
          name: '__project',
          value: () => project,
          source: 'Dashboard',
          display: {
            name: '__project',
            description: 'The name of the current dashboard project',
            hidden: true,
          },
        },
      } as BuiltinVariableDefinition,
    ];
    if (data) {
      data.forEach((def: BuiltinVariableDefinition) => result.push(def));
    }
    return result;
  }, [data, project, dashboardName]);

  if (persesDashboardLoading) {
    return <LoadingBox />;
  }

  return (
    <TimeRangeProviderWithQueryParams
      initialTimeRange={initialTimeRange}
      initialRefreshInterval={initialRefreshInterval}
    >
      <VariableProviderWithQueryParams
        builtinVariableDefinitions={builtinVariables}
        initialVariableDefinitions={persesDashboard?.spec?.variables}
        key={persesDashboard?.metadata.name}
      >
        <PersesPrometheusDatasourceWrapper queries={[]} dashboardResource={persesDashboard}>
          {persesDashboard ? (
            <DashboardProvider
              initialState={{
                dashboardResource: persesDashboard,
              }}
            >
              <ValidationProvider>{children}</ValidationProvider>
            </DashboardProvider>
          ) : (
            <>{children}</>
          )}
        </PersesPrometheusDatasourceWrapper>
      </VariableProviderWithQueryParams>
    </TimeRangeProviderWithQueryParams>
  );
}

interface PersesPrometheusDatasourceWrapperProps {
  queries: Definition<UnknownSpec>[];
  dashboardResource?: DashboardResource;
  duration?: DurationString;
  children?: ReactNode;
}

export function PersesPrometheusDatasourceWrapper({
  queries,
  children,
  dashboardResource,
}: PersesPrometheusDatasourceWrapperProps) {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);
  const datasourceApi = useMemo(() => {
    return new CachedDatasourceAPI(new OcpDatasourceApi(t, PERSES_PROXY_BASE_PATH));
  }, [t]);

  return (
    <PanelFocusProvider>
      <DatasourceStoreProvider dashboardResource={dashboardResource} datasourceApi={datasourceApi}>
        <DataQueriesProvider definitions={queries}>{children}</DataQueriesProvider>
      </DatasourceStoreProvider>
    </PanelFocusProvider>
  );
}
