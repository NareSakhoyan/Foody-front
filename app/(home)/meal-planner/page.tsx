'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { PlannerControls } from '@/components/MealPlanner/PlannerControls';
import { PlannerGrid } from '@/components/MealPlanner/PlannerGrid';
import { PlannerHeader } from '@/components/MealPlanner/PlannerHeader';
import { RecipeDock } from '@/components/MealPlanner/RecipeDock';
import { MEAL_ROWS, buildWeekDays } from '@/components/MealPlanner/constants';
import type {
  MealKey,
  MealPlan,
  MealPlanEntry,
  WeekDay,
} from '@/components/MealPlanner/types';
import { useApi } from '@/hooks/useApi';
import {
  addMissingIngredientsToShopping,
  createMealPlan,
  deleteMealPlanEntry,
  fetchMealPlanForRange,
  upsertMealPlanEntries,
} from '@/lib/api/meal-plans';
import { fetchRecipe } from '@/lib/api/recipes';
import type { Recipe } from '@/lib/types/recipe';
import { ShoppingList } from '@/components/Pantry/ShoppingList';
import type { ShoppingItem } from '@/components/Pantry/shopping-utils';
import { toast } from 'sonner';

const normalizeEntries = (list: MealPlanEntry[]): MealPlanEntry[] =>
  list.map((entry) => ({
    ...entry,
    day: entry.day ? entry.day.slice(0, 10) : entry.day,
    mealType: entry.mealType
      ? (String(entry.mealType).toLowerCase() as MealKey)
      : null,
  }));

const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const formatRange = (start: Date, end: Date) => {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
};

const MealPlannerPage = () => {
  const { callApi } = useApi();
  const visibleMeals = useMemo(
    () => new Set<MealKey>(MEAL_ROWS.map((m) => m.key)),
    [],
  );
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date()),
  );
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [entries, setEntries] = useState<MealPlanEntry[]>([]);
  const [recipesById, setRecipesById] = useState<
    Record<string, Recipe | undefined>
  >({});
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [shoppingLoading, setShoppingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weekDays: WeekDay[] = useMemo(
    () => buildWeekDays(weekStart),
    [weekStart],
  );
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const startDate = weekDays[0]?.iso;
  const endDate = weekDays[weekDays.length - 1]?.iso;
  const visibleDays = weekDays;
  const activeMealRows = MEAL_ROWS.filter((row) => visibleMeals.has(row.key));
  const weekRangeLabel = useMemo(
    () => formatRange(weekStart, weekEnd),
    [weekStart, weekEnd],
  );

  const hydrateRecipes = useCallback(
    async (entriesToHydrate: MealPlanEntry[]) => {
      const ids = Array.from(
        new Set(
          entriesToHydrate.map((entry) => entry.recipeId).filter(Boolean),
        ),
      );
      const missing = ids.filter((id) => !recipesById[id]);
      if (!missing.length) return;
      try {
        const fetched = await Promise.all(
          missing.map(async (id) => {
            try {
              const recipe = await fetchRecipe(callApi, id);
              return { id, recipe };
            } catch (err) {
              console.error('Failed to fetch recipe', id, err);
              return null;
            }
          }),
        );
        setRecipesById((prev) => {
          const next = { ...prev };
          fetched.forEach((item) => {
            if (item?.id && item.recipe) {
              next[item.id] = item.recipe;
            }
          });
          return next;
        });
      } catch (err) {
        console.error('Failed to hydrate recipes', err);
      }
    },
    [callApi, recipesById],
  );

  const loadPlan = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoadingPlan(true);
    setError(null);
    try {
      const data = await fetchMealPlanForRange(callApi, startDate, endDate);
      setPlan(data.plan);
      const normalized = normalizeEntries(data.entries || []);
      setEntries(normalized);
      void hydrateRecipes(normalized);
    } catch (err) {
      console.error('Failed to load meal plan', err);
      setError('Could not load meal plan.');
      toast.error('Could not load meal plan.');
    } finally {
      setLoadingPlan(false);
    }
  }, [callApi, endDate, hydrateRecipes, startDate]);

  useEffect(() => {
    setError(null);
    void loadPlan();
  }, [loadPlan]);

  const ensurePlanId = useCallback(async (): Promise<string> => {
    if (plan?.id && plan.startDate === startDate && plan.endDate === endDate) {
      return plan.id;
    }
    if (!startDate || !endDate) throw new Error('Invalid date range');
    const created = await createMealPlan(callApi, {
      startDate,
      endDate,
      title: plan?.title ?? null,
    });
    setPlan(created);
    if (!created.id) throw new Error('Failed to create meal plan');
    return created.id;
  }, [callApi, endDate, plan, startDate]);

  const handleClearWeek = async () => {
    try {
      setSaving(true);
      const planId = await ensurePlanId();
      const saved = await upsertMealPlanEntries(callApi, planId, []);
      setEntries(normalizeEntries(saved));
      toast.success('Week cleared.');
      void loadPlan();
      void handleGenerateShopping();
    } catch (err) {
      console.error('Failed to clear week', err);
      toast.error('Could not clear week.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRecipe = async (
    recipeId: string,
    day?: string,
    meal?: MealKey,
  ) => {
    try {
      const fallbackMeal = MEAL_ROWS[0]?.key ?? 'dinner';
      const planId = await ensurePlanId();
      const targetDay = day ?? startDate ?? visibleDays[0]?.iso;
      const targetMeal = meal ?? fallbackMeal;

      const nextEntries = [
        ...entries.map(({ id, day, mealType, recipeId, notes, sortOrder }) => ({
          id,
          day,
          mealType,
          recipeId,
          notes,
          sortOrder,
        })),
        {
          day: targetDay,
          mealType: targetMeal,
          recipeId,
          sortOrder: entries.filter(
            (entry) =>
              entry.day === targetDay && (entry.mealType ?? '') === targetMeal,
          ).length,
        },
      ];
      const saved = await upsertMealPlanEntries(callApi, planId, nextEntries);
      const normalized = normalizeEntries(saved);
      setEntries(normalized);
      void hydrateRecipes(normalized);
      toast.success('Recipe added to plan.');
      void loadPlan();
      void handleGenerateShopping();
    } catch (err) {
      console.error('Failed to add recipe to plan', err);
      toast.error('Could not add to plan.');
    }
  };

  const handleRemoveEntry = async (entryId: string) => {
    if (!plan?.id) return;
    try {
      setSaving(true);
      await deleteMealPlanEntry(callApi, plan.id, entryId);
      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      toast.success('Entry removed.');
      void loadPlan();
      void handleGenerateShopping();
    } catch (err) {
      console.error('Failed to remove entry', err);
      toast.error('Could not remove entry.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateShopping = useCallback(async () => {
    try {
      setGenerating(true);
      setShoppingLoading(true);
      const planId = await ensurePlanId();
      const result = await addMissingIngredientsToShopping(callApi, planId);
      const items = (result.items as ShoppingItem[]) ?? [];
      setShoppingItems(items);
      toast.success(`Added ${result.addedCount ?? 0} items to shopping list.`);
    } catch (err) {
      console.error('Failed to generate shopping list', err);
      toast.error('Could not generate shopping list.');
    } finally {
      setGenerating(false);
      setShoppingLoading(false);
    }
  }, [callApi, ensurePlanId]);

  const handlePrevWeek = () => {
    setWeekStart((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setWeekStart((prev) => addDays(prev, 7));
  };

  return (
    <div className="min-h-screen overflow-y-auto">
      <Header />
      <div className="flex flex-col gap-6 px-4 py-6 md:flex-row md:items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 space-y-6">
          <PlannerHeader />

          <PlannerControls
            weekLabel="This week"
            weekRange={`${weekRangeLabel} (auto-fills Sunday night reset)`}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            onGenerateList={handleGenerateShopping}
            onClearWeek={handleClearWeek}
            actionsDisabled={saving || loadingPlan || generating}
          />

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,360px)]">
            <PlannerGrid
              days={visibleDays}
              meals={activeMealRows}
              entries={entries}
              recipesById={recipesById}
              loading={loadingPlan || saving}
              onRemoveEntry={handleRemoveEntry}
              onRecipeDrop={(recipeId, dayIso, mealKey) =>
                void handleAddRecipe(recipeId, dayIso, mealKey)
              }
            />

            <div className="rounded-xl border bg-card p-4 shadow-sm lg:max-w-sm lg:justify-self-end">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">
                    Weekly shopping list
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Based on this week&apos;s plan. Refresh to pull missing
                    ingredients.
                  </p>
                </div>
                <button
                  type="button"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                  onClick={() => void handleGenerateShopping()}
                  disabled={generating || saving || loadingPlan}
                >
                  {generating ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>
              <div className="mt-3 max-h-[70vh] overflow-y-auto pr-1 no-scrollbar">
                <ShoppingList
                  items={shoppingItems}
                  loading={shoppingLoading}
                  readOnly
                />
              </div>
            </div>
          </div>

          <RecipeDock
            onAddRecipe={(recipe) => void handleAddRecipe(recipe.id)}
          />
        </main>
      </div>
    </div>
  );
};

export default MealPlannerPage;
