import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteSettings } from "@/components/admin/settings/SiteSettings";
import { EmailSettings } from "@/components/admin/settings/EmailSettings";
import { NotificationSettings } from "@/components/admin/settings/NotificationSettings";
import { APISettings } from "@/components/admin/settings/APISettings";
import { BackupSettings } from "@/components/admin/settings/BackupSettings";

export const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your admin panel settings</p>
      </div>

      <Tabs defaultValue="site" className="space-y-4">
        <TabsList>
          <TabsTrigger value="site">Site</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="site" className="space-y-4">
          <SiteSettings />
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <EmailSettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <APISettings />
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <BackupSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
