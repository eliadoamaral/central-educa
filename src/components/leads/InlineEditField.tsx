import { useState, useRef, useEffect } from 'react';
import { Check, X, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface InlineEditFieldProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  label: string;
  icon: React.ReactNode;
  type?: 'text' | 'email' | 'tel' | 'select' | 'currency';
  options?: { value: string; label: string }[];
  placeholder?: string;
  formatDisplay?: (value: string) => React.ReactNode;
  className?: string;
  disabled?: boolean;
  prefix?: React.ReactNode;
}

export function InlineEditField({
  value,
  onSave,
  label,
  icon,
  type = 'text',
  options,
  placeholder,
  formatDisplay,
  className,
  disabled = false,
  prefix,
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayValue = formatDisplay ? formatDisplay(value) : value || <span className="text-muted-foreground italic">Não informado</span>;

  if (disabled) {
    return (
      <div className={cn("flex items-start gap-3", className)}>
        <div className="text-muted-foreground flex-shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="text-sm mt-0.5">{displayValue}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-start gap-3 group/edit", className)}>
      <div className="text-muted-foreground flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        
        {isEditing ? (
          <div className="flex items-center gap-1 mt-0.5">
            {type === 'select' && options ? (
              <Select
                value={editValue}
                onValueChange={(val) => {
                  setEditValue(val);
                }}
              >
                <SelectTrigger className="h-7 text-sm flex-1">
                  <SelectValue placeholder={placeholder || "Selecione..."} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex-1 flex items-center">
                {prefix}
                <Input
                  ref={inputRef}
                  type={type === 'currency' ? 'text' : type}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="h-7 text-sm"
                  disabled={isSaving}
                />
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div 
            className="flex items-center gap-2 mt-0.5 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 py-0.5 transition-colors"
            onClick={() => setIsEditing(true)}
          >
            <div className="text-sm flex-1 min-w-0">{displayValue}</div>
            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/edit:opacity-100 transition-opacity flex-shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}
