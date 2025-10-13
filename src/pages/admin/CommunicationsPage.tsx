import { CommunicationsTable } from '@/components/admin/communications/CommunicationsTable';

export const CommunicationsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Communications</h1>
        <p className="text-muted-foreground">View and respond to customer messages</p>
      </div>
      <CommunicationsTable />
    </div>
  );
};
