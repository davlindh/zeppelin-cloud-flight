import { UserManagement } from '@/components/admin/users/UserManagement';
import { useUserMutations } from '@/hooks/marketplace/useUserManagement';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';

export const UsersPage = () => {
  const { updateUserRole, updateUserStatus } = useUserMutations();
  const { logAdminAction } = useAdminAuditLog();

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole.mutateAsync({ 
        userId, 
        newRole: newRole as 'admin' | 'moderator' | 'customer' | 'participant'
      });
      logAdminAction({
        action: 'user_role_change',
        details: { userId, newRole, timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleUserStatusChange = async (userId: string, newStatus: string) => {
    try {
      await updateUserStatus.mutateAsync({ 
        userId, 
        isActive: newStatus === 'active' 
      });
      logAdminAction({
        action: 'user_status_change',
        details: { userId, newStatus, timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage user accounts and permissions</p>
      </div>
      <UserManagement
        onUserRoleChange={handleUserRoleChange}
        onUserStatusChange={handleUserStatusChange}
      />
    </div>
  );
};
