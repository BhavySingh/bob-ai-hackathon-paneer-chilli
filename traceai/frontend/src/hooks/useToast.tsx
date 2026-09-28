import React, { useState, useCallback } from 'react';
import { ToastContainer } from '../components/ui/Toast';
import type { ToastType } from '../components/ui/Toast';

interface ToastItem { id: string; message: string; type: ToastType; }

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastPortal = () => <ToastContainer toasts={toasts} remove={remove} />;

  return { add, ToastPortal };
}
