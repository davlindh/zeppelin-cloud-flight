import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { AnimatedDropdownContent } from './AnimatedDropdownContent';
import { AnimatedListItem } from './AnimatedListItem';

interface NavigationItem {
  title: string;
  href: string;
  description?: string;
}

interface NavigationDropdownProps {
  title: string;
  items: NavigationItem[];
  variant?: 'default' | 'marketplace';
}

export const NavigationDropdown: React.FC<NavigationDropdownProps> = ({
  title,
  items,
  variant = 'default',
}) => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger 
            className={cn(
              "text-sm font-semibold tracking-wider uppercase",
              variant === 'marketplace' && "text-amber-600 hover:text-amber-700"
            )}
          >
            {title}
          </NavigationMenuTrigger>
          <AnimatedDropdownContent className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-popover border border-border shadow-lg rounded-md">
            {items.map((item) => (
              <AnimatedListItem
                key={item.href}
                title={item.title}
                href={item.href}
                description={item.description}
              />
            ))}
          </AnimatedDropdownContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

