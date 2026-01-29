import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClickConfirm: () => void;
  onClickCancel: () => void;
}

export const RenameActionModal = ({
  isOpen,
  onClose,
  onClickConfirm,
  onClickCancel,
}: ActionModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ouiaId="BasicModal"
      aria-labelledby="basic-modal-title"
      aria-describedby="modal-box-body-basic"
    >
      <ModalHeader title="Rename Dashboard" labelId="basic-modal-title" />
      <ModalBody id="modal-box-body-basic"></ModalBody>
      <ModalFooter>
        <Button key="confirm" variant="primary" onClick={onClickConfirm}>
          Confirm
        </Button>
        <Button key="cancel" variant="link" onClick={onClickCancel}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export const DeleteActionModal = ({
  isOpen,
  onClose,
  onClickConfirm,
  onClickCancel,
}: ActionModalProps) => {
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
        <Button key="confirm" variant="primary" onClick={onClickConfirm}>
          Confirm
        </Button>
        <Button key="cancel" variant="link" onClick={onClickCancel}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export const DuplicateActionModal = ({
  isOpen,
  onClose,
  onClickConfirm,
  onClickCancel,
}: ActionModalProps) => {
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
        <Button key="confirm" variant="primary" onClick={onClickConfirm}>
          Confirm
        </Button>
        <Button key="cancel" variant="link" onClick={onClickCancel}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
