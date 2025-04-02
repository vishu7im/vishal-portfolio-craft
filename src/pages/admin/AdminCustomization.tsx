
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePortfolioData, AppTheme } from '@/services/dataService';
import { Paintbrush, TextCursor, Palette } from 'lucide-react';

// Font options
const fonts = [
  { name: "Default", value: "system-ui, sans-serif" },
  { name: "Sans", value: "'Open Sans', sans-serif" },
  { name: "Serif", value: "'Playfair Display', serif" },
  { name: "Mono", value: "'Roboto Mono', monospace" },
];

// Color palette options
const colorPalettes = [
  { name: "Default", primary: "hsl(var(--primary))", accent: "hsl(var(--accent))" },
  { name: "Ocean", primary: "#0ea5e9", accent: "#22d3ee" },
  { name: "Forest", primary: "#10b981", accent: "#84cc16" },
  { name: "Sunset", primary: "#f97316", accent: "#f59e0b" },
  { name: "Berry", primary: "#8b5cf6", accent: "#d946ef" },
];

const AdminCustomization: React.FC = () => {
  const [theme, setTheme] = usePortfolioData<AppTheme | undefined>('theme');
  const [activeTab, setActiveTab] = useState('theme');
  const [formData, setFormData] = useState<AppTheme>({
    name: theme?.name || 'Default',
    primaryColor: theme?.primaryColor || colorPalettes[0].primary,
    accentColor: theme?.accentColor || colorPalettes[0].accent,
    fontFamily: theme?.fontFamily || fonts[0].value,
  });

  const handleColorPaletteChange = (paletteName: string) => {
    const palette = colorPalettes.find(p => p.name === paletteName);
    if (palette) {
      setFormData(prev => ({
        ...prev,
        name: palette.name,
        primaryColor: palette.primary,
        accentColor: palette.accent,
      }));
    }
  };

  const handleFontChange = (fontName: string) => {
    const font = fonts.find(f => f.name === fontName);
    if (font) {
      setFormData(prev => ({
        ...prev,
        fontFamily: font.value,
      }));

      // Apply font immediately for preview
      document.documentElement.style.setProperty('--font-family', font.value);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Apply color immediately for preview
    if (name === 'primaryColor') {
      document.documentElement.style.setProperty('--primary', value);
    } else if (name === 'accentColor') {
      document.documentElement.style.setProperty('--accent', value);
    }
  };

  const saveChanges = () => {
    setTheme(formData);
    
    // Apply changes
    document.documentElement.style.setProperty('--font-family', formData.fontFamily);
    document.documentElement.style.setProperty('--primary', formData.primaryColor);
    document.documentElement.style.setProperty('--accent', formData.accentColor);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customization</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="theme">
            <Palette className="h-4 w-4 mr-2" />
            Theme & Colors
          </TabsTrigger>
          <TabsTrigger value="typography">
            <TextCursor className="h-4 w-4 mr-2" />
            Typography
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Color Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Color Palettes</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {colorPalettes.map((palette) => (
                    <div
                      key={palette.name}
                      className={`border rounded-lg p-4 cursor-pointer hover:border-primary transition-all ${
                        formData.name === palette.name ? 'border-primary-500 ring-2 ring-primary/30' : ''
                      }`}
                      onClick={() => handleColorPaletteChange(palette.name)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{palette.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <div
                          className="w-10 h-10 rounded-full"
                          style={{ backgroundColor: palette.primary }}
                        ></div>
                        <div
                          className="w-10 h-10 rounded-full"
                          style={{ backgroundColor: palette.accent }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Custom Colors</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Primary Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.primaryColor.startsWith('#') ? formData.primaryColor : '#6E59A5'} // Default if not a hex color
                        onChange={(e) => handleColorChange({
                          target: { name: 'primaryColor', value: e.target.value }
                        } as React.ChangeEvent<HTMLInputElement>)}
                        className="w-10 h-10 rounded-md cursor-pointer"
                      />
                      <Input
                        name="primaryColor"
                        value={formData.primaryColor}
                        onChange={handleColorChange}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Accent Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.accentColor.startsWith('#') ? formData.accentColor : '#D6BCFA'} // Default if not a hex color
                        onChange={(e) => handleColorChange({
                          target: { name: 'accentColor', value: e.target.value }
                        } as React.ChangeEvent<HTMLInputElement>)}
                        className="w-10 h-10 rounded-md cursor-pointer"
                      />
                      <Input
                        name="accentColor"
                        value={formData.accentColor}
                        onChange={handleColorChange}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className="p-6 rounded-lg shadow-md text-center"
                    style={{ backgroundColor: formData.primaryColor, color: '#fff' }}
                  >
                    <h4 className="text-lg font-bold">Primary Color</h4>
                  </div>
                  <div
                    className="p-6 rounded-lg shadow-md text-center"
                    style={{ backgroundColor: formData.accentColor, color: '#fff' }}
                  >
                    <h4 className="text-lg font-bold">Accent Color</h4>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="typography">
          <Card>
            <CardHeader>
              <CardTitle>Typography Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Font Family</label>
                <Select
                  value={fonts.find(f => f.value === formData.fontFamily)?.name || "Default"}
                  onValueChange={handleFontChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Font" />
                  </SelectTrigger>
                  <SelectContent>
                    {fonts.map((font) => (
                      <SelectItem key={font.name} value={font.name}>
                        <span style={{ fontFamily: font.value }}>{font.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Preview</h3>
                <div 
                  className="p-6 rounded-lg border shadow-sm" 
                  style={{ fontFamily: formData.fontFamily }}
                >
                  <h1 className="text-2xl font-bold mb-2">Heading Example</h1>
                  <p className="mb-4">
                    This is a paragraph showing how the selected font will appear on your website.
                    The quick brown fox jumps over the lazy dog.
                  </p>
                  <div>
                    <span className="font-bold">Bold text</span> and 
                    <span className="italic ml-1">italic text</span> examples.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end mt-6">
        <Button onClick={saveChanges}>
          Save Customization
        </Button>
      </div>
    </div>
  );
};

export default AdminCustomization;
