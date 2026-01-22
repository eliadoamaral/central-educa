import { useState, useEffect } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface CardDisplaySettings {
  showName: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showValue: boolean;
  showLocation: boolean;
  showCourse: boolean;
  showSource: boolean;
  showTags: boolean;
  showNotes: boolean;
  showDate: boolean;
  showKPICards: boolean;
}

const LOCAL_STORAGE_KEY = "lead-card-display-settings";

const defaultSettings: CardDisplaySettings = {
  showName: true,
  showEmail: true,
  showPhone: true,
  showValue: true,
  showLocation: false,
  showCourse: true,
  showSource: true,
  showTags: true,
  showNotes: false,
  showDate: true,
  showKPICards: true,
};

const settingsLabels: Record<keyof CardDisplaySettings, string> = {
  showName: "Nome",
  showEmail: "E-mail",
  showPhone: "Telefone",
  showValue: "Valor",
  showLocation: "Cidade/Estado",
  showCourse: "Curso",
  showSource: "Origem",
  showTags: "Etiquetas",
  showNotes: "Observações",
  showDate: "Data de Cadastro",
  showKPICards: "Cards de KPI",
};

// Card fields order
const cardSettingsOrder: (keyof CardDisplaySettings)[] = [
  "showName",
  "showEmail",
  "showPhone",
  "showLocation",
  "showValue",
  "showCourse",
  "showSource",
  "showNotes",
  "showDate",
  "showTags",
];

// Page elements order
const pageSettingsOrder: (keyof CardDisplaySettings)[] = [
  "showKPICards",
];


interface LeadCardDisplaySettingsProps {
  settings: CardDisplaySettings;
  onSettingsChange: (settings: CardDisplaySettings) => void;
}

export function useCardDisplaySettings() {
  const [settings, setSettings] = useState<CardDisplaySettings>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error("Failed to load card display settings:", e);
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save card display settings:", e);
    }
  }, [settings]);

  return { settings, setSettings };
}

export function LeadCardDisplaySettings({
  settings,
  onSettingsChange,
}: LeadCardDisplaySettingsProps) {
  const handleToggle = (key: keyof CardDisplaySettings) => {
    // Name is always required
    if (key === "showName") return;
    
    onSettingsChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-10 gap-2">
          <Settings2 className="h-4 w-4" />
          Exibição
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <div className="space-y-4">
          {/* Page Elements Section */}
          <div>
            <h4 className="font-medium text-sm mb-3">Página</h4>
            <div className="space-y-3">
              {pageSettingsOrder.map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="text-sm cursor-pointer">
                    {settingsLabels[key]}
                  </Label>
                  <Switch
                    id={key}
                    checked={settings[key]}
                    onCheckedChange={() => handleToggle(key)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Card Fields Section */}
          <div>
            <h4 className="font-medium text-sm mb-3">Campos do Card</h4>
            <div className="space-y-3">
              {cardSettingsOrder.map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <Label 
                    htmlFor={key} 
                    className={`text-sm cursor-pointer ${key === "showName" ? "text-muted-foreground" : ""}`}
                  >
                    {settingsLabels[key]}
                  </Label>
                  <Switch
                    id={key}
                    checked={settings[key]}
                    onCheckedChange={() => handleToggle(key)}
                    disabled={key === "showName"}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
