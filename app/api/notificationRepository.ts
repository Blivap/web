import { fetcher } from "@/services/http";
import { endpoints } from "@/services/endpoints";
import type { IResponse } from "@/types";
import type {
  FcmPushSubscriptionPayload,
  InAppNotificationListResponse,
  WebPushSubscriptionPayload,
} from "@/types/notifications";

export type ListNotificationsParams = {
  skip?: number;
  limit?: number;
};

const DEFAULT_SKIP = 0;
const DEFAULT_LIMIT = 30;

export default function NotificationRepository() {
  return {
    list(
      params: ListNotificationsParams = {},
    ): Promise<IResponse<InAppNotificationListResponse>> {
      const skip = params.skip ?? DEFAULT_SKIP;
      const limit = params.limit ?? DEFAULT_LIMIT;
      const query = new URLSearchParams({
        skip: String(skip),
        limit: String(limit),
      });
      return fetcher<InAppNotificationListResponse>(
        `${endpoints.notifications.list}?${query.toString()}`,
        { method: "GET" },
      );
    },

    markRead(id: string): Promise<IResponse<unknown>> {
      return fetcher(endpoints.notifications.read(id), {
        method: "PATCH",
      });
    },

    registerFcmPush(
      payload: FcmPushSubscriptionPayload,
    ): Promise<IResponse<unknown>> {
      return fetcher(endpoints.notifications.pushSubscriptions.fcm, {
        method: "POST",
        data: payload,
      });
    },

    registerWebPush(
      payload: WebPushSubscriptionPayload,
    ): Promise<IResponse<unknown>> {
      return fetcher(endpoints.notifications.pushSubscriptions.web, {
        method: "POST",
        data: payload,
      });
    },
  };
}
