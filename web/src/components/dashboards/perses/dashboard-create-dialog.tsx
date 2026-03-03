import * as React from 'react';
import {
  Button,
  Modal,
  ModalVariant,
  FormGroup,
  TextInput,
  FormHelperText,
  HelperText,
  HelperTextItem,
  ValidatedOptions,
  SelectOptionProps,
  Spinner,
  Stack,
  StackItem,
  AlertVariant,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePerses } from './hooks/usePerses';
import { useEditableProjects } from './hooks/useEditableProjects';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom-v5-compat';

import { DashboardResource } from '@perses-dev/core';
import { useCreateDashboardMutation, useCreateProjectMutation } from './dashboard-api';
import { createNewDashboard } from './dashboard-utils';
import { useToast } from './ToastProvider';
import { usePerspective, getDashboardUrl } from '../../hooks/usePerspective';
import {
  createDashboardDialogValidationSchema,
  CreateDashboardValidationType,
  useDashboardValidationSchema,
} from './dashboard-action-validations';
import { TypeaheadSelect } from '../../TypeaheadSelect';
import { formGroupStyle, LabelSpacer } from './dashboard-action-modals';

interface DashboardCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardCreateDialog: React.FunctionComponent<DashboardCreateDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);
  const navigate = useNavigate();
  const { perspective } = usePerspective();
  const { addAlert } = useToast();

  const {
    editableProjects,
    allProjects,
    hasEditableProject,
    permissionsLoading,
    permissionsError,
  } = useEditableProjects();

  const { persesProjects } = usePerses();
  const createDashboardMutation = useCreateDashboardMutation();
  const createProjectMutation = useCreateProjectMutation();

  const defaultProject = React.useMemo(() => {
    return allProjects?.[0] || '';
  }, [allProjects]);

  const { schema: validationSchema } = useDashboardValidationSchema(t, defaultProject);

  const form = useForm<CreateDashboardValidationType>({
    resolver: validationSchema
      ? zodResolver(validationSchema)
      : zodResolver(createDashboardDialogValidationSchema(t)),
    mode: 'onBlur',
    defaultValues: {
      projectName: defaultProject,
      dashboardName: '',
    },
  });

  const projectOptions = React.useMemo<SelectOptionProps[]>(() => {
    if (!editableProjects) {
      return [];
    }
    return editableProjects.map((project) => ({
      name: project,
      value: project,
      content: project,
      children: project,
    }));
  }, [editableProjects]);

  React.useEffect(() => {
    if (isOpen && editableProjects?.length > 0 && defaultProject) {
      form.reset({
        projectName: defaultProject,
        dashboardName: '',
      });
    }
  }, [isOpen, defaultProject, editableProjects?.length, form]);

  const processForm: SubmitHandler<CreateDashboardValidationType> = async (data) => {
    // Check if project exists, create it if it doesn't
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
        return;
      }
    }

    const newDashboard: DashboardResource = createNewDashboard(
      data.dashboardName.trim(),
      data.projectName,
    );

    createDashboardMutation.mutate(newDashboard, {
      onSuccess: (createdDashboard: DashboardResource) => {
        const msg = t(`Dashboard "${data.dashboardName}" created successfully`);
        addAlert(msg, AlertVariant.success);

        handleClose();

        const dashboardUrl = getDashboardUrl(perspective);
        const dashboardParam = `dashboard=${createdDashboard.metadata.name}`;
        const projectParam = `project=${createdDashboard.metadata.project}`;
        const editModeParam = `edit=true`;
        navigate(`${dashboardUrl}?${dashboardParam}&${projectParam}&${editModeParam}`);
      },
      onError: (err) => {
        const msg = t(`Could not create dashboard. ${err}`);
        addAlert(msg, AlertVariant.danger);
      },
    });
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const onProjectSelect = (selection: string) => {
    form.setValue('projectName', selection);
  };

  return (
    <Modal
      variant={ModalVariant.small}
      title={t('Create Dashboard')}
      actions={[
        <Button
          key="create-modal-btn-create"
          variant="primary"
          isDisabled={
            !(form.watch('dashboardName') || '')?.trim() ||
            !(form.watch('projectName') || '')?.trim() ||
            !hasEditableProject
          }
          isLoading={createDashboardMutation.isPending || createProjectMutation.isPending}
          onClick={form.handleSubmit(processForm)}
        >
          {t('Create')}
        </Button>,
        <Button key="create-modal-btn-cancel" variant="link" onClick={handleClose}>
          {t('Cancel')}
        </Button>,
      ]}
      isOpen={isOpen}
      onClose={handleClose}
      ouiaId="CreateModal"
      aria-labelledby="create-modal"
    >
      {permissionsLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          {t('Loading...')} <Spinner aria-label="Create Dashboard Modal Loading" />
        </div>
      ) : permissionsError ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <ExclamationCircleIcon />
          {t('Failed to load project permissions. Please refresh the page and try again.')}
        </div>
      ) : (
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(processForm)}>
            <Stack hasGutter>
              <StackItem>
                <Controller
                  control={form.control}
                  name="dashboardName"
                  render={({ field, fieldState }) => (
                    <FormGroup
                      label={t('Dashboard name')}
                      isRequired
                      fieldId="create-modal-dashboard-name-form-group"
                      style={formGroupStyle}
                    >
                      <LabelSpacer />
                      <TextInput
                        {...field}
                        isRequired
                        type="text"
                        id="create-modal-dashboard-name-form-group-text-input"
                        placeholder={t('my-new-dashboard')}
                        validated={
                          fieldState.error ? ValidatedOptions.error : ValidatedOptions.default
                        }
                      />
                      {fieldState.error && (
                        <FormHelperText>
                          <HelperText>
                            <HelperTextItem icon={<ExclamationCircleIcon />} variant="error">
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
                  render={({ fieldState }) => (
                    <FormGroup
                      label={t('Select namespace')}
                      isRequired
                      fieldId="create-modal-select-namespace-form-group"
                      style={formGroupStyle}
                    >
                      <LabelSpacer />
                      <TypeaheadSelect
                        options={projectOptions}
                        onSelect={onProjectSelect}
                        defaultValue={defaultProject}
                        retainValue
                      />
                      {fieldState.error && (
                        <FormHelperText>
                          <HelperText>
                            <HelperTextItem icon={<ExclamationCircleIcon />} variant="error">
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
      )}
    </Modal>
  );
};
