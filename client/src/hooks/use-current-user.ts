import { useQuery } from "@tanstack/react-query";
import { type CompanyUser } from "@shared/schema";

export function useCurrentUser() {
  const { data: user, isLoading, error } = useQuery<CompanyUser>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return {
    user,
    isLoading,
    error,
    isAdmin: user?.role === "admin",
    isManager: user?.role === "manager",
    isEditor: user?.role === "editor",
    isViewer: user?.role === "viewer",
    canAccessFinancials: user?.role === "admin" || user?.role === "manager",
  };
}
