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
  Tags
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

const adminSections = [
  { title: "Dashboard", tab: "dashboard", icon: BarChart3, description: "Overview & metrics" },
  { title: "Products", tab: "products", icon: Package, description: "Manage inventory" },
  { title: "Auctions", tab: "auctions", icon: Gavel, description: "Auction management" },
  { title: "Services", tab: "services", icon: Wrench, description: "Service offerings" },
  { title: "Messages", tab: "messages", icon: MessageSquare, description: "Communications" },
  { title: "Bookings", tab: "bookings", icon: Calendar, description: "Service bookings" },
  { title: "Orders", tab: "orders", icon: ShoppingCart, description: "Purchase orders" },
  { title: "Users", tab: "users", icon: Users, description: "User management" },
  { title: "Providers", tab: "providers", icon: Building, description: "Service providers" },
  { title: "Categories", tab: "categories", icon: Tags, description: "Category management" },
  { title: "Brands", tab: "brands", icon: Package, description: "Brand management" },
  { title: "Security", tab: "security", icon: Shield, description: "Security overview" }
]

interface AppSidebarAdminProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AppSidebarAdmin({ activeTab, onTabChange }: AppSidebarAdminProps) {
  const { state } = useSidebar()
  const counts = useAdminCounts()
  const collapsed = state === 'collapsed'

  const isActive = (tab: string) => activeTab === tab

  const getBadgeCount = (tab: string): number => {
    switch (tab) {
      case 'messages':
        return counts.unreadMessages || 0
      case 'bookings':
        return counts.pendingBookings || 0
      case 'orders':
        return counts.pendingOrders || 0
      case 'products':
        return counts.lowStockProducts || 0
      case 'auctions':
        return counts.endingAuctions || 0
      default:
        return 0
    }
  }

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-muted-foreground">
            Admin Panel
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {adminSections.map((section) => {
                const badgeCount = getBadgeCount(section.tab)
                
                return (
                  <SidebarMenuItem key={section.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={isActive(section.tab) ? "bg-accent text-accent-foreground" : ""}
                    >
                      <button
                        onClick={() => onTabChange(section.tab)}
                        className="w-full flex items-center justify-between p-2 hover:bg-accent/50 rounded-md transition-colors"
                      >
                        <div className="flex items-center">
                          <section.icon className="h-4 w-4 mr-2 shrink-0" />
                          {!collapsed && (
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-medium">{section.title}</span>
                              <span className="text-xs text-muted-foreground">{section.description}</span>
                            </div>
                          )}
                        </div>
                        {!collapsed && badgeCount > 0 && (
                          <Badge variant="secondary" className="ml-auto text-xs">
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