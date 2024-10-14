import React from 'react';
// import { Checkbox } from '@patternfly/react-core';
import { SimpleSelect, SimpleSelectOption } from '@patternfly/react-templates';
import { useDispatch } from 'react-redux';
// import { RootState } from './types';
import { queryBrowserSetPollInterval } from '../actions/observe';
import { parsePrometheusDuration } from './console/utils/datetime';
// import { useTranslation } from 'react-i18next';

// const Options: SimpleSelectOption[] = [
//   { content: 'Option 1', value: 'Option1' },
//   { content: 'Option 2', value: 'Option2', description: 'Option with description' },
//   { content: 'Option 3', value: 'Option3' },
// ];

export const SelectSimpleDemo: React.FunctionComponent = () => {
  const [selected, setSelected] = React.useState<string | undefined>('Option1');

  const dispatch = useDispatch();
  const setInterval = React.useCallback(
    (v: number) => dispatch(queryBrowserSetPollInterval(v)),
    [dispatch],
  );

  const OFF_KEY = 'OFF_KEY';

  const intervalOptions: SimpleSelectOption[] = [
    { content: 'Refresh off', value: 'OFF_KEY' },
    { content: '30 seconds', value: '30s' },
    { content: '1 minute', value: '1m' },
  ];

  //   {
  //     [OFF_KEY]: t('Refresh off'),
  //     '15s': t('{{count}} second', { count: 15 }),
  //     '30s': t('{{count}} second', { count: 30 }),
  //     '1m': t('{{count}} minute', { count: 1 }),
  //     '5m': t('{{count}} minute', { count: 5 }),
  //     '15m': t('{{count}} minute', { count: 15 }),
  //     '30m': t('{{count}} minute', { count: 30 }),
  //     '1h': t('{{count}} hour', { count: 1 }),
  //     '2h': t('{{count}} hour', { count: 2 }),
  //     '1d': t('{{count}} day', { count: 1 }),
  //   };

  //   const interval = useSelector(({ observe }: RootState) =>
  //     observe.getIn(['queryBrowser', 'pollInterval']),
  //   );

  const initialOptions = React.useMemo<SimpleSelectOption[]>(
    () => intervalOptions.map((o) => ({ ...o, selected: o.value === selected })),
    [selected],
  );

  //   const onSelect = React.useCallback(
  //     (v: string) => {
  //       setInterval(v === OFF_KEY ? null : parsePrometheusDuration(v));
  //       setSelected(v);
  //       console.log('JZ onSelect: ', v as string);
  //       console.log('JZ selected: ', selected);
  //     },
  //     [selected],
  //   );

  const onSelect = (_ev, selection) => {
    console.log('JZ selection: ', selection);
    setSelected(String(selection));
    console.log(
      'JZ parsePrometheusDuration(String(selection)) ',
      parsePrometheusDuration(String(selection)),
    );
    setInterval(parsePrometheusDuration(String(selection)));
  };

  return (
    <React.Fragment>
      <SimpleSelect
        initialOptions={initialOptions}
        onSelect={(_ev, selection) => onSelect(_ev, selection)}
      />
    </React.Fragment>
  );
};
