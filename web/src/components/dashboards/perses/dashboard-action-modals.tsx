import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  FormGroup,
  TextInput,
  FormHelperText,
  HelperText,
  HelperTextItem,
  ValidatedOptions,
  HelperTextItemVariant,
  ModalVariant,
  AlertVariant,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  MenuToggleElement,
  Stack,
  StackItem,
  Spinner,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useUpdateDashboardMutation,
  useCreateDashboardMutation,
  useDeleteDashboardMutation,
} from './dashboard-api';
import {
  renameDashboardDialogValidationSchema,
  RenameDashboardValidationType,
  createDashboardDialogValidationSchema,
  CreateDashboardValidationType,
  useDashboardValidationSchema,
} from './dashboard-action-validations';

import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DashboardResource,
  getResourceDisplayName,
  getResourceExtendedDisplayName,
} from '@perses-dev/core';
import { useToast } from './ToastProvider';
import { usePerses } from './hooks/usePerses';
import { generateMetadataName } from './dashboard-utils';
import { useProjectPermissions } from './dashboard-permissions';
import { t_global_spacer_200 } from '@patternfly/react-tokens';

const LabelSpacer = () => {
  return <div style={{ paddingBottom: t_global_spacer_200.value }} />;
};

interface ActionModalProps {
  dashboard: DashboardResource;
  isOpen: boolean;
  onClose: () => void;
  handleModalClose: () => void;
}

export const RenameActionModal = ({ dashboard, isOpen, onClose }: ActionModalProps) => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);
  const { addAlert } = useToast();

  const formGroupStyle = {
    '--pf-v6-c-form__label-text--FontWeight': 'bold',
  } as React.CSSProperties;

  const form = useForm<RenameDashboardValidationType>({
    resolver: zodResolver(renameDashboardDialogValidationSchema),
    mode: 'onBlur',
    defaultValues: { dashboardName: dashboard ? getResourceDisplayName(dashboard) : '' },
  });

  const updateDashboardMutation = useUpdateDashboardMutation();

  // Early return if dashboard is not provided
  if (!dashboard) {
    return null;
  }

  const processForm: SubmitHandler<RenameDashboardValidationType> = (data) => {
    if (dashboard.spec?.display) {
      dashboard.spec.display.name = data.dashboardName;
    } else {
      dashboard.spec.display = { name: data.dashboardName };
    }

    updateDashboardMutation.mutate(dashboard, {
      onSuccess: (updatedDashboard: DashboardResource) => {
        const msg = t(
          `Dashboard ${getResourceExtendedDisplayName(
            updatedDashboard,
          )} has been successfully updated`,
        );
        addAlert(msg, AlertVariant.success);
        handleClose();
      },
      onError: (err) => {
        const msg = t(`Could not rename dashboard. ${err}`);
        addAlert(msg, AlertVariant.danger);
        throw err;
      },
    });
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Modal
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={handleClose}
      ouiaId="RenameModal"
      aria-labelledby="rename-modal"
    >
      <ModalHeader title="Rename Dashboard" labelId="rename-modal-title" />
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(processForm)}>
          <ModalBody id="modal-box-body-basic">
            <Controller
              control={form.control}
              name="dashboardName"
              render={({ field, fieldState }) => (
                <FormGroup
                  label={t('Dashboard name')}
                  isRequired
                  fieldId="form-group-rename-dashboard-name"
                  style={formGroupStyle}
                >
                  <LabelSpacer />
                  <TextInput
                    {...field}
                    isRequired
                    type="text"
                    id="text-input-rename-dashboard-name"
                    name="text-input-rename-dashboard-name"
                    validated={fieldState.error ? ValidatedOptions.error : ValidatedOptions.default}
                  />
                  {fieldState.error && (
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem
                          icon={<ExclamationCircleIcon />}
                          variant={HelperTextItemVariant.error}
                        >
                          {fieldState.error.message}
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  )}
                </FormGroup>
              )}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              key="rename"
              variant="primary"
              type="submit"
              isDisabled={!(form.watch('dashboardName') || '')?.trim()}
            >
              {t('Rename')}
            </Button>
            <Button key="cancel" variant="link" onClick={handleClose}>
              {t('Cancel')}
            </Button>
          </ModalFooter>
        </form>
      </FormProvider>
    </Modal>
  );
};

export const DuplicateActionModal = ({ dashboard, isOpen, onClose }: ActionModalProps) => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);
  const { addAlert } = useToast();
  const [isProjectSelectOpen, setIsProjectSelectOpen] = useState(false);

  const formGroupStyle = {
    '--pf-v6-c-form__label-text--FontWeight': 'bold',
  } as React.CSSProperties;

  // Get projects data
  const { persesProjects, persesProjectsLoading } = usePerses();

  const hookInput = useMemo(() => {
    return persesProjects || [];
  }, [persesProjects]);

  const { editableProjects, loading: permissionsLoading } = useProjectPermissions(hookInput);

  const filteredProjects = useMemo(() => {
    return persesProjects.filter((project) => editableProjects.includes(project.metadata.name));
  }, [persesProjects, editableProjects]);

  // Use first project as default, or dashboard's current project
  const defaultProject = useMemo(() => {
    if (!dashboard) return '';

    // If current project is in filtered projects, use it
    if (dashboard.metadata.project && editableProjects.includes(dashboard.metadata.project)) {
      return dashboard.metadata.project;
    }

    // Otherwise use first available filtered project
    return filteredProjects[0]?.metadata.name || '';
  }, [dashboard, editableProjects, filteredProjects]);

  // Validation schema with duplicate name checking
  const { schema: validationSchema } = useDashboardValidationSchema(defaultProject);

  const form = useForm<CreateDashboardValidationType>({
    resolver: validationSchema
      ? zodResolver(validationSchema)
      : zodResolver(createDashboardDialogValidationSchema),
    mode: 'onBlur', // Back to onBlur to prevent immediate validation errors
    defaultValues: {
      projectName: defaultProject,
      dashboardName: '',
    },
  });

  const createDashboardMutation = useCreateDashboardMutation();

  // Reset form with proper values when modal opens
  React.useEffect(() => {
    if (isOpen && dashboard && filteredProjects.length > 0 && defaultProject) {
      form.reset({
        projectName: defaultProject,
        dashboardName: '',
      });
    }
  }, [isOpen, dashboard, defaultProject, filteredProjects.length, form]);

  // Early return if dashboard is not provided
  if (!dashboard) {
    return null;
  }

  // Show loading while permissions are being checked
  if (permissionsLoading || persesProjects.length === 0) {
    return (
      <Modal
        variant={ModalVariant.small}
        isOpen={isOpen}
        onClose={onClose}
        aria-labelledby="duplicate-modal-title"
      >
        <ModalHeader title="Duplicate Dashboard" labelId="duplicate-modal-title" />
        <ModalBody style={{ textAlign: 'center', padding: '2rem' }}>
          {t('Loading projects...')}
        </ModalBody>
      </Modal>
    );
  }

  // Early return if no editable projects
  if (filteredProjects.length === 0) {
    return (
      <Modal
        variant={ModalVariant.small}
        isOpen={isOpen}
        onClose={onClose}
        aria-labelledby="duplicate-modal-title"
      >
        <ModalHeader title="Duplicate Dashboard" labelId="duplicate-modal-title" />
        <ModalBody>
          <p>{t('You do not have permission to create dashboards in any projects.')}</p>
        </ModalBody>
        <ModalFooter>
          <Button key="close" variant="primary" onClick={onClose}>
            {t('Close')}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  const processForm: SubmitHandler<CreateDashboardValidationType> = (data) => {
    // Create a copy of the dashboard with new name and project

    const newDashboard: DashboardResource = {
      ...dashboard,
      metadata: {
        ...dashboard.metadata,
        name: generateMetadataName(data.dashboardName),
        project: data.projectName,
      },
      spec: {
        ...dashboard.spec,
        display: {
          ...dashboard.spec.display,
          name: data.dashboardName,
        },
      },
    };

    createDashboardMutation.mutate(newDashboard, {
      onSuccess: (createdDashboard: DashboardResource) => {
        const msg = t(
          `Dashboard ${getResourceExtendedDisplayName(
            createdDashboard,
          )} has been successfully created`,
        );
        addAlert(msg, AlertVariant.success);
        handleClose();
      },
      onError: (err) => {
        const msg = t(`Could not duplicate dashboard. ${err}`);
        addAlert(msg, AlertVariant.danger);
      },
    });
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const onProjectToggle = () => {
    setIsProjectSelectOpen(!isProjectSelectOpen);
  };

  const onProjectSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    if (typeof value === 'string') {
      form.setValue('projectName', value);
      setIsProjectSelectOpen(false);
    }
  };

  return (
    <Modal
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={handleClose}
      ouiaId="DuplicateModal"
      aria-labelledby="duplicate-modal"
    >
      <ModalHeader title="Duplicate Dashboard" labelId="duplicate-modal-title" />
      {persesProjectsLoading ? (
        <ModalBody style={{ textAlign: 'center', padding: '2rem' }}>
          {t('Loading...')} <Spinner aria-label="Contents of the basic example" />
        </ModalBody>
      ) : (
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(processForm)}>
            <ModalBody>
              <Stack hasGutter>
                <StackItem>
                  <Controller
                    control={form.control}
                    name="dashboardName"
                    render={({ field, fieldState }) => (
                      <FormGroup
                        label={t('Dashboard name')}
                        isRequired
                        fieldId="duplicate-dashboard-name"
                        style={formGroupStyle}
                      >
                        <LabelSpacer />
                        <TextInput
                          {...field}
                          isRequired
                          type="text"
                          id="duplicate-dashboard-name-input"
                          validated={
                            fieldState.error ? ValidatedOptions.error : ValidatedOptions.default
                          }
                        />
                        {fieldState.error && (
                          <FormHelperText>
                            <HelperText>
                              <HelperTextItem
                                icon={<ExclamationCircleIcon />}
                                variant={HelperTextItemVariant.error}
                              >
                                {fieldState.error.message}
                              </HelperTextItem>
                            </HelperText>
                          </FormHelperText>
                        )}
                      </FormGroup>
                    )}
                  />
                </StackItem>
                <StackItem>
                  <Controller
                    control={form.control}
                    name="projectName"
                    render={({ field, fieldState }) => (
                      <FormGroup
                        label={t('Select namespace')}
                        isRequired
                        fieldId="duplicate-dashboard-project"
                        style={formGroupStyle}
                      >
                        <LabelSpacer />
                        <Select
                          id="duplicate-dashboard-project-select"
                          isOpen={isProjectSelectOpen}
                          selected={field.value}
                          onSelect={onProjectSelect}
                          onOpenChange={setIsProjectSelectOpen}
                          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                            <MenuToggle
                              ref={toggleRef}
                              onClick={onProjectToggle}
                              isExpanded={isProjectSelectOpen}
                              isFullWidth
                            >
                              {(() => {
                                const selectedProject = filteredProjects.find(
                                  (p) => p.metadata.name === field.value,
                                );
                                return selectedProject
                                  ? getResourceDisplayName(selectedProject)
                                  : field.value || 'Select project';
                              })()}
                            </MenuToggle>
                          )}
                        >
                          <SelectList>
                            {filteredProjects.map((project) => (
                              <SelectOption
                                key={project.metadata.name}
                                value={project.metadata.name}
                              >
                                {getResourceDisplayName(project)}
                              </SelectOption>
                            ))}
                          </SelectList>
                        </Select>
                        {fieldState.error && (
                          <FormHelperText>
                            <HelperText>
                              <HelperTextItem
                                icon={<ExclamationCircleIcon />}
                                variant={HelperTextItemVariant.error}
                              >
                                {fieldState.error.message}
                              </HelperTextItem>
                            </HelperText>
                          </FormHelperText>
                        )}
                      </FormGroup>
                    )}
                  />
                </StackItem>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button
                key="duplicate"
                variant="primary"
                type="submit"
                isDisabled={
                  !(form.watch('dashboardName') || '')?.trim() ||
                  !(form.watch('projectName') || '')?.trim() ||
                  createDashboardMutation.isPending
                }
                isLoading={createDashboardMutation.isPending}
              >
                {t('Duplicate')}
              </Button>
              <Button key="cancel" variant="link" onClick={handleClose}>
                {t('Cancel')}
              </Button>
            </ModalFooter>
          </form>
        </FormProvider>
      )}
    </Modal>
  );
};

export const DeleteActionModal = ({ dashboard, isOpen, onClose }: ActionModalProps) => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);
  const { addAlert } = useToast();

  const deleteDashboardMutation = useDeleteDashboardMutation();
  const dashboardName = dashboard?.spec?.display?.name ?? 'this dashboard';

  const handleDeleteConfirm = async () => {
    if (!dashboard) return;

    deleteDashboardMutation.mutate(dashboard, {
      onSuccess: (deletedDashboard: DashboardResource) => {
        const msg = t(
          `Dashboard ${getResourceExtendedDisplayName(
            deletedDashboard,
          )} has been successfully deleted`,
        );
        addAlert(msg, AlertVariant.success);
        onClose();
      },
      onError: (err) => {
        const msg = t(`Could not delete dashboard. ${err}`);
        addAlert(msg, AlertVariant.danger);
        throw err;
      },
    });
  };

  return (
    <Modal
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={onClose}
      ouiaId="DeleteModal"
      aria-labelledby="delete-modal"
    >
      <ModalHeader
        titleIconVariant="warning"
        title="Permanently delete dashboard?"
        labelId="basic-modal-title"
      />
      <ModalBody id="modal-box-body-basic">
        {t('Are you sure you want to delete ')}
        <strong>{dashboardName}</strong>
        {t('? This action can not be undone.')}
      </ModalBody>
      <ModalFooter>
        <Button
          key="delete"
          onClick={handleDeleteConfirm}
          isDisabled={!dashboard || deleteDashboardMutation.isPending}
          isLoading={deleteDashboardMutation.isPending}
        >
          {deleteDashboardMutation.isPending ? t('Deleting...') : t('Delete')}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
