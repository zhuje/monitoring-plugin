import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CustomDataSource } from '../console/extensions/dashboard-data-source';

import { dashboardsSetEndTime, dashboardsSetTimespan } from '../../actions/observe';
import { FormatSeriesTitle, QueryBrowser } from '../query-browser';
import { RootState } from '../types';
import { DEFAULT_GRAPH_SAMPLES, getActivePerspective } from './monitoring-dashboard-utils';

type Props = {
  customDataSource?: CustomDataSource;
  formatSeriesTitle?: FormatSeriesTitle;
  isStack: boolean;
  pollInterval: number;
  queries: string[];
  showLegend?: boolean;
  units: string;
  onZoomHandle?: (timeRange: number, endTime: number) => void;
  namespace?: string;
  // setCsvData?: {};
};

const Graph: React.FC<Props> = ({
  customDataSource,
  formatSeriesTitle,
  isStack,
  pollInterval,
  queries,
  showLegend,
  units,
  onZoomHandle,
  namespace,
  // setCsvData,
}) => {
  const dispatch = useDispatch();
  const activePerspective = getActivePerspective(namespace);
  const endTime = useSelector(({ observe }: RootState) =>
    observe.getIn(['dashboards', activePerspective, 'endTime']),
  );
  const timespan = useSelector(({ observe }: RootState) =>
    observe.getIn(['dashboards', activePerspective, 'timespan']),
  );

  const onZoom = React.useCallback(
    (from, to) => {
      dispatch(dashboardsSetEndTime(to, activePerspective));
      dispatch(dashboardsSetTimespan(to - from, activePerspective));
      onZoomHandle?.(to - from, to);
    },
    [activePerspective, dispatch, onZoomHandle],
  );

  return (
    <QueryBrowser
      customDataSource={customDataSource}
      defaultSamples={DEFAULT_GRAPH_SAMPLES}
      fixedEndTime={endTime}
      formatSeriesTitle={formatSeriesTitle}
      hideControls
      isStack={isStack}
      onZoom={onZoom}
      pollInterval={pollInterval}
      queries={queries}
      showLegend={showLegend}
      timespan={timespan}
      units={units}
      namespace={namespace}
      // setCsvData={setCsvData}
    />
  );
};

export default Graph;
