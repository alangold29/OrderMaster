import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CompanyUser, PERMISSIONS } from "@shared/schema";

interface UserPermissionsModalProps {
  user?: CompanyUser | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PermissionState {
  [key: string]: boolean;
}

export function UserPermissionsModal({ user, isOpen, onClose }: UserPermissionsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [permissions, setPermissions] = useState<PermissionState>({});

  useEffect(() => {
    if (user && user.permissions) {
      setPermissions(user.permissions as PermissionState);
    } else {
      // Set default permissions based on role
      const defaultPermissions: PermissionState = {};
      
      if (user?.role === 'admin') {
        // Admin gets all permissions
        Object.values(PERMISSIONS).forEach(category => {
          Object.values(category).forEach(permission => {
            defaultPermissions[permission] = true;
          });
        });
      } else if (user?.role === 'manager') {
        // Manager gets most permissions except user management
        defaultPermissions[PERMISSIONS.ORDERS.VIEW] = true;
        defaultPermissions[PERMISSIONS.ORDERS.CREATE] = true;
        defaultPermissions[PERMISSIONS.ORDERS.EDIT] = true;
        defaultPermissions[PERMISSIONS.ORDERS.EXPORT] = true;
        defaultPermissions[PERMISSIONS.REPORTS.VIEW] = true;
        defaultPermissions[PERMISSIONS.REPORTS.EXPORT] = true;
        defaultPermissions[PERMISSIONS.SETTINGS.VIEW] = true;
      } else if (user?.role === 'editor') {
        // Editor gets basic CRUD permissions
        defaultPermissions[PERMISSIONS.ORDERS.VIEW] = true;
        defaultPermissions[PERMISSIONS.ORDERS.CREATE] = true;
        defaultPermissions[PERMISSIONS.ORDERS.EDIT] = true;
        defaultPermissions[PERMISSIONS.REPORTS.VIEW] = true;
      } else {
        // Viewer gets only view permissions
        defaultPermissions[PERMISSIONS.ORDERS.VIEW] = true;
        defaultPermissions[PERMISSIONS.REPORTS.VIEW] = true;
      }
      
      setPermissions(defaultPermissions);
    }
  }, [user]);

  const updatePermissionsMutation = useMutation({
    mutationFn: async (newPermissions: PermissionState) => {
      return await apiRequest(`/api/company-users/${user!.id}/permissions`, "PATCH", { permissions: newPermissions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-users"] });
      toast({
        title: "Permissões atualizadas",
        description: "As permissões do usuário foram atualizadas com sucesso.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar as permissões.",
        variant: "destructive",
      });
    },
  });

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: checked,
    }));
  };

  const handleSave = () => {
    updatePermissionsMutation.mutate(permissions);
  };

  const getPermissionLabel = (permission: string) => {
    const labels: { [key: string]: string } = {
      [PERMISSIONS.ORDERS.VIEW]: "Visualizar Pedidos",
      [PERMISSIONS.ORDERS.CREATE]: "Criar Pedidos",
      [PERMISSIONS.ORDERS.EDIT]: "Editar Pedidos",
      [PERMISSIONS.ORDERS.DELETE]: "Excluir Pedidos",
      [PERMISSIONS.ORDERS.EXPORT]: "Exportar Pedidos",
      [PERMISSIONS.USERS.VIEW]: "Visualizar Usuários",
      [PERMISSIONS.USERS.CREATE]: "Criar Usuários",
      [PERMISSIONS.USERS.EDIT]: "Editar Usuários",
      [PERMISSIONS.USERS.DELETE]: "Excluir Usuários",
      [PERMISSIONS.USERS.MANAGE_PERMISSIONS]: "Gerenciar Permissões",
      [PERMISSIONS.REPORTS.VIEW]: "Visualizar Relatórios",
      [PERMISSIONS.REPORTS.EXPORT]: "Exportar Relatórios",
      [PERMISSIONS.SETTINGS.VIEW]: "Visualizar Configurações",
      [PERMISSIONS.SETTINGS.EDIT]: "Editar Configurações",
    };
    return labels[permission] || permission;
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      ORDERS: "Gestão de Pedidos",
      USERS: "Gestão de Usuários",
      REPORTS: "Relatórios",
      SETTINGS: "Configurações",
    };
    return labels[category] || category;
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Permissões do Usuário: {user.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(PERMISSIONS).map(([categoryKey, categoryPermissions]) => (
            <div key={categoryKey} className="space-y-3">
              <h3 className="text-lg font-medium">
                {getCategoryLabel(categoryKey)}
              </h3>
              <div className="space-y-2">
                {Object.values(categoryPermissions).map((permission) => (
                  <div key={permission} className="flex items-center justify-between">
                    <Label
                      htmlFor={permission}
                      className="text-sm font-normal"
                    >
                      {getPermissionLabel(permission)}
                    </Label>
                    <Switch
                      id={permission}
                      checked={permissions[permission] || false}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(permission, checked)
                      }
                    />
                  </div>
                ))}
              </div>
              <Separator />
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updatePermissionsMutation.isPending}
          >
            {updatePermissionsMutation.isPending ? "Salvando..." : "Salvar Permissões"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}