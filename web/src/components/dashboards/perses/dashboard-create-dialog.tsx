import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalVariant,
  FormGroup,
  Form,
  TextInput,
  FormHelperText,
  HelperText,
  HelperTextItem,
  HelperTextItemVariant,
  ValidatedOptions,
} from '@patternfly/react-core';
import { TypeaheadSelect, TypeaheadSelectOption } from '@patternfly/react-templates';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { usePerses } from './hooks/usePerses';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom-v5-compat';
import { StringParam, useQueryParam } from 'use-query-params';
import { QueryParams } from '../../query-params';

import { DashboardResource } from '@perses-dev/core';
import { useCreateDashboardMutation, useCreateProjectMutation } from './dashboard-api';
import { createNewDashboard } from './dashboard-utils';
import { useToast } from './ToastProvider';
import { usePerspective, getDashboardUrl } from '../../hooks/usePerspective';
import { persesDashboardDataTestIDs } from '../../data-test';

interface DashboardCreateDialogProps {
  editableProjects: string[] | undefined;
  projectsWithPermissions: any[] | undefined;
  hasEditableProject: boolean;
  permissionsLoading: boolean;
  permissionsError: any;
}

export const DashboardCreateDialog: React.FunctionComponent<DashboardCreateDialogProps> = ({
  editableProjects,
  projectsWithPermissions,
  hasEditableProject,
  permissionsLoading,
  permissionsError,
}) => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);
  const navigate = useNavigate();
  const { perspective } = usePerspective();
  const { addAlert } = useToast();
  const [activeProjectFromUrl] = useQueryParam(QueryParams.Project, StringParam);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [dashboardName, setDashboardName] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const createDashboardMutation = useCreateDashboardMutation();
  const createProjectMutation = useCreateProjectMutation();
  const { persesProjects } = usePerses();

  const disabled = permissionsLoading || !hasEditableProject;

  const filteredProjects = useMemo(() => {
    if (!projectsWithPermissions || !editableProjects) {
      return [];
    }
    return projectsWithPermissions.filter((project) =>
      editableProjects.includes(project.metadata.name),
    );
  }, [projectsWithPermissions, editableProjects]);

  const projectOptions = useMemo<TypeaheadSelectOption[]>(() => {
    return filteredProjects.map((project) => ({
      content: project.metadata.name,
      value: project.metadata.name,
      selected: project.metadata.name === selectedProject,
    }));
  }, [filteredProjects, selectedProject]);

  useEffect(() => {
    if (
      isModalOpen &&
      filteredProjects &&
      filteredProjects.length > 0 &&
      selectedProject === null
    ) {
      const projectToSelect =
        activeProjectFromUrl &&
        filteredProjects.some((p) => p.metadata.name === activeProjectFromUrl)
          ? activeProjectFromUrl
          : filteredProjects[0].metadata.name;

      setSelectedProject(projectToSelect);
    }
  }, [isModalOpen, filteredProjects, selectedProject, activeProjectFromUrl]);

  const { persesProjectDashboards: dashboards } = usePerses(
    isModalOpen && selectedProject ? selectedProject : undefined,
  );

  const handleSetDashboardName = (_event, dashboardName: string) => {
    setDashboardName(dashboardName);
    if (formErrors.dashboardName) {
      setFormErrors((prev) => ({ ...prev, dashboardName: '' }));
    }
  };

  const handleAdd = async () => {
    setFormErrors({});

    if (!selectedProject || !dashboardName.trim()) {
      const errors: { [key: string]: string } = {};
      if (!selectedProject) errors.project = t('Project is required');
      if (!dashboardName.trim()) errors.dashboardName = t('Dashboard name is required');
      setFormErrors(errors);
      return;
    }

    try {
      if (
        dashboards &&
        dashboards.some(
          (d) =>
            d.metadata.project === selectedProject &&
            d.metadata.name.toLowerCase() === dashboardName.trim().toLowerCase(),
        )
      ) {
        setFormErrors({
          dashboardName: `Dashboard name "${dashboardName}" already exists in this project`,
        });
        return;
      }

      // Check if the project exists on Perses server, create if it doesn't
      const projectExists = persesProjects.some(
        (project) => project.metadata?.name === selectedProject,
      );

      if (!projectExists) {
        // eslint-disable-next-line no-console
        console.log(`!JZ Creating missing project: ${selectedProject}`);

        try {
          await createProjectMutation.mutateAsync(selectedProject as string);
          addAlert(`Project "${selectedProject}" created successfully`, 'success');
        } catch (projectError) {
          const errorMessage =
            projectError?.message ||
            `Failed to create project "${selectedProject}". Please try again.`;
          addAlert(`Error creating project: ${errorMessage}`, 'danger');
          setFormErrors({ general: errorMessage });
          return;
        }
      }

      const newDashboard: DashboardResource = createNewDashboard(
        dashboardName.trim(),
        selectedProject as string,
      );

      const createdDashboard = await createDashboardMutation.mutateAsync(newDashboard);

      addAlert(`Dashboard "${dashboardName}" created successfully`, 'success');

      const dashboardUrl = getDashboardUrl(perspective);
      const dashboardParam = `dashboard=${createdDashboard.metadata.name}`;
      const projectParam = `project=${createdDashboard.metadata.project}`;
      const editModeParam = `edit=true`;
      navigate(`${dashboardUrl}?${dashboardParam}&${projectParam}&${editModeParam}`);

      setIsModalOpen(false);
      setDashboardName('');
      setFormErrors({});
    } catch (error) {
      const errorMessage = error?.message || t('Failed to create dashboard. Please try again.');
      addAlert(`Error creating dashboard: ${errorMessage}`, 'danger');
      setFormErrors({ general: errorMessage });
    }
  };

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) {
      setDashboardName('');
      setFormErrors({});
    }
  };

  const onEscapePress = () => {
    handleModalToggle();
  };

  const onSelect = (_event: any, selection: string) => {
    setSelectedProject(selection);
  };

  return (
    <>
      <Button
        variant="primary"
        onClick={handleModalToggle}
        isDisabled={disabled}
        data-test={persesDashboardDataTestIDs.createDashboardButtonToolbar}
      >
        {permissionsLoading ? t('Loading...') : t('Create')}
      </Button>
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
          {formErrors.general && (
            <Alert
              variant="danger"
              title={formErrors.general}
              isInline
              style={{ marginBottom: '16px' }}
            />
          )}
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd();
            }}
          >
            <FormGroup
              label={t('Select project')}
              isRequired
              fieldId="form-group-create-dashboard-dialog-project-selection"
            >
              <TypeaheadSelect
                initialOptions={projectOptions}
                placeholder={t('Select a project')}
                noOptionsFoundMessage={(filter) => `No project found for "${filter}"`}
                onClearSelection={() => setSelectedProject(null)}
                onSelect={onSelect}
                isCreatable={false}
                maxMenuHeight="200px"
              />
            </FormGroup>
            <FormGroup
              label={t('Dashboard name')}
              isRequired
              fieldId="form-group-create-dashboard-dialog-name"
            >
              <TextInput
                isRequired
                type="text"
                id="text-input-create-dashboard-dialog-name"
                name="text-input-create-dashboard-dialog-name"
                placeholder={t('my-new-dashboard')}
                value={dashboardName}
                onChange={handleSetDashboardName}
                validated={
                  formErrors.dashboardName ? ValidatedOptions.error : ValidatedOptions.default
                }
              />
              {formErrors.dashboardName && (
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem
                      icon={<ExclamationCircleIcon />}
                      variant={HelperTextItemVariant.error}
                    >
                      {formErrors.dashboardName}
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              )}
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            key="create"
            variant="primary"
            onClick={handleAdd}
            isDisabled={
              !dashboardName?.trim() ||
              !selectedProject ||
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
