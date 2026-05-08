function ConfirmModal({ isOpen, title, description, onConfirm, onCancel, confirmLabel = 'Delete', confirmClass = 'btn btn-danger', loading = false }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon danger">⚠️</div>
          <div>
            <div className="modal-title">{title}</div>
            <div className="modal-description">{description}</div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className={confirmClass} onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
