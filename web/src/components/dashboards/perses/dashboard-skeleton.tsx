// import * as _ from 'lodash-es';
import type { FC, PropsWithChildren } from 'react';
import { memo, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import {
  // Divider,
  PageSection,
  Split,
  SplitItem,
  // Stack,
  // StackItem,
  Title,
} from '@patternfly/react-core';
import {
  // DashboardStickyToolbar,
  useDashboardActions,
  // useVariableDefinitions,
} from '@perses-dev/dashboards';
// import { TimeRangeControls } from '@perses-dev/plugin-system';
// import { DashboardDropdown } from '../shared/dashboard-dropdown';
import { CombinedDashboardMetadata } from './hooks/useDashboardsData';
// import { EditButton } from './dashboard-toolbar';

const HeaderTop: FC = memo(() => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);

  console.log('Hello World!!!!!!');

  return (
    <Split hasGutter isWrappable>
      <SplitItem isFilled>
        <Title headingLevel="h1">{t('Dashboards')}</Title>
        {t('View and manage dashboards.')}
      </SplitItem>
      {/* <EditButton /> */}
      {/* <SplitItem>
        <Split hasGutter isWrappable>
          <SplitItem>
            <TimeRangeControls />
          </SplitItem>
        </Split>
      </SplitItem> */}
    </Split>
  );
});

type MonitoringDashboardsPageProps = PropsWithChildren<{
  boardItems: CombinedDashboardMetadata[];
  changeBoard: (dashboardName: string) => void;
  dashboardName: string;
  activeProject?: string;
}>;

export const DashboardSkeleton: FC<MonitoringDashboardsPageProps> = memo(
  ({ children, boardItems, changeBoard, dashboardName, activeProject }) => {
    const { t } = useTranslation(process.env.I18N_NAMESPACE);
    const { setDashboard } = useDashboardActions();
    // const variables = useVariableDefinitions();

    const onChangeBoard = useCallback(
      (selectedDashboard: string) => {
        changeBoard(selectedDashboard);

        const selectedBoard = boardItems.find(
          (item) =>
            item.name.toLowerCase() === selectedDashboard.toLowerCase() &&
            item.project?.toLowerCase() === activeProject?.toLowerCase(),
        );

        if (selectedBoard) {
          setDashboard(selectedBoard.persesDashboard);
        }
      },
      [changeBoard, boardItems, activeProject, setDashboard],
    );

    useEffect(() => {
      onChangeBoard(dashboardName);
    }, [dashboardName, onChangeBoard]);

    return (
      <>
        <Helmet>
          <title>{t('Metrics dashboards')}</title>
        </Helmet>
        <PageSection hasBodyWrapper={false}>
          <>
            <HeaderTop />

            {/* !Jz Previous Dashboard Dropdown */}
            {/* <Stack hasGutter>
              {!_.isEmpty(boardItems) && (
                <StackItem>
                  <DashboardDropdown
                    items={boardItems}
                    onChange={onChangeBoard}
                    selectedKey={dashboardName}
                  />
                </StackItem>
              )} */}
            {/* <StackItem>
              <Split>
                <SplitItem isFilled />
              </Split>
            </StackItem>*/}
            {/* </Stack> */}
          </>
        </PageSection>
        {/* <Divider /> */}
        {children}
      </>
    );
  },
);
