import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCommissionSettings, useCommissionSettingsMutations } from '@/hooks/marketplace/useCommissionSettings';
import { CommissionRuleForm } from '@/components/admin/commerce/CommissionRuleForm';
import { Plus, Edit2, Trash2, Power } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { CommissionSetting } from '@/types/commerce';

export const CommissionSettings = () => {
  const { data: settings = [], isLoading } = useCommissionSettings();
  const { createSetting, updateSetting, deleteSetting } = useCommissionSettingsMutations();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<CommissionSetting | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (data: Omit<CommissionSetting, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createSetting.mutateAsync(data);
      toast({ title: 'Commission rule created' });
      setIsFormOpen(false);
    } catch (error) {
      toast({ title: 'Failed to create rule', variant: 'destructive' });
    }
  };

  const handleUpdate = async (data: Partial<CommissionSetting> & { id: string }) => {
    try {
      await updateSetting.mutateAsync(data);
      toast({ title: 'Commission rule updated' });
      setEditingSetting(null);
    } catch (error) {
      toast({ title: 'Failed to update rule', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteSetting.mutateAsync(deletingId);
      toast({ title: 'Commission rule deleted' });
      setDeletingId(null);
    } catch (error) {
      toast({ title: 'Failed to delete rule', variant: 'destructive' });
    }
  };

  const toggleActive = async (setting: CommissionSetting) => {
    await handleUpdate({ id: setting.id, isActive: !setting.isActive });
  };

  if (isLoading) {
    return <div>Loading commission settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Commission Settings</h1>
          <p className="text-muted-foreground">Manage platform commission rates and rules</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission Rules</CardTitle>
          <CardDescription>Rules are applied in priority order: Product → Seller → Event → Category → Default</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell>
                    <Badge variant="outline">{setting.ruleType}</Badge>
                  </TableCell>
                  <TableCell>{setting.referenceId || '-'}</TableCell>
                  <TableCell className="font-bold">{setting.commissionRate}%</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {setting.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={setting.isActive ? 'default' : 'secondary'}>
                      {setting.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(setting)}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSetting(setting)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingId(setting.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {(isFormOpen || editingSetting) && (
        <CommissionRuleForm
          isOpen={isFormOpen || !!editingSetting}
          onClose={() => {
            setIsFormOpen(false);
            setEditingSetting(null);
          }}
          onSubmit={editingSetting ? handleUpdate : handleCreate}
          initialData={editingSetting || undefined}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Commission Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this commission rule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
