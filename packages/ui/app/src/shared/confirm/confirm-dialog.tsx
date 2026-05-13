import { Button, Modal, ModalActions, ModalBody } from '@two-pebble/components';
import type { ConfirmController } from './use-confirm';

interface ConfirmDialogProps {
  controller: ConfirmController;
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const { controller } = props;
  const request = controller.request;

  return (
    <Modal open={controller.isOpen} onClose={controller.cancel} title={request?.title}>
      <ModalBody>
        <p className="text-sm text-content">{request?.message}</p>
        <ModalActions>
          <Button onClick={controller.cancel}>Cancel</Button>
          <Button variant="primary" onClick={controller.accept}>
            {request?.confirmLabel ?? 'Confirm'}
          </Button>
        </ModalActions>
      </ModalBody>
    </Modal>
  );
}
