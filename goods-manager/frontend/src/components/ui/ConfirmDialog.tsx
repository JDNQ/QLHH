'use client';

import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  description = 'Bạn có chắc chắn muốn thực hiện thao tác này không?',
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'danger',
  isLoading,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title={title}>
      <div className="px-6 py-5">
        <div className="flex gap-3 items-start">
          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-danger-light' : 'bg-warning-light'}`}>
            <AlertTriangle className={`w-5 h-5 ${variant === 'danger' ? 'text-danger' : 'text-warning'}`} />
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed pt-2">{description}</p>
        </div>
      </div>
      <div className="px-6 pb-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
