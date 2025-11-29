import type { Recipe } from '@/lib/types/recipe';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { PantryRecommendation } from './pantry-utils';
import { RecipeCard } from '@/components/Recipe/RecipeCard';

type PantryRecommendationsProps = {
  recommendations: PantryRecommendation[];
  loading?: boolean;
  onRefresh?: () => void;
};

function PantryRecommendations({
  recommendations,
  loading,
  onRefresh,
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

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Recipe ideas</h3>
          <p className="text-sm text-muted-foreground">
            Based on your pantry. Higher match = more ingredients you already
            own.
          </p>
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

      <div className="mt-3 space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">
            Loading recommendations…
          </div>
        ) : normalizedRecs.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {normalizedRecs.map((item, idx) => {
              const matched = item.matchedIngredients;
              const missing = item.missingIngredients;
              return (
                <div
                  key={item.recipe?.id ?? `rec-${idx}`}
                  className="space-y-2"
                >
                  <RecipeCard recipe={item.recipe} />
                  <div className="space-y-2 text-xs text-muted-foreground">
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
            })}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No recommendations yet. Add a few items to your pantry to see ideas.
          </div>
        )}
      </div>
    </div>
  );
}

export { PantryRecommendations };
