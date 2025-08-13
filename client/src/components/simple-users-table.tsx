import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CompanyUser, USER_ROLES } from "@shared/schema";

export function SimpleUsersTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<CompanyUser[]>({
    queryKey: ["/api/company-users"],
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/company-users/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-users"] });
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao excluir o usuário.",
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/company-users/${id}/toggle-active`, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-users"] });
      toast({
        title: "Status atualizado",
        description: "O status do usuário foi atualizado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar o status do usuário.",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      return await apiRequest(`/api/company-users/${id}/role`, "PATCH", { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-users"] });
      toast({
        title: "Função atualizada",
        description: "A função do usuário foi atualizada.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar a função do usuário.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o usuário ${name}?`)) {
      deleteUserMutation.mutate(id);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return "Administrador";
      case USER_ROLES.MANAGER:
        return "Gerente";
      case USER_ROLES.EDITOR:
        return "Editor";
      case USER_ROLES.VIEWER:
        return "Visualizador";
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Usuários</h2>
          <p className="text-gray-600 mt-2">
            Gerencie os usuários da empresa, suas funções e permissões de acesso ao sistema.
          </p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => {
            const email = prompt("Email do usuário:");
            const name = prompt("Nome completo:");
            const position = prompt("Posição/Cargo:");
            
            if (email && name && position) {
              apiRequest("/api/company-users", "POST", {
                email,
                name,
                position,
                role: "viewer",
                isActive: true
              }).then(() => {
                queryClient.invalidateQueries({ queryKey: ["/api/company-users"] });
                toast({
                  title: "Usuário criado",
                  description: "O usuário foi criado com sucesso.",
                });
              }).catch(() => {
                toast({
                  title: "Erro",
                  description: "Falha ao criar o usuário.",
                  variant: "destructive",
                });
              });
            }
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Novo Usuário
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Função
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      updateRoleMutation.mutate({ id: user.id, role: e.target.value })
                    }
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {Object.values(USER_ROLES).map((role) => (
                      <option key={role} value={role}>
                        {getRoleLabel(role)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.isActive ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString('pt-BR')
                    : "Nunca"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => toggleActiveMutation.mutate(user.id)}
                    className={`${
                      user.isActive
                        ? "text-red-600 hover:text-red-900"
                        : "text-green-600 hover:text-green-900"
                    }`}
                  >
                    {user.isActive ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    onClick={() => {
                      const permissions = prompt("Digite as permissões JSON:", JSON.stringify(user.permissions || {}));
                      if (permissions) {
                        try {
                          const newPermissions = JSON.parse(permissions);
                          apiRequest(`/api/company-users/${user.id}/permissions`, "PATCH", { permissions: newPermissions })
                            .then(() => {
                              queryClient.invalidateQueries({ queryKey: ["/api/company-users"] });
                              toast({
                                title: "Permissões atualizadas",
                                description: "As permissões foram atualizadas com sucesso.",
                              });
                            });
                        } catch (e) {
                          toast({
                            title: "Erro",
                            description: "JSON de permissões inválido.",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Permissões
                  </button>
                  <button
                    onClick={() => handleDelete(user.id, user.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users?.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário</h3>
          <p className="mt-1 text-sm text-gray-500">
            Começe criando um novo usuário para o sistema.
          </p>
        </div>
      )}
    </div>
  );
}