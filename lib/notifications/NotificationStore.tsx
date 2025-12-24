"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  bottleId?: number;
  timestamp: number;
  read?: boolean;
}

export interface CompletionNotification {
  id: string;
  message: string;
  bottleId: number | null;
  ipfsCid: string | null;
  transactionHash: string | null;
  timestamp: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  markAsRead: (id: string) => void;
  loadingToasts: Map<string, string>;
  addLoadingToast: (id: string, message: string) => void;
  removeLoadingToast: (id: string) => void;
  completionNotifications: CompletionNotification[];
  addCompletionNotification: (
    notification: Omit<CompletionNotification, "timestamp">
  ) => void;
  removeCompletionNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationStore | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingToasts, setLoadingToasts] = useState<Map<string, string>>(
    new Map()
  );
  const [completionNotifications, setCompletionNotifications] = useState<
    CompletionNotification[]
  >([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp">) => {
      const newNotification: Notification = {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const addLoadingToast = useCallback((id: string, message: string) => {
    setLoadingToasts((prev) => {
      const newMap = new Map(prev);
      newMap.set(id, message);
      return newMap;
    });
  }, []);

  const removeLoadingToast = useCallback((id: string) => {
    setLoadingToasts((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const addCompletionNotification = useCallback(
    (notification: Omit<CompletionNotification, "timestamp">) => {
      const newNotification: CompletionNotification = {
        ...notification,
        timestamp: Date.now(),
      };
      setCompletionNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const removeCompletionNotification = useCallback((id: string) => {
    setCompletionNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAll,
        markAsRead,
        loadingToasts,
        addLoadingToast,
        removeLoadingToast,
        completionNotifications,
        addCompletionNotification,
        removeCompletionNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
