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
  DollarSign,
  Ticket,
  CalendarCheck,
  Heart,
  TrendingDown,
  Link2,
  Key
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
import { useFilteredSidebarSections } from "@/hooks/useCanViewSection"

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
  { title: "Permissions", path: "/admin/settings/permissions", icon: Key, description: "Role permissions" },
  { title: "Data Cleanup", path: "/admin/data-cleanup", icon: Shield, description: "Data quality tools" },
  { title: "Security", path: "/admin/security", icon: Shield, description: "Security overview" }
]

const commerceSections = [
  { title: "Commerce Overview", path: "/admin/commerce/overview", icon: TrendingUp, description: "Sales & revenue dashboard" },
  { title: "Commission Settings", path: "/admin/settings/commissions", icon: Percent, description: "Manage commission rules" },
  { title: "Role Permissions", path: "/admin/settings/permissions", icon: Shield, description: "Manage user roles & access" },
  { title: "Seller Management", path: "/admin/commerce/sellers", icon: ShoppingBag, description: "Manage sellers & payouts" },
  { title: "Event Analytics", path: "/admin/commerce/events", icon: Calendar, description: "Sales per event" },
]

const eventsSections = [
  { title: "All Events", path: "/admin/events", icon: Calendar, description: "Manage events", badge: "upcomingEvents" },
  { title: "Event Tickets", path: "/admin/events/tickets", icon: Ticket, description: "Ticket sales & inventory", badge: "lowStockTickets" },
  { title: "Registrations", path: "/admin/events/registrations", icon: CalendarCheck, description: "Attendee management", badge: "pendingRegistrations" },
]

const campaignsSections = [
  { title: "All Campaigns", path: "/admin/campaigns", icon: Heart, description: "Funding campaigns", badge: "draftCampaigns" },
  { title: "Campaign Linkages", path: "/admin/campaigns/linkage", icon: Link2, description: "Manage connections" },
  { title: "Active Campaigns", path: "/admin/campaigns?status=active", icon: TrendingUp, description: "Currently fundraising", badge: "activeCampaigns" },
  { title: "Ending Soon", path: "/admin/campaigns?ending=true", icon: TrendingDown, description: "Campaigns closing", badge: "endingCampaigns" },
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

  // Filter sections based on permissions
  const filteredZeppelSections = useFilteredSidebarSections(zeppelSections);
  const filteredMarketplaceSections = useFilteredSidebarSections(marketplaceSections);
  const filteredCommerceSections = useFilteredSidebarSections(commerceSections);
  const filteredEventsSections = useFilteredSidebarSections(eventsSections);
  const filteredCampaignsSections = useFilteredSidebarSections(campaignsSections);

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  const getBadgeCount = (path: string, badgeKey?: string): number => {
    if (badgeKey) {
      return counts[badgeKey as keyof typeof counts] || 0
    }
    
    if (path.includes('messages')) return counts.unreadMessages || 0
    if (path.includes('bookings')) return counts.pendingBookings || 0
    if (path.includes('orders')) return counts.pendingOrders || 0
    if (path.includes('products')) return counts.lowStockProducts || 0
    if (path.includes('auctions')) return counts.endingAuctions || 0
    
    return 0
  }

  const handleClick = (path: string) => {
    window.location.href = path
  }

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Zeppel Admin Section */}
        {filteredZeppelSections.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-muted-foreground">
            Zeppel Admin
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {filteredZeppelSections.map((section) => {
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
        )}

        {/* Marketplace Admin Section */}
        {filteredMarketplaceSections.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-muted-foreground">
            Marketplace Admin
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMarketplaceSections.map((section) => {
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
        )}
        {/* Commerce Admin Section */}
        {filteredCommerceSections.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-muted-foreground">
            Commerce Admin
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {filteredCommerceSections.map((section) => {
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
        )}

        {/* Events Management Section */}
        {filteredEventsSections.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-muted-foreground">
            Events Management
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {filteredEventsSections.map((section) => {
                const badgeCount = section.badge ? getBadgeCount(section.path, section.badge) : 0
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
                          <Badge 
                            variant={section.badge === 'lowStockTickets' ? "destructive" : "secondary"} 
                            className="shrink-0 text-xs"
                          >
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
        )}

        {/* Funding Campaigns Section */}
        {filteredCampaignsSections.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-muted-foreground">
            Funding Campaigns
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {filteredCampaignsSections.map((section) => {
                const badgeCount = section.badge ? getBadgeCount(section.path, section.badge) : 0
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
                          <Badge 
                            variant={section.badge === 'endingCampaigns' ? "destructive" : "secondary"} 
                            className="shrink-0 text-xs"
                          >
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
        )}
      </SidebarContent>
    </Sidebar>
  )
}
