"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onExportAndLeave?: () => void
  onLeaveWithoutExporting?: () => void
  onConfirm?: () => void
  title?: string
  description?: string
  confirmLabel?: string
  cancelActionLabel?: string
  showCancelAction?: boolean
  showCancelButton?: boolean
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onExportAndLeave,
  onLeaveWithoutExporting,
  onConfirm,
  title = "Are you sure you want to leave?",
  description = "You are about to upload a new audio file. Your current marks will be lost unless you export them.",
  confirmLabel = "Export Marks and Leave",
  cancelActionLabel = "Leave Without Exporting",
  showCancelAction = true,
  showCancelButton = true,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          {showCancelButton && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            {onConfirm && (
              <Button variant="default" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            )}
            {onExportAndLeave && (
              <Button variant="default" onClick={onExportAndLeave}>
                {confirmLabel}
              </Button>
            )}
            {showCancelAction && onLeaveWithoutExporting && (
              <Button variant="destructive" onClick={onLeaveWithoutExporting}>
                {cancelActionLabel}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
