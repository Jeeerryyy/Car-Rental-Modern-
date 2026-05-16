import { useEffect, useRef } from 'react';

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  onConfirm,
  showClose = true,
  maxWidth = 'max-w-md',
  showFooter = true
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const confirmClass = confirmVariant === 'danger' 
    ? 'bg-red-600 text-white' 
    : confirmVariant === 'success'
    ? 'bg-green-600 text-white'
    : '';
  const confirmStyle = confirmVariant !== 'danger' && confirmVariant !== 'success'
    ? { background: '#19130E', color: '#FFFFFF' } : {};

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        ref={modalRef}
        className={`relative rounded-t-3xl sm:rounded-[12px] ${maxWidth} w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto`}
        style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20"
            style={{ color: '#6b5e50' }}
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
        
        {title && (
          <h2 id="modal-title" className="text-xl font-bold mb-6" style={{ color: '#19130E' }}>
            {title}
          </h2>
        )}
        
        <div className="mb-2" style={{ color: '#6b5e50' }}>
          {children}
        </div>
        
        {(onConfirm || (showFooter && onConfirm)) && (
          <div className="flex gap-3 justify-end mt-8">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full font-medium"
              style={{ border: '1px solid rgba(182,124,61,0.15)', color: '#19130E' }}
            >
              Cancel
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                className={`px-6 py-2.5 rounded-full font-medium ${confirmClass}`}
                style={confirmStyle}
              >
                {confirmLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  itemName,
  confirmLabel = 'Delete',
  onConfirm 
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      confirmLabel={confirmLabel}
      confirmVariant="danger"
      onConfirm={() => {
        onConfirm();
        onClose();
      }}
    >
      <p className="mb-2">{message}</p>
      {itemName && (
        <p className="font-bold" style={{ color: '#19130E' }}>"{itemName}"</p>
      )}
    </Modal>
  );
}
