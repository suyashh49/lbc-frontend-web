'use client';

import Modal from './Modal';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  loading?: boolean;
}

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmText = 'Delete', loading }: ConfirmDialogProps) {
  return (
    <Modal title="" onClose={onCancel}>
      <div className="confirm-icon">⚠</div>
      <h3 className="confirm-title">{title}</h3>
      <p className="confirm-text">{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? <span className="spinner" /> : confirmText}
        </button>
      </div>
    </Modal>
  );
}
