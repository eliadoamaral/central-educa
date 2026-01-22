import { useState, useEffect } from 'react';
import { Check, X, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useIBGELocations } from '@/hooks/useIBGELocations';

interface InlineLocationFieldProps {
  stateValue: string;
  cityValue: string;
  onSaveState: (value: string) => Promise<void>;
  onSaveCity: (value: string) => Promise<void>;
  icon: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function InlineLocationField({
  stateValue,
  cityValue,
  onSaveState,
  onSaveCity,
  icon,
  disabled = false,
  className,
}: InlineLocationFieldProps) {
  const [isEditingState, setIsEditingState] = useState(false);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [editState, setEditState] = useState(stateValue);
  const [editCity, setEditCity] = useState(cityValue);
  const [isSavingState, setIsSavingState] = useState(false);
  const [isSavingCity, setIsSavingCity] = useState(false);

  const { states, cities, isLoadingStates, isLoadingCities } = useIBGELocations(editState);

  // Sync with props
  useEffect(() => {
    setEditState(stateValue);
  }, [stateValue]);

  useEffect(() => {
    setEditCity(cityValue);
  }, [cityValue]);

  const handleSaveState = async () => {
    if (editState === stateValue) {
      setIsEditingState(false);
      return;
    }

    setIsSavingState(true);
    try {
      await onSaveState(editState);
      // Clear city when state changes
      if (cityValue) {
        await onSaveCity('');
        setEditCity('');
      }
      setIsEditingState(false);
    } catch (error) {
      setEditState(stateValue);
    } finally {
      setIsSavingState(false);
    }
  };

  const handleSaveCity = async () => {
    if (editCity === cityValue) {
      setIsEditingCity(false);
      return;
    }

    setIsSavingCity(true);
    try {
      await onSaveCity(editCity);
      setIsEditingCity(false);
    } catch (error) {
      setEditCity(cityValue);
    } finally {
      setIsSavingCity(false);
    }
  };

  const handleCancelState = () => {
    setEditState(stateValue);
    setIsEditingState(false);
  };

  const handleCancelCity = () => {
    setEditCity(cityValue);
    setIsEditingCity(false);
  };

  const locationDisplay = [cityValue, stateValue].filter(Boolean).join(', ');

  if (disabled) {
    return (
      <div className={cn("flex items-start gap-3", className)}>
        <div className="text-muted-foreground flex-shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">Localização</p>
          <div className="text-sm mt-0.5">
            {locationDisplay || <span className="text-muted-foreground italic">Não informado</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="text-muted-foreground flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        {/* Estado/UF Field */}
        <div className="group/edit">
          <p className="text-xs text-muted-foreground">Estado (UF)</p>
          {isEditingState ? (
            <div className="flex items-center gap-1 mt-0.5">
              <Select
                value={editState || '__none__'}
                onValueChange={(val) => setEditState(val === '__none__' ? '' : val)}
                disabled={isLoadingStates}
              >
                <SelectTrigger className="h-7 text-sm flex-1">
                  <SelectValue placeholder={isLoadingStates ? "Carregando..." : "Selecione o estado"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Nenhum</SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={handleSaveState}
                disabled={isSavingState}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleCancelState}
                disabled={isSavingState}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div 
              className="flex items-center gap-2 mt-0.5 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 py-0.5 transition-colors"
              onClick={() => setIsEditingState(true)}
            >
              <div className="text-sm flex-1 min-w-0">
                {stateValue || <span className="text-muted-foreground italic">Não informado</span>}
              </div>
              <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/edit:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          )}
        </div>

        {/* Cidade Field */}
        <div className="group/edit">
          <p className="text-xs text-muted-foreground">Cidade</p>
          {isEditingCity ? (
            <div className="flex items-center gap-1 mt-0.5">
              <Select
                value={editCity || '__none__'}
                onValueChange={(val) => setEditCity(val === '__none__' ? '' : val)}
                disabled={isLoadingCities || !editState}
              >
                <SelectTrigger className="h-7 text-sm flex-1">
                  <SelectValue placeholder={
                    !editState 
                      ? "Selecione o estado primeiro" 
                      : isLoadingCities 
                        ? "Carregando..." 
                        : "Selecione a cidade"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Nenhuma</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.value} value={city.value}>
                      {city.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={handleSaveCity}
                disabled={isSavingCity}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleCancelCity}
                disabled={isSavingCity}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div 
              className="flex items-center gap-2 mt-0.5 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 py-0.5 transition-colors"
              onClick={() => setIsEditingCity(true)}
            >
              <div className="text-sm flex-1 min-w-0">
                {cityValue || <span className="text-muted-foreground italic">Não informado</span>}
              </div>
              <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/edit:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
