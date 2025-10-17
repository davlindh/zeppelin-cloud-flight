import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { AlertCircle, Image, Package, Gavel } from 'lucide-react';

interface QuickActionsProps {
  submissionsPending: number;
  mediaPending: number;
  lowStockCount: number;
  endingTodayCount: number;
}

export const QuickActions = ({
  submissionsPending,
  mediaPending,
  lowStockCount,
  endingTodayCount,
}: QuickActionsProps) => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Granska väntande inlämningar',
      count: submissionsPending,
      icon: AlertCircle,
      path: '/admin/submissions',
      show: submissionsPending > 0,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
    },
    {
      label: 'Godkänn media',
      count: mediaPending,
      icon: Image,
      path: '/admin/media',
      show: mediaPending > 0,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      label: 'Hantera lågt lager',
      count: lowStockCount,
      icon: Package,
      path: '/admin/marketplace/products',
      show: lowStockCount > 0,
      color: 'text-red-600 bg-red-50 border-red-200',
    },
    {
      label: 'Auktioner som snart slutar',
      count: endingTodayCount,
      icon: Gavel,
      path: '/admin/marketplace/auctions',
      show: endingTodayCount > 0,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
  ].filter(action => action.show);

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => (
        <Card
          key={action.label}
          className={`p-4 cursor-pointer hover:shadow-md transition-all border ${action.color}`}
          onClick={() => navigate(action.path)}
        >
          <div className="flex items-center gap-3">
            <action.icon className="h-5 w-5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{action.label}</p>
              <p className="text-lg font-bold">{action.count}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
