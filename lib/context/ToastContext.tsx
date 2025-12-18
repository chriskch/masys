"use client";

import { createContext, useContext, ReactNode } from "react";

type ToastHandlers = {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
};

const noopToast: ToastHandlers = {
  showError: (message: string) => console.error(message),
  showSuccess: (message: string) => console.log(message),
  showInfo: (message: string) => console.log(message),
};

const ToastContext = createContext<ToastHandlers>(noopToast);

type ToastProviderProps = {
  children: ReactNode;
  handlers?: Partial<ToastHandlers>;
};

export function ToastProvider({ children, handlers }: ToastProviderProps) {
  const value: ToastHandlers = {
    showError: handlers?.showError ?? noopToast.showError,
    showSuccess: handlers?.showSuccess ?? noopToast.showSuccess,
    showInfo: handlers?.showInfo ?? noopToast.showInfo,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export const useToast = () => useContext(ToastContext);
