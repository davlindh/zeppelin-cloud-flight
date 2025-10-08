
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Mail, Smartphone, Bell, Settings, Clock } from 'lucide-react';
import { useNotificationPreferences } from '@/hooks/marketplace/useNotificationPreferences';

export const NotificationPreferences: React.FC = () => {
  const { preferences, updatePreferences, resetToDefaults: _resetToDefaults, isLoaded } = useNotificationPreferences();

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Delivery Methods */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Delivery Methods
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" />
                <Label htmlFor="email-notifications">Email Notifications</Label>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => 
                  updatePreferences({ emailNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-slate-500" />
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <Badge variant="secondary" className="text-xs">Browser</Badge>
              </div>
              <Switch
                id="push-notifications"
                checked={preferences.pushNotifications}
                onCheckedChange={(checked) => 
                  updatePreferences({ pushNotifications: checked })
                }
              />
            </div>
          </div>

          <Separator />

          {/* Alert Types */}
          <div className="space-y-4">
            <h3 className="font-semibold">Alert Types</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="price-drops">Price Drop Alerts</Label>
                <Switch
                  id="price-drops"
                  checked={preferences.priceDropAlerts}
                  onCheckedChange={(checked) => 
                    updatePreferences({ priceDropAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="stock-alerts">Stock Level Alerts</Label>
                <Switch
                  id="stock-alerts"
                  checked={preferences.stockAlerts}
                  onCheckedChange={(checked) => 
                    updatePreferences({ stockAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="back-in-stock">Back in Stock Alerts</Label>
                <Switch
                  id="back-in-stock"
                  checked={preferences.backInStockAlerts}
                  onCheckedChange={(checked) => 
                    updatePreferences({ backInStockAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auction-ending">Auction Ending Alerts</Label>
                <Switch
                  id="auction-ending"
                  checked={preferences.auctionEndingAlerts}
                  onCheckedChange={(checked) => 
                    updatePreferences({ auctionEndingAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="outbid-alerts">Outbid Alerts</Label>
                <Switch
                  id="outbid-alerts"
                  checked={preferences.outbidAlerts}
                  onCheckedChange={(checked) => 
                    updatePreferences({ outbidAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="new-items">New Items in Categories</Label>
                <Switch
                  id="new-items"
                  checked={preferences.newItemsInCategories}
                  onCheckedChange={(checked) => 
                    updatePreferences({ newItemsInCategories: checked })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Frequency & Digest */}
          <div className="space-y-4">
            <h3 className="font-semibold">Frequency & Digest</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="immediate">Immediate Notifications</Label>
                <Switch
                  id="immediate"
                  checked={preferences.frequency.immediate}
                  onCheckedChange={(checked) => 
                    updatePreferences({ 
                      frequency: { ...preferences.frequency, immediate: checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="daily-digest">Daily Digest</Label>
                <Switch
                  id="daily-digest"
                  checked={preferences.dailyDigest}
                  onCheckedChange={(checked) => 
                    updatePreferences({ dailyDigest: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="weekly-recommendations">Weekly Recommendations</Label>
                <Switch
                  id="weekly-recommendations"
                  checked={preferences.weeklyRecommendations}
                  onCheckedChange={(checked) => 
                    updatePreferences({ weeklyRecommendations: checked })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Quiet Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Quiet Hours
            </h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
              <Switch
                id="quiet-hours"
                checked={preferences.quietHours.enabled}
                onCheckedChange={(checked) => 
                  updatePreferences({ 
                    quietHours: { ...preferences.quietHours, enabled: checked }
                  })
                }
              />
            </div>

            {preferences.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quiet-start" className="text-sm text-slate-600">Start Time</Label>
                  <input
                    id="quiet-start"
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) => 
                      updatePreferences({
                        quietHours: { ...preferences.quietHours, start: e.target.value }
                      })
                    }
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="quiet-end" className="text-sm text-slate-600">End Time</Label>
                  <input
                    id="quiet-end"
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) => 
                      updatePreferences({
                        quietHours: { ...preferences.quietHours, end: e.target.value }
                      })
                    }
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
