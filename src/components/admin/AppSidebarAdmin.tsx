import { useLocation } from 'react-router-dom';
import { 
  Users, 
  Package, 
  Gavel, 
  Wrench, 
  MessageSquare, 
  Calendar, 
  ShoppingCart, 
  BarChart3, 
  Shield, 
  Building,
  Tags,
  FolderOpen,
  HandHeart,
  Image,
  TrendingUp,
  Percent,
  ShoppingBag,
  DollarSign
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { useAdminCounts } from "@/hooks/useAdminCounts"

const zeppelSections = [
  { title: "Inlämningar", path: "/admin/submissions", icon: MessageSquare, description: "Hantera inlämningar" },
  { title: "Deltagare", path: "/admin/participants-management", icon: Users, description: "Hantera deltagare" },
  { title: "Projekt", path: "/admin/projects-management", icon: FolderOpen, description: "Showcase-projekt" },
  { title: "Sponsorer", path: "/admin/sponsors-management", icon: HandHeart, description: "Partners & sponsorer" },
  { title: "Media", path: "/admin/media", icon: Image, description: "Media library" },
  { title: "Donationer", path: "/admin/donations", icon: DollarSign, description: "Donation management" },
]

const marketplaceSections = [
  { title: "Dashboard", path: "/admin", icon: BarChart3, description: "Overview & metrics" },
  { title: "Products", path: "/admin/products", icon: Package, description: "Manage inventory" },
  { title: "Auctions", path: "/admin/auctions", icon: Gavel, description: "Auction management" },
  { title: "Services", path: "/admin/services", icon: Wrench, description: "Service offerings" },
  { title: "Messages", path: "/admin/messages", icon: MessageSquare, description: "Communications" },
  { title: "Bookings", path: "/admin/bookings", icon: Calendar, description: "Service bookings" },
  { title: "Orders", path: "/admin/orders", icon: ShoppingCart, description: "Purchase orders" },
  { title: "Users", path: "/admin/users", icon: Users, description: "User management" },
  { title: "Applications", path: "/admin/applications", icon: Shield, description: "Role applications" },
  { title: "Providers", path: "/admin/providers", icon: Building, description: "Service providers" },
  { title: "Categories", path: "/admin/categories", icon: Tags, description: "Category management" },
  { title: "Brands", path: "/admin/brands", icon: Package, description: "Brand management" },
  { title: "Data Cleanup", path: "/admin/data-cleanup", icon: Shield, description: "Data quality tools" },
  { title: "Security", path: "/admin/security", icon: Shield, description: "Security overview" }
]

const commerceSections = [
  { title: "Commerce Overview", path: "/admin/commerce/overview", icon: TrendingUp, description: "Sales & revenue dashboard" },
  { title: "Commission Settings", path: "/admin/settings/commissions", icon: Percent, description: "Manage commission rules" },
  { title: "Seller Management", path: "/admin/commerce/sellers", icon: ShoppingBag, description: "Manage sellers & payouts" },
  { title: "Event Analytics", path: "/admin/commerce/events", icon: Calendar, description: "Sales per event" },
]

interface AppSidebarAdminProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AppSidebarAdmin({ activeTab, onTabChange }: AppSidebarAdminProps) {
  const { state } = useSidebar()
  const location = useLocation()
  const counts = useAdminCounts()
  const collapsed = state === 'collapsed'

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  const getBadgeCount = (path: string): number => {
    if (path.includes('messages')) return counts.unreadMessages || 0
    if (path.includes('bookings')) return counts.pendingBookings || 0
    if (path.includes('orders')) return counts.pendingOrders || 0
    if (path.includes('products')) return counts.lowStockProducts || 0
    if (path.includes('auctions')) return counts.endingAuctions || 0
    // TODO: Add pending products count when available in AdminCounts
    return 0
  }

  const handleClick = (path: string) => {
    window.location.href = path
  }

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Zeppel Admin Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-muted-foreground">
            Zeppel Admin
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {zeppelSections.map((section) => {
                const active = isActive(section.path)
                
                return (
                  <SidebarMenuItem key={section.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={active ? "bg-accent text-accent-foreground" : ""}
                    >
                      <button
                        onClick={() => handleClick(section.path)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-accent/50 rounded-lg transition-all duration-200"
                      >
                        <div className={`flex items-center justify-center shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                          <section.icon className="h-5 w-5" />
                        </div>
                        {!collapsed && (
                          <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                            <span className="text-sm font-semibold leading-none">{section.title}</span>
                            <span className="text-xs text-muted-foreground leading-tight">{section.description}</span>
                          </div>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Marketplace Admin Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-muted-foreground">
            Marketplace Admin
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {marketplaceSections.map((section) => {
                const badgeCount = getBadgeCount(section.path)
                const active = isActive(section.path)
                
                return (
                  <SidebarMenuItem key={section.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={active ? "bg-accent text-accent-foreground" : ""}
                    >
                      <button
                        onClick={() => handleClick(section.path)}
                        className="w-full flex items-center justify-between gap-3 p-3 hover:bg-accent/50 rounded-lg transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`flex items-center justify-center shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                            <section.icon className="h-5 w-5" />
                          </div>
                          {!collapsed && (
                            <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                              <span className="text-sm font-semibold leading-none">{section.title}</span>
                              <span className="text-xs text-muted-foreground leading-tight">{section.description}</span>
                            </div>
                          )}
                        </div>
                        {!collapsed && badgeCount > 0 && (
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </Badge>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Commerce Admin Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-muted-foreground">
            Commerce Admin
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {commerceSections.map((section) => {
                const badgeCount = getBadgeCount(section.path)
                const active = isActive(section.path)
                
                return (
                  <SidebarMenuItem key={section.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={active ? "bg-accent text-accent-foreground" : ""}
                    >
                      <button
                        onClick={() => handleClick(section.path)}
                        className="w-full flex items-center justify-between gap-3 p-3 hover:bg-accent/50 rounded-lg transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`flex items-center justify-center shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                            <section.icon className="h-5 w-5" />
                          </div>
                          {!collapsed && (
                            <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                              <span className="text-sm font-semibold leading-none">{section.title}</span>
                              <span className="text-xs text-muted-foreground leading-tight">{section.description}</span>
                            </div>
                          )}
                        </div>
                        {!collapsed && badgeCount > 0 && (
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </Badge>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}