import * as _ from 'lodash';
// TODO: These will be available in future versions of the plugin SDK
import { parsePrometheusDuration } from '../console/utils/datetime';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { removeQueryArgument, setQueryArgument } from '../console/utils/router';
import { dashboardsSetEndTime, dashboardsSetTimespan } from '../../actions/observe';
import { useBoolean } from '../hooks/useBoolean';
import CustomTimeRangeModal from './custom-time-range-modal';
import { usePerspective } from '../hooks/usePerspective';
import { SimpleSelect, SimpleSelectOption } from '../SimpleSelect';

const CUSTOM_TIME_RANGE_KEY = 'CUSTOM_TIME_RANGE_KEY';

const TimespanDropdown: React.FC = () => {
  const { t } = useTranslation('plugin__monitoring-plugin');

  const { perspective } = usePerspective();

  const [isModalOpen, , setModalOpen, setModalClosed] = useBoolean(false);
  const [selected, setSelected] = React.useState<string | undefined>('5m');

  const dispatch = useDispatch();
  const onChange = React.useCallback(
    (v: string) => {
      if (v === CUSTOM_TIME_RANGE_KEY) {
        setModalOpen();
      } else {
        setQueryArgument('timeRange', parsePrometheusDuration(v).toString());
        removeQueryArgument('endTime');
        dispatch(dashboardsSetTimespan(parsePrometheusDuration(v), perspective));
        dispatch(dashboardsSetEndTime(null, perspective));
      }
    },
    [perspective, dispatch, setModalOpen],
  );

  const initialOptions = React.useMemo<SimpleSelectOption[]>(() => {
    const intervalOptions: SimpleSelectOption[] = [
      { content: t('Last {{count}} minute', { count: 5 }), value: '5m' },
      { content: t('Last {{count}} minute', { count: 15 }), value: '15m' },
      { content: t('Last {{count}} minute', { count: 30 }), value: '30m' },
      { content: t('Last {{count}} hour', { count: 1 }), value: '1h' },
      { content: t('Last {{count}} hour', { count: 2 }), value: '2h' },
      { content: t('Last {{count}} hour', { count: 6 }), value: '6h' },
      { content: t('Last {{count}} hour', { count: 12 }), value: '12h' },
      { content: t('Last {{count}} day', { count: 1 }), value: '1d' },
      { content: t('Last {{count}} day', { count: 2 }), value: '2d' },
      { content: t('Last {{count}} week', { count: 1 }), value: '1w' },
      { content: t('Last {{count}} week', { count: 2 }), value: '2w' },
    ];
    return intervalOptions.map((o) => ({ ...o, selected: o.value === selected }));
  }, [selected, t]);

  return (
    <>
      <CustomTimeRangeModal
        perspective={perspective}
        isOpen={isModalOpen}
        setClosed={setModalClosed}
      />
      <div className="form-group monitoring-dashboards__dropdown-wrap">
        <label
          className="monitoring-dashboards__dropdown-title"
          htmlFor="monitoring-time-range-dropdown"
        >
          {t('Time range')}
        </label>
        <SimpleSelect
          id="monitoring-time-range-dropdown"
          initialOptions={initialOptions}
          className="monitoring-dashboards__variable-dropdown"
          onSelect={(_event, selection) => {
            if (selection) {
              onChange(String(selection));
            }
            setSelected(String(selection));
          }}
          toggleWidth="150px"
        />
      </div>
    </>
  );
};

export default TimespanDropdown;
