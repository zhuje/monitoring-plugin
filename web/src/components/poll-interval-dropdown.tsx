import * as _ from 'lodash';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import {
  Select,
  SelectList,
  SelectOption,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';

import { SelectOptionProps } from '@patternfly/react-core/dist/esm/components/Select';

import { useBoolean } from './hooks/useBoolean';

interface SimpleSelectOption extends Omit<SelectOptionProps, 'content'> {
  /** Content of the select option. */
  content: React.ReactNode;
  /** Value of the select option. */
  value: string | number;
}
// TODO: These will be available in future versions of the plugin SDK
import { formatPrometheusDuration, parsePrometheusDuration } from './console/utils/datetime';

const OFF_KEY = 'OFF_KEY';

type Props = {
  interval: number;
  setInterval: (v: number) => void;
  id?: string;
};

const IntervalDropdown: React.FC<Props> = ({ id, interval, setInterval }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<SimpleSelectOption | undefined>();
  const { t } = useTranslation('plugin__monitoring-plugin');

  const initialOptions: SimpleSelectOption[] = [
    { content: t('Refresh off'), value: OFF_KEY },
    { content: t('{{count}} second', { count: 15 }), value: '15s' },
    { content: t('{{count}} second', { count: 30 }), value: '30s' },
    { content: t('{{count}} minute', { count: 1 }), value: '1m' },
    { content: t('{{count}} minute', { count: 15 }), value: '15m' },
    { content: t('{{count}} hour', { count: 1 }), value: '1h' },
    { content: t('{{count}} hour', { count: 2 }), value: '2h' },
    { content: t('{{count}} hour', { count: 1 }), value: '1d' },
  ];

  React.useEffect(() => {
    const selectedOption = initialOptions?.find((option) => option.selected);
    setSelected(selectedOption);
  }, []);

  const simpleSelectOptions = initialOptions?.map((option) => {
    const { content, value, ...props } = option;
    const isSelected = selected?.value === value;
    return (
      <SelectOption value={value} key={value} isSelected={isSelected} {...props}>
        {content}
      </SelectOption>
    );
  });

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    onSelect && onSelect(_event, value);
    setSelected(initialOptions.find((o) => o.value === value));
    setIsOpen(false);
  };

  const selectedKey = interval === null ? OFF_KEY : formatPrometheusDuration(interval);

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      id={`${id}-dropdown`}
      isExpanded={isOpen}
      className="monitoring-dashboards__dropdown-button"
    >
      {selected?.content || selectedKey}
    </MenuToggle>
  );

  return (
    <Select
      isOpen={isOpen}
      selected={selected}
      onSelect={onSelect}
      className="monitoring-dashboards__variable-dropdown"
      onOpenChange={(isOpen) => {
        setIsOpen(isOpen);
      }}
      toggle={toggle}
      shouldFocusToggleOnSelect
    >
      <SelectList>{simpleSelectOptions}</SelectList>
    </Select>
  );
};

export default IntervalDropdown;
