import React from 'react';
import { Home, ShoppingBag, Gavel, Store, Wrench, ShieldCheck, Layers, Users, Handshake, Image as ImageIcon } from 'lucide-react';

export interface MenuItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export interface DropdownMenuItem {
  title: string;
  href: string;
  description: string;
}

export const SITE_MENU_ITEMS: MenuItem[] = [
  { to: '/showcase', icon: <Layers className="w-5 h-5" />, label: 'Showcase' },
  { to: '/participants', icon: <Users className="w-5 h-5" />, label: 'Deltagare' },
  { to: '/partners', icon: <Handshake className="w-5 h-5" />, label: 'Partners' },
  { to: '/media', icon: <ImageIcon className="w-5 h-5" />, label: 'Mediagalleri' },
];

export const MARKETPLACE_MENU_ITEMS: MenuItem[] = [
  { to: '/marketplace', icon: <ShoppingBag className="w-5 h-5" />, label: 'Marketplace Hem' },
  { to: '/marketplace/auctions', icon: <Gavel className="w-5 h-5" />, label: 'Auktioner' },
  { to: '/marketplace/shop', icon: <Store className="w-5 h-5" />, label: 'Butik' },
  { to: '/marketplace/services', icon: <Wrench className="w-5 h-5" />, label: 'Tjänster' },
];

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  { to: '/admin', icon: <ShieldCheck className="w-5 h-5" />, label: 'Admin Dashboard' },
];

export const SITE_DROPDOWN_ITEMS: DropdownMenuItem[] = [
  { title: 'Showcase', href: '/showcase', description: 'Utforska våra projekt' },
  { title: 'Deltagare', href: '/participants', description: 'Möt våra deltagare' },
  { title: 'Partners', href: '/partners', description: 'Våra samarbetspartners' },
  { title: 'Mediagalleri', href: '/media', description: 'Bilder och videos' },
];

export const MARKETPLACE_DROPDOWN_ITEMS: DropdownMenuItem[] = [
  { title: 'Auktioner', href: '/marketplace/auctions', description: 'Bjud på unika föremål' },
  { title: 'Butik', href: '/marketplace/shop', description: 'Handla produkter direkt' },
  { title: 'Tjänster', href: '/marketplace/services', description: 'Boka professionella tjänster' },
];
