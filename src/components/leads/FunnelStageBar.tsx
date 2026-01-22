import React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface FunnelStage {
  id: string;
  label: string;
  color: string;
}

interface FunnelStageBarProps {
  stages: FunnelStage[];
  value: string;
  onChange: (value: string) => void;
}

export function FunnelStageBar({ stages, value, onChange }: FunnelStageBarProps) {
  const selectedIndex = stages.findIndex((s) => s.id === value);
  const selectedStage = stages.find((s) => s.id === value);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex w-full">
        {stages.map((stage, index) => {
          const isActive = index <= selectedIndex;
          const isFirst = index === 0;
          const isLast = index === stages.length - 1;

          return (
            <Tooltip key={stage.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onChange(stage.id)}
                  className={cn(
                    "relative flex-1 h-10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 hover:opacity-80",
                    !isFirst && "ml-[-8px]",
                    isFirst && "rounded-l-md",
                    isLast && "rounded-r-md"
                  )}
                  style={{
                    backgroundColor: isActive ? "hsl(160 35% 36%)" : "#e5e7eb",
                    clipPath: isLast 
                      ? "polygon(8px 0, 100% 0, 100% 100%, 8px 100%, 0 50%)"
                      : "polygon(8px 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0 50%)",
                    transition: "background-color 0.3s ease-in-out, transform 0.15s ease-out",
                    transform: isActive ? "scale(1)" : "scale(1)",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <span className="sr-only">{stage.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-medium">
                {stage.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
