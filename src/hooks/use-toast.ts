import { useState, useCallback, useRef, useEffect } from 'react';

// Toast types and interfaces
export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

interface ToastState {
  toasts: Toast[];
}

// Toast hook return type
interface UseToastReturn {
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (toastId: string) => void;
  dismissAll: () => void;
  toasts: Toast[];
}

// Global toast state management
const globalToastState: ToastState = { toasts: [] };
let listeners: Array<(state: ToastState) => void> = [];

// Global state management functions
const notifyListeners = () => {
  listeners.forEach(listener => listener(globalToastState));
};

const addToast = (toast: Toast) => {
  globalToastState.toasts.push(toast);
  notifyListeners();

  // Auto-dismiss after duration
  if (toast.duration !== 0) {
    setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration || 5000);
  }
};

const removeToast = (toastId: string) => {
  globalToastState.toasts = globalToastState.toasts.filter(t => t.id !== toastId);
  notifyListeners();
};

const clearAllToasts = () => {
  globalToastState.toasts = [];
  notifyListeners();
};

// Generate unique ID for toasts
const generateId = () => Math.random().toString(36).substring(2, 9);

// Main useToast hook
export const useToast = (): UseToastReturn => {
  const [, forceUpdate] = useState({});
  const listenerRef = useRef<(state: ToastState) => void>();

  // Subscribe to global state changes
  useEffect(() => {
    listenerRef.current = () => forceUpdate({});
    listeners.push(listenerRef.current);

    return () => {
      if (listenerRef.current) {
        listeners = listeners.filter(listener => listener !== listenerRef.current);
      }
    };
  }, []);

  // Toast function
  const toast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      id: generateId(),
      ...toastData,
    };

    addToast(newToast);
  }, []);

  // Dismiss function
  const dismiss = useCallback((toastId: string) => {
    removeToast(toastId);
  }, []);

  // Dismiss all function
  const dismissAll = useCallback(() => {
    clearAllToasts();
  }, []);

  return {
    toast,
    dismiss,
    dismissAll,
    toasts: globalToastState.toasts,
  };
};

// Direct toast function for convenience
export const toast = (toastData: Omit<Toast, 'id'>) => {
  const newToast: Toast = {
    id: generateId(),
    ...toastData,
  };

  addToast(newToast);
};

// Export types
export type { ToastState, UseToastReturn };
