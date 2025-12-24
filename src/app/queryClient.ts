import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // 401/403 에러는 재시도하지 않음
        if (error?.message?.includes("인증이 필요합니다") || error?.message?.includes("401") || error?.message?.includes("403")) {
          return false;
        }
        // 다른 에러는 최대 1회 재시도
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
  },
});
