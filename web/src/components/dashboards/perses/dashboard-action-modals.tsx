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
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useUpdateDashboardMutation } from './dashboard-api';
import {
  renameDashboardDialogValidationSchema,
  RenameDashboardValidationType,
} from './dashboard-action-validations';

import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DashboardResource,
  getResourceDisplayName,
  getResourceExtendedDisplayName,
} from '@perses-dev/core';
import { useToast } from './ToastProvider';

interface ActionModalProps {
  dashboard: DashboardResource;
  isOpen: boolean;
  onClose: () => void;
  handleModalClose: () => void;
}

export const RenameActionModal = ({ dashboard, isOpen, onClose }: ActionModalProps) => {
  const { t } = useTranslation();
  const { addAlert } = useToast();

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
      ouiaId="BasicModal"
      aria-labelledby="basic-modal-title"
      aria-describedby="modal-box-body-basic"
    >
      <ModalHeader title="Rename Dashboard" labelId="basic-modal-title" />
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
                >
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
              isDisabled={!form.formState.isValid}
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

export const DeleteActionModal = ({ isOpen, onClose, handleModalClose }: ActionModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ouiaId="BasicModal"
      aria-labelledby="basic-modal-title"
      aria-describedby="modal-box-body-basic"
    >
      <ModalHeader title="Delete dashboards" labelId="basic-modal-title" />
      <ModalBody id="modal-box-body-basic"></ModalBody>
      <ModalFooter>
        <Button key="confirm" variant="primary" onClick={handleModalClose}>
          Confirm
        </Button>
        <Button key="cancel" variant="link" onClick={handleModalClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export const DuplicateActionModal = ({ isOpen, onClose, handleModalClose }: ActionModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ouiaId="BasicModal"
      aria-labelledby="basic-modal-title"
      aria-describedby="modal-box-body-basic"
    >
      <ModalHeader title="Duplicate dashboard" labelId="basic-modal-title" />
      <ModalBody id="modal-box-body-basic"></ModalBody>
      <ModalFooter>
        <Button key="confirm" variant="primary" onClick={handleModalClose}>
          Confirm
        </Button>
        <Button key="cancel" variant="link" onClick={handleModalClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
