import { useQuery } from "@tanstack/react-query";

export interface AuthUser {
  user_id: string;
  email?: string;
  phone?: string;
  role: string;
  portal: string;
  agency_id: string;
  agency_name: string;
  agency_slug: string;
}

export function useAuth() {
  const { data, isLoading, error, refetch } = useQuery<AuthUser>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await fetch("/api/proxy/api/v1/auth/me");
      if (!res.ok) {
        if (res.status === 401) {
          return null;
        }
        throw new Error("Failed to fetch user");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  return {
    user: data,
    isLoading,
    error,
    refetch,
    isAuthenticated: !!data,
  };
}
