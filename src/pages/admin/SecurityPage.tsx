import { SecurityDashboard } from '@/components/admin/security/SecurityDashboard';

export const SecurityPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security</h1>
        <p className="text-muted-foreground">Monitor security status and access logs</p>
      </div>
      <SecurityDashboard />
    </div>
  );
};
