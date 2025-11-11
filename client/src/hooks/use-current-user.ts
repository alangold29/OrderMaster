import { type CompanyUser } from "@shared/schema";

export function useCurrentUser() {
  const user: CompanyUser = {
    id: "demo-user-1",
    email: "gerente@cgm.com",
    name: "Gerente Demo",
    position: "Gerente",
    role: "gerente",
    is_active: true,
    permissions: {},
    last_login: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  };

  return {
    user,
    isLoading: false,
    error: null,
    isAdmin: user?.role === "admin",
    isManager: user?.role === "manager",
    isEditor: user?.role === "editor",
    isViewer: user?.role === "viewer",
    canAccessFinancials: user?.role === "admin" || user?.role === "manager",
  };
}
