// Copyright 2023 The Perses Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Typography, Stack, Button, Box, useTheme, useMediaQuery, Alert } from '@mui/material';
import { ErrorBoundary, ErrorAlert } from '@perses-dev/components';
import { TimeRangeControls } from '@perses-dev/plugin-system';
import { ReactElement, ReactNode, useCallback, useEffect } from 'react';
import { OnSaveDashboard, useDashboardActions, useEditMode } from '@perses-dev/dashboards';
import { AddPanelButton } from '@perses-dev/dashboards';
import { AddGroupButton } from '@perses-dev/dashboards';
import { DownloadButton } from '@perses-dev/dashboards';
import { EditVariablesButton } from '@perses-dev/dashboards';
import { EditDatasourcesButton } from '@perses-dev/dashboards';
import { EditJsonButton } from '@perses-dev/dashboards';
import { SaveDashboardButton } from '@perses-dev/dashboards';
import { DashboardStickyToolbar } from '@perses-dev/dashboards';

import PencilIcon from 'mdi-material-ui/PencilOutline';
// import { useTranslation } from 'react-i18next';
import { StackItem } from '@patternfly/react-core';
import { DashboardDropdown } from '../shared/dashboard-dropdown';
import * as _ from 'lodash-es';
import { useDashboardsData } from './hooks/useDashboardsData';

export interface DashboardToolbarProps {
  dashboardName: string;
  dashboardTitleComponent?: ReactNode;
  initialVariableIsSticky?: boolean;
  isReadonly: boolean;
  isVariableEnabled: boolean;
  isDatasourceEnabled: boolean;
  onEditButtonClick: () => void;
  onCancelButtonClick: () => void;
  onSave?: OnSaveDashboard;
}

export interface EditButtonProps {
  /**
   * The label used inside the button.
   */
  label?: string;

  /**
   * Handler that puts the dashboard into editing mode.
   */
  onClick: () => void;
}

export const EditButton = ({ label = 'Edit', onClick }: EditButtonProps): ReactElement => {
  return (
    <Button
      onClick={onClick}
      startIcon={<PencilIcon />}
      variant="outlined"
      color="secondary"
      sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }}
    >
      {label}
    </Button>
  );
};

export const OCPDashboardToolbar = (props: DashboardToolbarProps): ReactElement => {
  const {
    dashboardTitleComponent,
    initialVariableIsSticky,
    isReadonly,
    isVariableEnabled,
    isDatasourceEnabled,
    onEditButtonClick,
    onCancelButtonClick,
    onSave,
  } = props;

  const { isEditMode } = useEditMode();

  const isBiggerThanSm = useMediaQuery(useTheme().breakpoints.up('sm'));
  const isBiggerThanMd = useMediaQuery(useTheme().breakpoints.up('md'));

  const testId = 'dashboard-toolbar';

  const {
    changeBoard,
    activeProjectDashboardsMetadata: boardItems,
    activeProject,
    dashboardName,
  } = useDashboardsData();

  const dashboardTitle = dashboardTitleComponent ? (
    dashboardTitleComponent
  ) : (
    <Typography variant="h2">{dashboardName}</Typography>
  );

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
    [activeProject, boardItems, changeBoard, setDashboard],
  );

  useEffect(() => {
    onChangeBoard(dashboardName);
  }, [dashboardName, onChangeBoard]);

  return (
    <>
      <Stack data-testid={testId}>
        <Box
          px={2}
          py={1.5}
          display="flex"
          sx={{
            backgroundColor: (theme) => theme.palette.primary.main + (isEditMode ? '30' : '0'),
          }}
        >
          {dashboardTitle}
          {isEditMode ? (
            <Stack direction="row" gap={1} ml="auto">
              {isReadonly && (
                <Alert severity="warning" sx={{ backgroundColor: 'transparent', padding: 0 }}>
                  Dashboard managed via code only. Download JSON and commit changes to save.
                </Alert>
              )}
              <Stack direction="row" spacing={0.5} ml={1} whiteSpace="nowrap">
                {isVariableEnabled && <EditVariablesButton />}
                {isDatasourceEnabled && <EditDatasourcesButton />}
                <AddPanelButton />
                <AddGroupButton />
              </Stack>
              <SaveDashboardButton onSave={onSave} isDisabled={isReadonly} />
              <Button variant="outlined" onClick={onCancelButtonClick}>
                Cancel
              </Button>
            </Stack>
          ) : (
            <>
              {isBiggerThanSm && (
                <Stack direction="row" gap={1} ml="auto">
                  <EditButton onClick={onEditButtonClick} />
                </Stack>
              )}
            </>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            alignItems: 'start',
            padding: (theme) => theme.spacing(1, 2, 0, 2),
            flexDirection: isBiggerThanMd ? 'row' : 'column',
            flexWrap: 'nowrap',
            gap: 1,
          }}
        >
          <Box width="100%">
            <ErrorBoundary FallbackComponent={ErrorAlert}>
              {/* JZ DashboardDropdown  */}
              <Stack>
                {!_.isEmpty(boardItems) && (
                  <StackItem>
                    <DashboardDropdown
                      items={boardItems}
                      onChange={onChangeBoard}
                      selectedKey={dashboardName}
                    />
                  </StackItem>
                )}
              </Stack>
              <DashboardStickyToolbar
                initialVariableIsSticky={initialVariableIsSticky}
                sx={{
                  backgroundColor: ({ palette }) => palette.background.default,
                }}
              />
            </ErrorBoundary>
          </Box>
          <Stack direction="row" ml="auto" flexWrap="wrap" justifyContent="end">
            <Stack direction="row" spacing={1} mt={1} ml={1}>
              <TimeRangeControls />
              <DownloadButton />
              <EditJsonButton isReadonly={!isEditMode} />
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </>
  );
};
