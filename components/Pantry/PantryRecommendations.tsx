import type { Recipe } from '@/lib/types/recipe';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { PantryRecommendation } from './pantry-utils';
import { RecipeCard } from '@/components/Recipe/RecipeCard';

type PantryRecommendationsProps = {
  recommendations: PantryRecommendation[];
  loading?: boolean;
  onRefresh?: () => void;
  title?: string;
  description?: string;
};

function PantryRecommendations({
  recommendations,
  loading,
  onRefresh,
  title = 'Recipe ideas',
  description = 'Based on your pantry. Higher match = more ingredients you already own.',
}: PantryRecommendationsProps) {
  const normalizedRecs = recommendations
    .map((rec) => {
      const recipe = rec.recipe ?? (rec as Recipe);
      if (!recipe) return null;
      return {
        recipe,
        matchCount: rec.matchCount ?? 0,
        matchRatio: rec.matchRatio ?? 0,
        matchedIngredients: rec.matchedIngredients ?? [],
        missingIngredients: rec.missingIngredients ?? [],
      };
    })
    .filter(
      (
        rec,
      ): rec is {
        recipe: Recipe;
        matchCount: number;
        matchRatio: number;
        matchedIngredients: string[];
        missingIngredients: string[];
      } => Boolean(rec?.recipe),
    );

  const hasRecommendations = normalizedRecs.length > 0;
  const showSkeletons = loading && !hasRecommendations;
  const showEmptyState = !loading && !hasRecommendations;

  return (
    <div className="w-full rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {onRefresh ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? <Spinner className="mr-2 size-4" /> : null}
            Refresh
          </Button>
        ) : null}
      </div>

      <div
        className="relative mt-3 overflow-hidden"
        style={{ minHeight: '740px' }}
      >
        <div
          className={cn(
            'flex h-full gap-6 overflow-x-auto overflow-y-hidden pb-4 pt-4 pr-1 no-scrollbar snap-x snap-mandatory',
            showEmptyState ? 'items-center justify-center text-center' : '',
          )}
          style={{ scrollbarGutter: 'stable' }}
          aria-busy={loading}
        >
          {showSkeletons
            ? Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="flex h-full min-w-[280px] max-w-[340px] shrink-0 flex-col space-y-4 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/40 p-3"
                >
                  <div className="h-[300px] w-full animate-pulse rounded-lg bg-muted-foreground/20" />
                  <div className="flex-1 min-h-[180px] space-y-2 overflow-hidden text-xs text-muted-foreground">
                    <div className="h-4 w-20 animate-pulse rounded bg-muted-foreground/20" />
                    <div className="h-3 w-32 animate-pulse rounded bg-muted-foreground/20" />
                    <div className="h-3 w-28 animate-pulse rounded bg-muted-foreground/20" />
                  </div>
                </div>
              ))
            : null}

          {hasRecommendations
            ? normalizedRecs.map((item, idx) => {
                const matched = item.matchedIngredients;
                const missing = item.missingIngredients;
                return (
                  <div
                    key={item.recipe?.id ?? `rec-${idx}`}
                    className="flex h-full min-w-[280px] max-w-[340px] shrink-0 snap-start flex-col space-y-4"
                  >
                    <RecipeCard
                      recipe={item.recipe}
                      className="h-[500px] min-h-[500px]"
                    />
                    <div className="flex-1 min-h-[200px] max-h-[260px] space-y-2 overflow-y-auto pr-1 text-xs text-muted-foreground no-scrollbar">
                      <div className="text-sm font-semibold text-primary">
                        Match{' '}
                        {Number.isFinite(item.matchRatio)
                          ? (item.matchRatio * 100).toFixed(0)
                          : '0'}
                        %
                      </div>
                      {matched.length ? (
                        <div className="space-y-1">
                          <div className="font-medium text-green-600">
                            Matched
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {matched.map((ing) => (
                              <Badge key={ing} variant="outline">
                                {ing}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {missing.length ? (
                        <div className="space-y-1">
                          <div className="font-medium text-amber-600">
                            Missing
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {missing.map((ing) => (
                              <Badge key={ing} variant="secondary">
                                {ing}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            : null}

          {showEmptyState ? (
            <div className="text-sm text-muted-foreground">
              No recommendations yet. Add a few items to your pantry to see
              ideas.
            </div>
          ) : null}
        </div>

        {loading && hasRecommendations ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-card/70 backdrop-blur-[1px]">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Spinner className="size-5" />
              Refreshing recommendations…
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { PantryRecommendations };
