import { ReactElement, ReactNode, useState, useCallback, useEffect } from 'react';
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
import { useUpdateDashboardMutation } from './dashboard-api';

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

  const { isEditMode, setEditMode } = useEditMode();
  const { dashboard, setDashboard } = useDashboard();

  console.log('🔍 Dashboard App isEditMode:', isEditMode);

  const [originalDashboard, setOriginalDashboard] = useState<
    DashboardResource | EphemeralDashboardResource | undefined
  >(undefined);
  const [saveErrorOccurred, setSaveErrorOccurred] = useState(false);

  // Track edit mode changes
  useEffect(() => {
    console.log('🔍 Edit mode changed to:', isEditMode);
  }, [isEditMode]);

  // Override automatic edit mode exit on save errors
  useEffect(() => {
    if (saveErrorOccurred && !isEditMode) {
      console.log(
        '🔍 OVERRIDE: Save error occurred but edit mode was set to false - restoring edit mode',
      );
      setEditMode(true);
      setSaveErrorOccurred(false); // Reset flag
    }
  }, [isEditMode, saveErrorOccurred, setEditMode]);
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
            console.log('🔍 Save SUCCESS - exiting edit mode');
            successSnackbar(
              `Dashboard ${getResourceExtendedDisplayName(
                updatedDashboard,
              )} has been successfully updated`,
            );
            // Reset error flag and exit edit mode on successful save
            setSaveErrorOccurred(false);
            setEditMode(false);
            return updatedDashboard;
          },
          // onError: (err) => {
          //   console.log('🔍 Save ERROR in onError callback - should NOT exit edit mode');
          //   exceptionSnackbar(err);
          //   // Don't throw here - let outer catch handle it
          // },
        });
        return result;
      } catch (error) {
        // Handle error internally to prevent unhandled promise rejection
        exceptionSnackbar(error);

        console.log('🔍 Save failed - current isEditMode:', isEditMode);

        // Set flag to override any automatic edit mode exit
        setSaveErrorOccurred(true);

        console.log('🔍 Set saveErrorOccurred flag to prevent automatic edit mode exit');

        // Return null to prevent promise rejection (stay in edit mode)
        return null;
      }
    },
    [
      isEditMode,
      updateDashboardMutation,
      successSnackbar,
      setEditMode,
      exceptionSnackbar,
      setSaveErrorOccurred,
    ],
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
      <h1> Hello !!! </h1>
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
