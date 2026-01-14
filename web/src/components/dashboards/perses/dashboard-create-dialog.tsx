import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalVariant,
  FormGroup,
  Form,
  TextInput,
} from '@patternfly/react-core';
import { usePerses } from './hooks/usePerses';
import { useTranslation } from 'react-i18next';

import { z } from 'zod';
import { DashboardResource, nameSchema } from '@perses-dev/core';
import { useCreateDashboardMutation } from './dashboard-api';

interface DashboardValidationSchema {
  schema?: z.ZodSchema;
  isSchemaLoading: boolean;
  hasSchemaError: boolean; // TODO: Later use it with a goog error handling design
}

export const dashboardDisplayNameValidationSchema = z
  .string()
  .min(1, 'Required')
  .max(75, 'Must be 75 or fewer characters long');

const createDashboardDialogValidationSchema = z.object({
  projectName: nameSchema,
  dashboardName: dashboardDisplayNameValidationSchema,
});

export const DashboardCreateDialog: React.FunctionComponent = () => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);

  const {
    persesProjects,
    persesProjectDashboards,
    persesProjectDashboardsError,
    persesProjectDashboardsLoading,
  } = usePerses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | number | null>(null);
  const [dashboardName, setDashboardName] = useState<string>('');

  const createDashboardMutation = useCreateDashboardMutation();

  useEffect(() => {
    if (persesProjects && persesProjects.length > 0 && selectedProject === null) {
      setSelectedProject(persesProjects[0].metadata.name);
    }
  }, [persesProjects, selectedProject]);

  const {
    persesProjectDashboards: dashboards,
    persesProjectDashboardsError: isDashboardsLoading,
    persesProjectDashboardsLoading: isError,
  } = usePerses(selectedProject);

  const useDashboardValidationSchema = (): DashboardValidationSchema => {
    const generateMetadataName = (name: string): string => {
      return name
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-zA-Z0-9_.-]/g, '_');
    };

    return useMemo((): DashboardValidationSchema => {
      if (isDashboardsLoading)
        return {
          schema: undefined,
          isSchemaLoading: true,
          hasSchemaError: false,
        };

      if (isError) {
        return {
          hasSchemaError: true,
          isSchemaLoading: false,
          schema: undefined,
        };
      }

      if (!dashboards?.length)
        return {
          schema: createDashboardDialogValidationSchema,
          isSchemaLoading: true,
          hasSchemaError: false,
        };

      const refinedSchema = createDashboardDialogValidationSchema.refine(
        (schema) => {
          return !(dashboards ?? []).some((dashboard) => {
            return (
              dashboard.metadata.project.toLowerCase() === schema.projectName.toLowerCase() &&
              dashboard.metadata.name.toLowerCase() ===
                generateMetadataName(schema.dashboardName).toLowerCase()
            );
          });
        },
        (schema) => ({
          message: `Dashboard name '${schema.dashboardName}' already exists in '${schema.projectName}' project!`,
          path: ['dashboardName'],
        }),
      );

      return { schema: refinedSchema, isSchemaLoading: true, hasSchemaError: false };
    }, []);
  };

  const handleSetDashboardName = (_event, dashboardName: string) => {
    // add validation
    if (dashboardName) {
      setDashboardName(dashboardName);
      // useDashboardValidationSchema(dashboardName);
    } else {
      // useToast
    }
  };

  const handleAdd = () => {
    // const newDashbaord: DashboardResource = [{ kind: 'Project', metadata: { name: targetedDashboard.metadata.project }, spec: {} }]
    // createDashboardMutation.mutateAsync(
  };

  const handleModalToggle = (_event: KeyboardEvent | React.MouseEvent) => {
    setIsModalOpen(!isModalOpen);
    setIsDropdownOpen(false);
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const onFocus = () => {
    const element = document.getElementById('modal-dropdown-toggle');
    (element as HTMLElement)?.focus();
  };

  const onEscapePress = (event: KeyboardEvent) => {
    if (isDropdownOpen) {
      setIsDropdownOpen(!isDropdownOpen);
      onFocus();
    } else {
      handleModalToggle(event);
    }
  };

  const onSelect = (
    event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    setSelectedProject(value || null);
    setIsDropdownOpen(false);
    onFocus();
  };

  // const isValidDashboardName = (value: string | number | undefined) => {
  //   if (value && !persesProjectDashboardsError) {
  //     const projectDashboards: string[] = [];
  //     persesProjectDashboards.map((dashboard) => {
  //       projectDashboards.push(dashboard.metadata.name);
  //     });
  //   }
  // };

  return (
    <Fragment>
      <Button variant="primary" onClick={handleModalToggle}>
        Create Dashboard
      </Button>
      <Modal
        variant={ModalVariant.small}
        isOpen={isModalOpen}
        onClose={handleModalToggle}
        onEscapePress={onEscapePress}
        aria-labelledby="modal-with-dropdown"
      >
        <ModalHeader title="Create Dashboard" />
        <ModalBody>
          <Form>
            <FormGroup
              label="Select project"
              isRequired
              fieldId="form-group-create-dashboard-dialog-project-selection"
            >
              <Dropdown
                isOpen={isDropdownOpen}
                onSelect={onSelect} // This now captures the value
                onOpenChange={(isOpen: boolean) => setIsDropdownOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={handleDropdownToggle}
                    isExpanded={isDropdownOpen}
                    isFullWidth
                  >
                    {selectedProject}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  {persesProjects.map((project, i) => (
                    <DropdownItem
                      value={`${project.metadata.name}`}
                      key={`${i}-${project.metadata.name}`}
                    >
                      {project.metadata.name}
                    </DropdownItem>
                  ))}
                </DropdownList>
              </Dropdown>
            </FormGroup>
            <FormGroup
              label="Dashboard name"
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
              />
            </FormGroup>
          </Form>

          {selectedProject && (
            <div style={{ marginTop: '16px' }}>
              Selected: <strong>{selectedProject}</strong>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            key="create"
            variant="primary"
            onClick={handleModalToggle}
            isDisabled={!dashboardName || !selectedProject}
          >
            Create
          </Button>
          <Button key="cancel" variant="link" onClick={handleModalToggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};
