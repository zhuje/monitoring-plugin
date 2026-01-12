import { ReactElement, ReactNode, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import {
  ChartsProvider,
  ErrorAlert,
  ErrorBoundary,
  useChartsTheme,
  useSnackbar,
} from '@perses-dev/components';
import {
  DashboardResource,
  EphemeralDashboardResource,
  getResourceExtendedDisplayName,
} from '@perses-dev/core';
import { useDatasourceStore } from '@perses-dev/plugin-system';
import {
  PanelDrawer,
  Dashboard,
  PanelGroupDialog,
  DeletePanelGroupDialog,
  DashboardDiscardChangesConfirmationDialog,
  DeletePanelDialog,
  EmptyDashboardProps,
  EditJsonDialog,
  SaveChangesConfirmationDialog,
  LeaveDialog,
} from '@perses-dev/dashboards';
import {
  useDashboard,
  useDiscardChangesConfirmationDialog,
  useEditMode,
} from '@perses-dev/dashboards';
import { OCPDashboardToolbar } from './dashboard-toolbar';

import buildURL from './perses/url-builder';
import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

export interface DashboardAppProps {
  dashboardResource: DashboardResource | EphemeralDashboardResource;
  emptyDashboardProps?: Partial<EmptyDashboardProps>;
  isReadonly: boolean;
  isVariableEnabled: boolean;
  isDatasourceEnabled: boolean;
  isCreating?: boolean;
  isInitialVariableSticky?: boolean;
  // If true, browser confirmation dialog will be shown
  // when navigating away with unsaved changes (closing tab, ...).
  isLeavingConfirmDialogEnabled?: boolean;
  dashboardTitleComponent?: ReactNode;
  onDiscard?: (entity: DashboardResource) => void;
}

export const OCPDashboardApp = (props: DashboardAppProps): ReactElement => {
  const {
    dashboardResource,
    emptyDashboardProps,
    isReadonly,
    isVariableEnabled,
    isDatasourceEnabled,
    isCreating,
    isInitialVariableSticky,
    isLeavingConfirmDialogEnabled,
    onDiscard,
  } = props;

  const chartsTheme = useChartsTheme();
  const { successSnackbar, exceptionSnackbar } = useSnackbar();

  const resource = 'dashboards';
  const updateDashboard = async (entity: DashboardResource): Promise<DashboardResource> => {
    const url = buildURL({
      resource: resource,
      project: entity.metadata.project,
      name: entity.metadata.name,
    });

    // try {
    return await consoleFetchJSON.put(url, entity);
    // } catch (error) {
    //   console.error('Dashboard update failed:', error);
    //   throw error;
    // }
  };

  const useUpdateDashboardMutation = (): UseMutationResult<
    DashboardResource,
    Error,
    DashboardResource
  > => {
    const queryClient = useQueryClient();

    return useMutation<DashboardResource, Error, DashboardResource>({
      mutationKey: [resource],
      mutationFn: updateDashboard,
      onSuccess: () => {
        return queryClient.invalidateQueries({ queryKey: [resource] });
      },
    });
  };

  const { isEditMode, setEditMode } = useEditMode();
  const { dashboard, setDashboard } = useDashboard();
  const [originalDashboard, setOriginalDashboard] = useState<
    DashboardResource | EphemeralDashboardResource | undefined
  >(undefined);
  const { setSavedDatasources } = useDatasourceStore();

  const { openDiscardChangesConfirmationDialog, closeDiscardChangesConfirmationDialog } =
    useDiscardChangesConfirmationDialog();

  const handleDiscardChanges = (): void => {
    // Reset to the original spec and exit edit mode
    if (originalDashboard) {
      setDashboard(originalDashboard);
    }
    setEditMode(false);
    closeDiscardChangesConfirmationDialog();
    if (onDiscard) {
      onDiscard(dashboard as unknown as DashboardResource);
    }
  };

  const onEditButtonClick = (): void => {
    setEditMode(true);
    setOriginalDashboard(dashboard);
    setSavedDatasources(dashboard.spec.datasources ?? {});
  };

  const onCancelButtonClick = (): void => {
    // check if dashboard has been modified
    if (JSON.stringify(dashboard) === JSON.stringify(originalDashboard)) {
      setEditMode(false);
    } else {
      openDiscardChangesConfirmationDialog({
        onDiscardChanges: () => {
          handleDiscardChanges();
        },
        onCancel: () => {
          closeDiscardChangesConfirmationDialog();
        },
      });
    }
  };

  const updateDashboardMutation = useUpdateDashboardMutation();

  const onSave = useCallback(
    async (data: DashboardResource | EphemeralDashboardResource) => {
      if (data.kind !== 'Dashboard') {
        throw new Error('Invalid kind');
      }

      try {
        const result = await updateDashboardMutation.mutateAsync(data, {
          onSuccess: (updatedDashboard: DashboardResource) => {
            successSnackbar(
              `Dashboard ${getResourceExtendedDisplayName(
                updatedDashboard,
              )} has been successfully updated`,
            );
            return updatedDashboard;
          },
          onError: (err) => {
            exceptionSnackbar(err);
            // Don't throw here - let outer catch handle it
          },
        });
        return result;
      } catch (error) {
        // Handle error internally to prevent unhandled promise rejection
        exceptionSnackbar(error);
        return null; // Return resolved promise to prevent rejection
      }
    },
    [exceptionSnackbar, successSnackbar, updateDashboardMutation],
  );

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowX: 'hidden',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <OCPDashboardToolbar
        dashboardName={dashboardResource.metadata.name}
        initialVariableIsSticky={isInitialVariableSticky}
        onSave={onSave}
        isReadonly={isReadonly}
        isVariableEnabled={isVariableEnabled}
        isDatasourceEnabled={isDatasourceEnabled}
        onEditButtonClick={onEditButtonClick}
        onCancelButtonClick={onCancelButtonClick}
      />
      <Box sx={{ paddingTop: 2, paddingX: 2, height: '100%' }}>
        <ErrorBoundary FallbackComponent={ErrorAlert}>
          <Dashboard
            emptyDashboardProps={{
              onEditButtonClick,
              ...emptyDashboardProps,
            }}
          />
        </ErrorBoundary>
        <ChartsProvider chartsTheme={chartsTheme} enablePinning={false} enableSyncGrouping={false}>
          <PanelDrawer />
        </ChartsProvider>
        <PanelGroupDialog />
        <DeletePanelGroupDialog />
        <DeletePanelDialog />
        <DashboardDiscardChangesConfirmationDialog />
        <EditJsonDialog isReadonly={!isEditMode} disableMetadataEdition={!isCreating} />
        <SaveChangesConfirmationDialog />
        {isLeavingConfirmDialogEnabled &&
          isEditMode &&
          (LeaveDialog({ original: originalDashboard, current: dashboard }) as ReactElement)}
      </Box>
    </Box>
  );
};
