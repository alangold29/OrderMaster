import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, MoreHorizontal, Edit, Trash2, Settings, UserCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CompanyUser, USER_ROLES } from "@shared/schema";
import { UserFormModal } from "@/components/user-form-modal";
import { UserPermissionsModal } from "@/components/user-permissions-modal";

export function UsersTable() {
  const [selectedUser, setSelectedUser] = useState<CompanyUser | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
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

  const handleEdit = (user: CompanyUser) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handlePermissions = (user: CompanyUser) => {
    setSelectedUser(user);
    setIsPermissionsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return "destructive";
      case USER_ROLES.MANAGER:
        return "default";
      case USER_ROLES.EDITOR:
        return "secondary";
      case USER_ROLES.VIEWER:
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return <div className="p-4">Carregando usuários...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Usuários</h2>
        <Button
          onClick={() => {
            setSelectedUser(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Posição</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Último Login</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.position}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(role) =>
                      updateRoleMutation.mutate({ id: user.id, role })
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(USER_ROLES).map((role) => (
                        <SelectItem key={role} value={role}>
                          {getRoleLabel(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString('pt-BR')
                    : "Nunca"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(user)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePermissions(user)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Permissões
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleActiveMutation.mutate(user.id)}
                      >
                        {user.isActive ? (
                          <>
                            <UserX className="w-4 h-4 mr-2" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* User Form Modal */}
      <UserFormModal
        user={selectedUser}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedUser(null);
        }}
      />

      {/* User Permissions Modal */}
      <UserPermissionsModal
        user={selectedUser}
        isOpen={isPermissionsOpen}
        onClose={() => {
          setIsPermissionsOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
}