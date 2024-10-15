import React from 'react';
import { SimpleSelect, SimpleSelectOption } from '@patternfly/react-templates';
import { useDispatch } from 'react-redux';
import { queryBrowserSetPollInterval } from '../actions/observe';
import { parsePrometheusDuration } from './console/utils/datetime';
import { useTranslation } from 'react-i18next';

export const SelectSimpleDemo: React.FunctionComponent = () => {
  const OFF_KEY = 'OFF_KEY';
  const { t } = useTranslation('plugin__monitoring-plugin');
  const [selected, setSelected] = React.useState<string | undefined>(OFF_KEY);

  const dispatch = useDispatch();
  const setInterval = React.useCallback(
    (v: number) => dispatch(queryBrowserSetPollInterval(v)),
    [dispatch],
  );

  const intervalOptions: SimpleSelectOption[] = [
    { content: t('Refresh off'), value: OFF_KEY },
    { content: t('{{count}} second', { count: 15 }), value: '15s' },
    { content: t('{{count}} second', { count: 30 }), value: '30s' },
    { content: t('{{count}} minute', { count: 1 }), value: '1m' },
    { content: t('{{count}} minute', { count: 15 }), value: '15m' },
    { content: t('{{count}} hour', { count: 1 }), value: '1h' },
    { content: t('{{count}} hour', { count: 2 }), value: '2h' },
    { content: t('{{count}} hour', { count: 1 }), value: '1d' },
  ];

  const initialOptions = React.useMemo<SimpleSelectOption[]>(() => {
    return intervalOptions.map((o) => ({ ...o, selected: o.value === selected }));
  }, [selected]);

  const onSelect = (_ev, selection) => {
    setSelected(String(selection));
    setInterval(parsePrometheusDuration(String(selection)));
  };

  return (
    <React.Fragment>
      <SimpleSelect
        initialOptions={initialOptions}
        onSelect={(_ev, selection) => onSelect(_ev, selection)}
        placeholder={t('Refresh off')}
        className="monitoring-dashboards__variable-dropdown"
        toggleWidth="150px"
      />
    </React.Fragment>
  );
};
