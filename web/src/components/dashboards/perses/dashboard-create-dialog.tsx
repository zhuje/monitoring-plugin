import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalVariant,
  FormGroup,
  TextInput,
  FormHelperText,
  HelperText,
  HelperTextItem,
  HelperTextItemVariant,
  ValidatedOptions,
  Tooltip,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TypeaheadSelect, TypeaheadSelectOption } from '@patternfly/react-templates';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { usePerses } from './hooks/usePerses';
import { useEditableProjects } from './hooks/useEditableProjects';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom-v5-compat';

import { DashboardResource } from '@perses-dev/core';
import { useCreateDashboardMutation, useCreateProjectMutation } from './dashboard-api';
import { createNewDashboard } from './dashboard-utils';
import { useToast } from './ToastProvider';
import {
  createDashboardDialogValidationSchema,
  CreateDashboardValidationType,
  useDashboardValidationSchema,
} from './dashboard-action-validations';
import { usePerspective, getDashboardUrl } from '../../hooks/usePerspective';
import { persesDashboardDataTestIDs } from '../../data-test';
import { formGroupStyle, LabelSpacer } from './dashboard-action-modals';

export const DashboardCreateDialog: React.FunctionComponent = () => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);
  const navigate = useNavigate();
  const { perspective } = usePerspective();
  const { addAlert } = useToast();
  const { editableProjects, hasEditableProject, permissionsLoading, permissionsError } =
    useEditableProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');
  const createDashboardMutation = useCreateDashboardMutation();
  const createProjectMutation = useCreateProjectMutation();
  const { persesProjects } = usePerses();

  // Initialize form with React Hook Form
  const form = useForm<CreateDashboardValidationType>({
    resolver: zodResolver(createDashboardDialogValidationSchema(t)),
    mode: 'onBlur',
    defaultValues: {
      projectName: '',
      dashboardName: '',
    },
  });

  // Watch for project selection changes
  const selectedProject = form.watch('projectName');

  // Get dynamic validation schema based on currently selected project
  const { schema: dynamicValidationSchema } = useDashboardValidationSchema(selectedProject, t);

  // Dynamic validation effect - validate current form values when project changes
  React.useEffect(() => {
    if (dynamicValidationSchema && selectedProject) {
      const currentValues = form.getValues();
      const result = dynamicValidationSchema.safeParse(currentValues);

      if (!result.success) {
        // Apply validation errors for the current form values
        result.error.issues.forEach((issue) => {
          if (issue.path[0] === 'dashboardName') {
            form.setError('dashboardName', {
              type: 'validate',
              message: issue.message,
            });
          }
        });
      } else {
        // Clear dashboard name errors if validation passes
        form.clearErrors('dashboardName');
      }
    }
  }, [selectedProject, dynamicValidationSchema, form]);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isModalOpen) {
      form.reset({
        projectName: '',
        dashboardName: '',
      });
      setGeneralError('');
    }
  }, [isModalOpen, form]);

  const disabled = permissionsLoading || !hasEditableProject;

  const projectOptions = useMemo<TypeaheadSelectOption[]>(() => {
    if (!editableProjects) {
      return [];
    }

    return editableProjects?.map((project) => ({
      content: project,
      value: project,
      selected: project === selectedProject,
    }));
  }, [editableProjects, selectedProject]);

  // Form submission handler using React Hook Form
  const processForm: SubmitHandler<CreateDashboardValidationType> = async (data) => {
    setGeneralError('');

    try {
      const projectExists = persesProjects?.some(
        (project) => project.metadata.name === data.projectName,
      );

      if (!projectExists) {
        try {
          await createProjectMutation.mutateAsync(data.projectName);
          addAlert(
            t('Project "{{project}}" created successfully', { project: data.projectName }),
            'success',
          );
        } catch (projectError) {
          const errorMessage =
            projectError?.message ||
            t('Failed to create project "{{project}}". Please try again.', {
              project: data.projectName,
            });
          addAlert(t('Error creating project: {{error}}', { error: errorMessage }), 'danger');
          setGeneralError(errorMessage);
          return;
        }
      }

      const newDashboard: DashboardResource = createNewDashboard(
        data.dashboardName.trim(),
        data.projectName,
      );

      const createdDashboard = await createDashboardMutation.mutateAsync(newDashboard);

      addAlert(`Dashboard "${data.dashboardName}" created successfully`, 'success');

      const dashboardUrl = getDashboardUrl(perspective);
      const dashboardParam = `dashboard=${createdDashboard.metadata.name}`;
      const projectParam = `project=${createdDashboard.metadata.project}`;
      const editModeParam = `edit=true`;
      navigate(`${dashboardUrl}?${dashboardParam}&${projectParam}&${editModeParam}`);

      handleModalClose();
    } catch (error) {
      const errorMessage = error?.message || t('Failed to create dashboard. Please try again.');
      addAlert(`Error creating dashboard: ${errorMessage}`, 'danger');
      setGeneralError(errorMessage);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    form.reset();
    setGeneralError('');
  };

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) {
      handleModalClose();
    }
  };

  const onEscapePress = () => {
    handleModalToggle();
  };

  const onSelect = (_event: any, selection: string) => {
    form.setValue('projectName', selection);
  };

  const createBtn = (
    <Button
      variant="primary"
      onClick={handleModalToggle}
      isDisabled={disabled}
      data-test={persesDashboardDataTestIDs.createDashboardButtonToolbar}
    >
      {permissionsLoading ? t('Checking permissions...') : t('Create')}
    </Button>
  );

  return (
    <>
      {!permissionsLoading && !hasEditableProject ? (
        <Tooltip
          content={t('To create dashboards, contact your cluster administrator for permission.')}
        >
          <span style={{ cursor: 'not-allowed' }}> {createBtn}</span>
        </Tooltip>
      ) : (
        createBtn
      )}
      <Modal
        variant={ModalVariant.small}
        isOpen={isModalOpen}
        onClose={handleModalToggle}
        onEscapePress={onEscapePress}
        aria-labelledby="modal-with-dropdown"
      >
        <ModalHeader title={t('Create Dashboard')} />
        <ModalBody>
          {permissionsError && (
            <Alert
              variant="danger"
              title={t(
                'Failed to load project permissions. Please refresh the page and try again.',
              )}
              isInline
              style={{ marginBottom: '16px' }}
            />
          )}
          {generalError && (
            <Alert
              variant="danger"
              title={generalError}
              isInline
              style={{ marginBottom: '16px' }}
            />
          )}
          <FormProvider {...form}>
            <form id="dashboard-create-form" onSubmit={form.handleSubmit(processForm)}>
              <Stack hasGutter>
                <StackItem>
                  <Controller
                    control={form.control}
                    name="projectName"
                    render={({ fieldState }) => (
                      <FormGroup
                        label={t('Select namespace')}
                        isRequired
                        fieldId="form-group-create-dashboard-dialog-project-selection"
                        style={formGroupStyle}
                      >
                        <LabelSpacer />
                        <TypeaheadSelect
                          key={selectedProject || 'no-selection'}
                          initialOptions={projectOptions}
                          placeholder={t('Select a namespace')}
                          noOptionsFoundMessage={(filter) =>
                            t('No namespace found for "{{filter}}"', { filter })
                          }
                          onClearSelection={() => {
                            form.setValue('projectName', '');
                          }}
                          onSelect={onSelect}
                          isCreatable={false}
                          maxMenuHeight="200px"
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
                    name="dashboardName"
                    render={({ field, fieldState }) => (
                      <FormGroup
                        label={t('Dashboard name')}
                        isRequired
                        fieldId="form-group-create-dashboard-dialog-name"
                        style={formGroupStyle}
                      >
                        <LabelSpacer />
                        <TextInput
                          {...field}
                          isRequired
                          type="text"
                          id="text-input-create-dashboard-dialog-name"
                          placeholder={t('my-new-dashboard')}
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
              </Stack>
            </form>
          </FormProvider>
        </ModalBody>
        <ModalFooter>
          <Button
            key="create"
            variant="primary"
            type="submit"
            form="dashboard-create-form"
            isDisabled={
              !(form.watch('dashboardName') || '')?.trim() ||
              !(form.watch('projectName') || '')?.trim() ||
              createDashboardMutation.isPending ||
              createProjectMutation.isPending
            }
            isLoading={createDashboardMutation.isPending || createProjectMutation.isPending}
          >
            {createDashboardMutation.isPending || createProjectMutation.isPending
              ? t('Creating...')
              : t('Create')}
          </Button>
          <Button key="cancel" variant="link" onClick={handleModalToggle}>
            {t('Cancel')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
