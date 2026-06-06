"use client";

import { useState } from "react";
import { 
  useRoles, 
  usePermissions, 
  useCreateRole, 
  useUpdateRole, 
  useDeleteRole,
  Role,
  PermissionDefinition
} from "@/hooks/use-roles";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Shield, 
  Loader2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

export default function RolesPage() {
  const { data: roles, isLoading: isLoadingRoles } = useRoles();
  const { data: allPermissions, isLoading: isLoadingPermissions } = usePermissions();
  
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleName(role.name);
      setSelectedPermissions(role.permissions);
    } else {
      setEditingRole(null);
      setRoleName("");
      setSelectedPermissions([]);
    }
    setIsDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!roleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      if (editingRole) {
        await updateMutation.mutateAsync({
          id: editingRole.id,
          permissions: selectedPermissions,
        });
        toast.success("Role updated successfully");
      } else {
        await createMutation.mutateAsync({
          name: roleName,
          permissions: selectedPermissions,
        });
        toast.success("Role created successfully");
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save role");
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Role deleted successfully");
    } catch (error) {
      toast.error("Failed to delete role");
    }
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev => 
      prev.includes(perm) 
        ? prev.filter(p => p !== perm) 
        : [...prev, perm]
    );
  };

  if (isLoadingRoles || isLoadingPermissions) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Group permissions by resource
  const groupedPermissions = allPermissions?.reduce((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, PermissionDefinition[]>) ?? {};

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground">
            Define custom roles and assign granular permissions to your staff.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles?.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic">No permissions</span>
                    ) : role.permissions.includes("*") ? (
                      <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                        Full Access (*)
                      </Badge>
                    ) : (
                      <>
                        {role.permissions.slice(0, 3).map((p) => (
                          <Badge key={p} variant="secondary" className="text-[10px]">
                            {p}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{role.permissions.length - 3} more
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {role.is_system ? (
                    <Badge variant="outline" className="bg-muted text-muted-foreground">System</Badge>
                  ) : (
                    <Badge variant="outline">Custom</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(role)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {!role.is_system && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
            <DialogDescription>
              Set a name and select permissions for this role.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6 py-4 overflow-y-auto pr-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. Property Manager"
                disabled={!!editingRole && editingRole.is_system}
              />
            </div>

            <div className="space-y-4">
              <Label>Permissions</Label>
              <div className="grid gap-6">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource} className="space-y-2">
                    <h3 className="text-sm font-semibold capitalize border-b pb-1">
                      {resource.replace("_", " ")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map((perm) => {
                        const permKey = `${perm.resource}:${perm.action}`;
                        const isSelected = selectedPermissions.includes(permKey) || selectedPermissions.includes("*");
                        return (
                          <div 
                            key={permKey}
                            className={`flex items-start gap-3 p-2 rounded-lg border transition-colors cursor-pointer ${
                              isSelected ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'
                            }`}
                            onClick={() => togglePermission(permKey)}
                          >
                            <div className="pt-0.5">
                              {isSelected ? (
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border" />
                              )}
                            </div>
                            <div className="grid gap-0.5">
                              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                {perm.action}
                              </span>
                              <p className="text-sm leading-none">
                                {perm.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingRole ? "Update Role" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
