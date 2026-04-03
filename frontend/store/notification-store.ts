import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "@/store/auth-store";
import type { UserRole } from "@/types";

export type NotificationType = "festival" | "offer" | "coupon" | "info";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  createdByUserId?: string;
  targetRoles: UserRole[];
};

type NotificationReadState = Record<string, string[]>;

interface NotificationState {
  notifications: AppNotification[];
  readByUser: NotificationReadState;
  pushNotification: (payload: {
    title: string;
    message: string;
    type: NotificationType;
    targetRoles?: UserRole[];
  }) => { ok: boolean; error?: string };
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  getNotificationsForCurrentUser: () => AppNotification[];
  getUnreadCountForCurrentUser: () => number;
}

function getCurrentUser() {
  return useAuthStore.getState().user;
}

function canPushNotifications() {
  return getCurrentUser()?.role === "admin";
}

function getUserReadIds(state: NotificationState, userId: string) {
  return state.readByUser[userId] ?? [];
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      readByUser: {},
      pushNotification: (payload) => {
        if (!canPushNotifications()) {
          return { ok: false, error: "Only admin can push notifications." };
        }

        const title = payload.title.trim();
        const message = payload.message.trim();
        if (!title || !message) {
          return { ok: false, error: "Title and message are required." };
        }

        const actor = getCurrentUser();
        const targetRoles: UserRole[] =
          payload.targetRoles && payload.targetRoles.length > 0 ? payload.targetRoles : ["user"];

        set((state) => ({
          notifications: [
            {
              id: `noti-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              title,
              message,
              type: payload.type,
              createdAt: new Date().toISOString(),
              createdByUserId: actor?.id,
              targetRoles,
            },
            ...state.notifications,
          ].slice(0, 500),
        }));

        return { ok: true };
      },
      markAsRead: (notificationId) => {
        const user = getCurrentUser();
        if (!user) return;

        set((state) => {
          const existing = getUserReadIds(state, user.id);
          if (existing.includes(notificationId)) return state;

          return {
            readByUser: {
              ...state.readByUser,
              [user.id]: [notificationId, ...existing],
            },
          };
        });
      },
      markAllAsRead: () => {
        const user = getCurrentUser();
        if (!user) return;

        set((state) => {
          const targetIds = state.notifications
            .filter((notification) => notification.targetRoles.includes(user.role))
            .map((notification) => notification.id);

          return {
            readByUser: {
              ...state.readByUser,
              [user.id]: targetIds,
            },
          };
        });
      },
      getNotificationsForCurrentUser: () => {
        const user = getCurrentUser();
        if (!user) return [];
        return get().notifications.filter((notification) => notification.targetRoles.includes(user.role));
      },
      getUnreadCountForCurrentUser: () => {
        const user = getCurrentUser();
        if (!user) return 0;
        const readIds = get().readByUser[user.id] ?? [];
        return get().notifications.filter(
          (notification) =>
            notification.targetRoles.includes(user.role) && !readIds.includes(notification.id)
        ).length;
      },
    }),
    {
      name: "nmart-notifications",
    }
  )
);
