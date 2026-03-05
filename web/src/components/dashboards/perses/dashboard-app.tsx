import * as React from 'react';
import { Box } from '@mui/material';
import { ChartsProvider, ErrorAlert, ErrorBoundary, useChartsTheme } from '@perses-dev/components';
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
  useDashboardActions,
  useDiscardChangesConfirmationDialog,
  useEditMode,
} from '@perses-dev/dashboards';
import { OCPDashboardToolbar } from './dashboard-toolbar';
import { useUpdateDashboardMutation } from './dashboard-api';
import { useTranslation } from 'react-i18next';
import { useToast } from './ToastProvider';
import { useLocation } from 'react-router-dom';

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
  dashboardTitleComponent?: React.ReactNode;
  onDiscard?: (entity: DashboardResource) => void;
}

export const OCPDashboardApp = (props: DashboardAppProps): React.ReactElement => {
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

  const { t } = useTranslation(process.env.I18N_NAMESPACE);

  const chartsTheme = useChartsTheme();
  const { addAlert } = useToast();

  const { isEditMode, setEditMode } = useEditMode();
  const { dashboard } = useDashboard();
  const { setDashboard } = useDashboardActions();

  const [originalDashboard, setOriginalDashboard] = React.useState<
    DashboardResource | EphemeralDashboardResource | undefined
  >(undefined);
  const [saveErrorOccurred, setSaveErrorOccurred] = React.useState(false);

  React.useEffect(() => {
    if (saveErrorOccurred && !isEditMode) {
      setEditMode(true);
      setSaveErrorOccurred(false);
    }
  }, [isEditMode, saveErrorOccurred, setEditMode]);
  const { setSavedDatasources } = useDatasourceStore();

  const { openDiscardChangesConfirmationDialog, closeDiscardChangesConfirmationDialog } =
    useDiscardChangesConfirmationDialog();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isEdit = searchParams.get('edit');
  React.useEffect(() => {
    if (isEdit === 'true') {
      setEditMode(true);
    }
  }, [isEdit, setEditMode]);

  // Debug: Track when dashboardResource prop changes
  React.useEffect(() => {
    console.log('!JZ 🔄 dashboardResource prop changed:', dashboardResource);
  }, [dashboardResource]);

  // Debug: Track when dashboard state changes
  React.useEffect(() => {
    console.log('!JZ 🎯 Dashboard state changed:', dashboard);
    console.log('!JZ 📋 Dashboard version:', dashboard?.metadata?.version);
    // Show panel queries to track the revert
    const panels = dashboard?.spec?.panels || {};
    console.log(
      '!JZ 📊 Panel queries:',
      Object.keys(panels).map((panelId) => {
        const panel = panels[panelId];
        const queries = panel?.spec?.queries || [];
        return {
          panelId,
          queries: queries.map((q) => q?.spec?.plugin?.spec?.query || 'no query found'),
        };
      }),
    );
  }, [dashboard]);

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
    console.log('!JZ 📝 Edit mode entered - storing original dashboard:', dashboard);
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

  const onSave = React.useCallback(
    async (data: DashboardResource | EphemeralDashboardResource) => {
      if (data.kind !== 'Dashboard') {
        throw new Error('Invalid kind');
      }

      try {
        console.log('!JZ 🔍 Dashboard save - sending data:', data);
        console.log('!JZ 📊 Current dashboard state before save:', dashboard);
        console.log('!!JZ OLD ', { dashboard, data });

        const result = await updateDashboardMutation.mutateAsync(data, {
          onSuccess: (updatedDashboard: DashboardResource) => {
            console.log('!JZ ✅ Dashboard save success - received:', updatedDashboard);
            console.log('!JZ 🧹 Need to clear preview state after save');
            addAlert(
              t(
                `Dashboard ${getResourceExtendedDisplayName(
                  updatedDashboard,
                )} has been successfully updated`,
              ),
              'success',
            );

            setSaveErrorOccurred(false);
            setDashboard(updatedDashboard);
            console.log('!JZ 🔄 Dashboard will re-render with updatedAt key');
            console.log('!!JZ  NEW', { updatedDashboard });
            return updatedDashboard;
          },
        });
        return result;
      } catch (error) {
        addAlert(`${error}`, 'danger');
        setSaveErrorOccurred(true);
        return null;
      }
    },
    [updateDashboardMutation, addAlert, t],
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
          <h1> dashboard-${dashboard?.metadata?.updatedAt || dashboard?.metadata?.version} </h1>
          <Dashboard
            key={`dashboard-${dashboard?.metadata?.updatedAt || dashboard?.metadata?.version}`}
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
          (LeaveDialog({ original: originalDashboard, current: dashboard }) as React.ReactElement)}
      </Box>
    </Box>
  );
};
