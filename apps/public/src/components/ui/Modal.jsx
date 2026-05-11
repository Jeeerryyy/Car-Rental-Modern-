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
    ? 'bg-red-600 hover:bg-red-700 text-white' 
    : confirmVariant === 'success'
    ? 'bg-green-600 hover:bg-green-700 text-white'
    : 'bg-primary-container text-on-primary hover:bg-surface-tint';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        ref={modalRef}
        className={`relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl ${maxWidth} w-full p-6 sm:p-8 animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[90vh] overflow-y-auto`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-20"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
        
        {title && (
          <h2 id="modal-title" className="text-xl font-bold text-dark mb-6">
            {title}
          </h2>
        )}
        
        <div className="text-gray-600 mb-2">
          {children}
        </div>
        
        {(onConfirm || (showFooter && onConfirm)) && (
          <div className="flex gap-3 justify-end mt-8">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-200 rounded-full font-medium text-dark hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                className={`px-6 py-2.5 rounded-full font-medium transition-colors ${confirmClass}`}
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
        <p className="font-bold text-dark">"{itemName}"</p>
      )}
    </Modal>
  );
}