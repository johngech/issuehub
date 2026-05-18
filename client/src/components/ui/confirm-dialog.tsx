import { Button, Dialog, Flex } from "@radix-ui/themes";
import { X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "classic" | "solid" | "soft" | "outline" | "ghost" | "link";
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
      <Dialog.Trigger />
      <Dialog.Content>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
        <Dialog.Close>
          <Button
            variant="ghost"
            size="1"
            className="absolute right-4 top-4"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </Dialog.Close>
        <Flex gapY={"3"} mt={"4"}>
          <Button onClick={onCancel} variant="outline" style={{ flex: 1 }}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} style={{ flex: 1 }}>
            {confirmLabel}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
