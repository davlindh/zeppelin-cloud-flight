import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAdaptiveTheme } from '@/contexts/ThemeContext';

type ThemeMode = 'light' | 'dark' | 'system';
type SeasonalMode = 'auto' | 'spring' | 'summer' | 'autumn' | 'winter' | 'off';
type CategoryTheme = 'electronics' | 'fashion' | 'home' | 'sports' | 'books' | 'beauty' | 'default';
import { useAdaptiveColors } from '@/hooks/useAdaptiveColors';
import { toHSLString } from '@/utils/colorUtils';

interface ThemeCustomizerProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  className = '',
  isOpen = false,
  onClose
}) => {
  const {
    preferences,
    effectiveTheme,
    currentColors,
    isSeasonalActive,
    setMode,
    setSeasonalMode,
    setCategoryTheme,
    toggleHighContrast,
    toggleTimeBasedAdjustment,
    updateCustomizations,
    resetToDefaults,
    getCurrentSeason
  } = useAdaptiveTheme();

  const { generateContrastPair } = useAdaptiveColors();
  const [previewMode, setPreviewMode] = useState<'live' | 'preview'>('live');

  if (!isOpen) return null;

  const handleHueChange = (type: 'primary' | 'accent', value: number[]) => {
    updateCustomizations({
      [type === 'primary' ? 'primaryHue' : 'accentHue']: value[0]
    });
  };

  const handleSaturationChange = (value: number[]) => {
    updateCustomizations({
      saturationBoost: value[0]
    });
  };

  const currentSeason = getCurrentSeason();

  return (
    <div className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm ${className}`}>
      <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-2xl overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Theme Customizer</h2>
              <p className="text-sm text-muted-foreground">
                Personalize your experience
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          <Tabs defaultValue="appearance" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="appearance">Theme</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🌓 Theme Mode
                    <Badge variant="outline">{effectiveTheme}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select 
                    value={preferences.mode} 
                    onValueChange={(value: string) => setMode(value as ThemeMode)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">High Contrast</label>
                      <p className="text-sm text-muted-foreground">
                        Enhance color contrast for better accessibility
                      </p>
                    </div>
                    <Switch
                      checked={preferences.highContrast}
                      onCheckedChange={toggleHighContrast}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🌸 Seasonal Themes
                    {isSeasonalActive && <Badge>Active</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select 
                    value={preferences.seasonal} 
                    onValueChange={(value: string) => setSeasonalMode(value as SeasonalMode)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto ({currentSeason})</SelectItem>
                      <SelectItem value="spring">🌸 Spring</SelectItem>
                      <SelectItem value="summer">☀️ Summer</SelectItem>
                      <SelectItem value="autumn">🍂 Autumn</SelectItem>
                      <SelectItem value="winter">❄️ Winter</SelectItem>
                      <SelectItem value="off">Off</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Time-based Adjustment</label>
                      <p className="text-sm text-muted-foreground">
                        Subtly adjust colors based on time of day
                      </p>
                    </div>
                    <Switch
                      checked={preferences.timeBasedAdjustment}
                      onCheckedChange={toggleTimeBasedAdjustment}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🏷️ Category Themes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={preferences.categoryTheme} 
                    onValueChange={(value: string) => setCategoryTheme(value as CategoryTheme)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="electronics">⚡ Electronics</SelectItem>
                      <SelectItem value="fashion">👗 Fashion</SelectItem>
                      <SelectItem value="home">🏠 Home</SelectItem>
                      <SelectItem value="sports">⚽ Sports</SelectItem>
                      <SelectItem value="books">📚 Books</SelectItem>
                      <SelectItem value="beauty">💄 Beauty</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>🎨 Color Customization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Primary Hue */}
                  <div className="space-y-3">
                    <label className="font-medium">Primary Hue</label>
                    <div className="px-3">
                      <Slider
                        value={[preferences.customizations.primaryHue || currentColors.primary.h]}
                        onValueChange={(value) => handleHueChange('primary', value)}
                        max={360}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ 
                          backgroundColor: `hsl(${preferences.customizations.primaryHue || currentColors.primary.h}, ${currentColors.primary.s}%, ${currentColors.primary.l}%)` 
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {preferences.customizations.primaryHue || currentColors.primary.h}°
                      </span>
                    </div>
                  </div>

                  {/* Accent Hue */}
                  <div className="space-y-3">
                    <label className="font-medium">Accent Hue</label>
                    <div className="px-3">
                      <Slider
                        value={[preferences.customizations.accentHue || currentColors.accent.h]}
                        onValueChange={(value) => handleHueChange('accent', value)}
                        max={360}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ 
                          backgroundColor: `hsl(${preferences.customizations.accentHue || currentColors.accent.h}, ${currentColors.accent.s}%, ${currentColors.accent.l}%)` 
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {preferences.customizations.accentHue || currentColors.accent.h}°
                      </span>
                    </div>
                  </div>

                  {/* Saturation Boost */}
                  <div className="space-y-3">
                    <label className="font-medium">Saturation Boost</label>
                    <div className="px-3">
                      <Slider
                        value={[preferences.customizations.saturationBoost ?? 0]}
                        onValueChange={handleSaturationChange}
                        max={30}
                        min={-30}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {preferences.customizations.saturationBoost ?? 0}%
                    </span>
                  </div>

                  <Separator />

                  {/* Color Preview */}
                  <div className="space-y-3">
                    <label className="font-medium">Current Palette</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(currentColors).map(([name, color]) => (
                        <div key={name} className="text-center">
                          <div 
                            className="w-full h-12 rounded border mb-1"
                            style={{ backgroundColor: `hsl(${toHSLString(color)})` }}
                          />
                          <span className="text-xs capitalize">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>⚙️ Advanced Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="font-medium">Preview Mode</label>
                    <Select value={previewMode} onValueChange={(value: string) => setPreviewMode(value as 'live' | 'preview')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live">Live Preview</SelectItem>
                        <SelectItem value="preview">Preview Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <label className="font-medium">Theme Information</label>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Mode: {effectiveTheme}</p>
                      <p>Season: {isSeasonalActive ? currentSeason : 'Disabled'}</p>
                      <p>Category: {preferences.categoryTheme}</p>
                      <p>High Contrast: {preferences.highContrast ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <label className="font-medium">Color Accessibility</label>
                    <div className="text-sm space-y-2">
                      {(() => {
                        const bgColor = effectiveTheme === 'dark' ? '220 15% 10%' : '0 0% 100%';
                        const primaryContrast = generateContrastPair(
                          toHSLString(currentColors.primary),
                          bgColor
                        );
                        return (
                          <div>
                            <p>Primary contrast ratio: {primaryContrast.ratio.toFixed(2)}</p>
                            <Badge variant={primaryContrast.ratio >= 4.5 ? 'default' : 'destructive'}>
                              {primaryContrast.ratio >= 7 ? 'AAA' : primaryContrast.ratio >= 4.5 ? 'AA' : 'Fail'}
                            </Badge>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🔄 Reset Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={resetToDefaults}
                  >
                    Reset to Defaults
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    This will reset all theme customizations to their default values
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};