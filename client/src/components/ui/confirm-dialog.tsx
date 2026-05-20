import { Button, Dialog, Flex } from "@radix-ui/themes";
import { X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: Readonly<ConfirmDialogProps>) {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <Dialog.Content maxWidth="400px">
        <Flex justify="between" align="start">
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Close>
            <Button variant="ghost" size="1" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </Dialog.Close>
        </Flex>
        <Dialog.Description size="2" color="gray" mt="2">
          {description}
        </Dialog.Description>
        <Flex gap="3" mt="5">
          <Dialog.Close>
            <Button onClick={onCancel} variant="outline" style={{ flexGrow: 1 }}>
              {cancelLabel}
            </Button>
          </Dialog.Close>
          <Button onClick={onConfirm} style={{ flexGrow: 1 }}>
            {confirmLabel}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
