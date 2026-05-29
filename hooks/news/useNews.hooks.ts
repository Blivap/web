import { $api } from "@/app/api";
import { INewsItem } from "@/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GetNewsParams } from "@/app/api/newsRepository";

export const useNews = (
  params?: GetNewsParams,
  options?: { enabled?: boolean },
) => {
  const [news, setNews] = useState<INewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const latestRequestId = useRef(0);
  const enabled = options?.enabled ?? true;
  const stableParams = useMemo(() => params, [params]);

  const getNews = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const requestId = ++latestRequestId.current;

    try {
      setIsLoading(true);
      setError(null);
      setIsRateLimited(false);
      const {
        data,
        status,
        error: apiError,
      } = await $api.news.getNews(stableParams);
      const articles = (data as { articles?: INewsItem[] })?.articles;

      if (requestId !== latestRequestId.current) {
        return;
      }

      if (status >= 200 && status < 300 && articles) {
        const sortedArticles = [...articles].sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime(),
        );
        setNews(sortedArticles);
        return;
      }
      setNews([]);
      setIsRateLimited(status === 403);
      setError(apiError ?? "Unable to load news right now.");
    } catch (error: unknown) {
      if (requestId !== latestRequestId.current) {
        return;
      }

      setNews([]);
      setIsRateLimited(false);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      if (requestId === latestRequestId.current) {
        setIsLoading(false);
      }
    }
  }, [enabled, stableParams]);

  useEffect(() => {
    void getNews();
  }, [getNews]);

  return {
    news,
    isLoading,
    error,
    isRateLimited,
    refetch: getNews,
  };
};
