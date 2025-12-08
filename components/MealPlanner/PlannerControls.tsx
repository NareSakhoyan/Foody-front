import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type PlannerControlsProps = {
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onGenerateList?: () => void;
  onClearWeek?: () => void;
  weekLabel: string;
  weekRange: string;
  actionsDisabled?: boolean;
};

const PlannerControls = ({
  onPrevWeek,
  onNextWeek,
  onGenerateList,
  onClearWeek,
  weekLabel,
  weekRange,
  actionsDisabled,
}: PlannerControlsProps) => {
  return (
    <section className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous"
            onClick={onPrevWeek}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="rounded-lg border bg-muted/60 px-4 py-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CalendarDays className="size-4 text-primary" />
              {weekLabel}
            </div>
            <p className="text-xs text-muted-foreground">{weekRange}</p>
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next"
            onClick={onNextWeek}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onGenerateList}
            disabled={actionsDisabled}
          >
            <Sparkles className="size-4" />
            Generate shopping list
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onClearWeek}
            disabled={actionsDisabled}
          >
            Clear week
          </Button>
        </div>
      </div>
    </section>
  );
};

export { PlannerControls };
