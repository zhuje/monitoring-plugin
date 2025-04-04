import * as React from 'react';

import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartGroup,
  ChartLabel,
  ChartLegend,
  ChartThemeColor,
  ChartTooltip,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import { Bullseye, Card, CardBody, CardTitle, Spinner } from '@patternfly/react-core';
import { createIncidentsChartBars, formatDate, generateDateArray } from '../utils';
import { getResizeObserver } from '@patternfly/react-core';
import { useDispatch, useSelector } from 'react-redux';
import { setChooseIncident } from '../../../actions/observe';
import {
  t_global_color_status_warning_100,
  t_global_color_status_info_100,
  t_global_color_status_danger_100,
} from '@patternfly/react-tokens';
import { setAlertsAreLoading } from '../../../actions/observe';

const IncidentsChart = ({ incidentsData, chartDays, theme }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(true);
  const [chartData, setChartData] = React.useState();
  const [width, setWidth] = React.useState(0);
  const containerRef = React.useRef(null);
  const dateValues = generateDateArray(chartDays);
  const handleResize = () => {
    if (containerRef.current && containerRef.current.clientWidth) {
      setWidth(containerRef.current.clientWidth);
    }
  };
  React.useEffect(() => {
    const observer = getResizeObserver(containerRef.current, handleResize);
    handleResize();
    return () => observer();
  }, []);
  React.useEffect(() => {
    setIsLoading(false);
    setChartData(
      incidentsData.map((incident) => createIncidentsChartBars(incident, theme, dateValues)),
    );
  }, [incidentsData, theme, dateValues]);

  const selectedId = useSelector((state) =>
    state.plugins.mcp.getIn(['incidentsData', 'incidentGroupId']),
  );

  const clickHandler = (data, datum) => {
    if (datum.datum.group_id === selectedId) {
      dispatch(
        setChooseIncident({
          incidentGroupId: '',
        }),
      );
      dispatch(setAlertsAreLoading({ alertsAreLoading: true }));
    } else {
      dispatch(
        setChooseIncident({
          incidentGroupId: datum.datum.group_id,
        }),
      );
    }
  };

  return (
    <Card>
      <CardTitle>Incidents Timeline</CardTitle>
      {isLoading ? (
        <Bullseye>
          <Spinner aria-label="incidents-chart-spinner" />
        </Bullseye>
      ) : (
        <CardBody>
          <Chart
            containerComponent={
              <ChartVoronoiContainer
                labelComponent={
                  <ChartTooltip
                    orientation="top"
                    constrainToVisibleArea
                    labelComponent={<ChartLabel />}
                  />
                }
                labels={({ datum }) => {
                  if (datum.nodata) {
                    return null;
                  }
                  return `Severity: ${datum.name}
                    Component: ${datum.componentList?.join(', ')}
                    Incident ID: ${datum.group_id}
                    Start: ${formatDate(new Date(datum.y0), true)}
                    End: ${datum.firing ? '---' : formatDate(new Date(datum.y), true)}`;
                }}
              />
            }
            domainPadding={{ x: [30, 25] }}
            legendData={[
              {
                name: 'Critical',
                symbol: {
                  fill: t_global_color_status_danger_100.var,
                },
              },
              {
                name: 'Info',
                symbol: {
                  fill: t_global_color_status_info_100.var,
                },
              },
              {
                name: 'Warning',
                symbol: {
                  fill: t_global_color_status_danger_100.var,
                },
              },
            ]}
            legendComponent={<ChartLegend labelComponent={<ChartLabel />} />}
            legendPosition="bottom-left"
            //this should be always less than the container height
            padding={{
              bottom: 75, // Adjusted to accommodate legend
              left: 50,
              right: 25, // Adjusted to accommodate tooltip
              top: 50,
            }}
            width={width}
            themeColor={ChartThemeColor.purple}
          >
            <ChartAxis
              dependentAxis
              showGrid
              tickFormat={(t) =>
                new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }
              tickValues={dateValues}
              tickLabelComponent={<ChartLabel />}
            />
            <ChartGroup horizontal>
              {chartData.map((bar) => {
                return (
                  //we have several arrays and for each array we make a ChartBar
                  <ChartBar
                    data={bar}
                    key={bar.group_id}
                    events={[
                      {
                        eventHandlers: {
                          onClick: (props, datum) => clickHandler(props, datum),
                        },
                      },
                    ]}
                  />
                );
              })}
            </ChartGroup>
          </Chart>
        </CardBody>
      )}
    </Card>
  );
};

export default IncidentsChart;
