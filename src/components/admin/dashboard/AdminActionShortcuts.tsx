import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  Settings,
  Briefcase,
  MessageSquare,
  Shield
} from 'lucide-react';
import { Kbd } from '@/components/ui/kbd';

export const AdminActionShortcuts = () => {
  const navigate = useNavigate();

  const shortcuts = [
    { 
      icon: FileText, 
      label: 'Applications', 
      key: 'A', 
      path: '/admin/applications',
      color: 'text-blue-600'
    },
    { 
      icon: Users, 
      label: 'Users', 
      key: 'U', 
      path: '/admin/users',
      color: 'text-green-600'
    },
    { 
      icon: Package, 
      label: 'Products', 
      key: 'P', 
      path: '/admin/products',
      color: 'text-purple-600'
    },
    { 
      icon: Briefcase, 
      label: 'Services', 
      key: 'S', 
      path: '/admin/services',
      color: 'text-orange-600'
    },
    { 
      icon: ShoppingCart, 
      label: 'Orders', 
      key: 'O', 
      path: '/admin/orders',
      color: 'text-pink-600'
    },
    { 
      icon: MessageSquare, 
      label: 'Messages', 
      key: 'M', 
      path: '/admin/communications',
      color: 'text-cyan-600'
    },
    { 
      icon: Shield, 
      label: 'Security', 
      key: 'E', 
      path: '/admin/security',
      color: 'text-red-600'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      key: 'T', 
      path: '/admin/settings',
      color: 'text-gray-600'
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>
          Jump to any section • Press <Kbd>?</Kbd> for all shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {shortcuts.map(({ icon: Icon, label, key, path, color }) => (
            <Button
              key={key}
              variant="outline"
              className="h-auto flex-col gap-2 py-4 hover:bg-accent"
              onClick={() => navigate(path)}
            >
              <Icon className={`h-5 w-5 ${color}`} />
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-medium">{label}</span>
                <Kbd className="text-[10px]">{key}</Kbd>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
