'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { PantryQuickAdd } from '@/components/Pantry/PantryQuickAdd';
import { PantryStaplesPreset } from '@/components/Pantry/PantryStaplesPreset';
import { PantryBatchAdd } from '@/components/Pantry/PantryBatchAdd';
import { PantryList } from '@/components/Pantry/PantryList';
import { PantryRecommendations } from '@/components/Pantry/PantryRecommendations';
import {
  type CreatePantryInput,
  type PantryItem,
  type PantryRecommendation,
} from '@/components/Pantry/pantry-utils';
import { useApi } from '@/hooks/useApi';
import {
  fetchPantryItems,
  upsertPantryItem,
  deletePantryItem,
  clearPantryItems,
} from '@/lib/api/pantry';
import { fetchRecommendations } from '@/lib/api/recipes';
import { Spinner } from '@/components/ui/spinner';

const PantryPage = () => {
  const { callApi } = useApi();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [recommendations, setRecommendations] = useState<
    PantryRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(false);
  const [clearing, setClearing] = useState<'active' | 'finished' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPantry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPantryItems(callApi);
      setItems(data);
    } catch (err) {
      console.error('Failed to load pantry', err);
      setError('Failed to load pantry items.');
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  useEffect(() => {
    void loadPantry();
  }, [loadPantry]);

  const refreshRecommendations = useCallback(async () => {
    setRecsLoading(true);
    try {
      const recs = await fetchRecommendations(
        callApi,
        { status: 'published' },
        8,
      );
      setRecommendations(recs);
    } catch (err) {
      console.error('Failed to load recommendations', err);
    } finally {
      setRecsLoading(false);
    }
  }, [callApi]);

  useEffect(() => {
    if (!items.length) {
      setRecommendations([]);
      return;
    }
    void refreshRecommendations();
  }, [items, refreshRecommendations]);

  const addItem = async (input: CreatePantryInput) => {
    try {
      const created = await upsertPantryItem(callApi, input);
      setItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === created.id);
        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = created;
          return next;
        }
        return [...prev, created];
      });
    } catch (err) {
      console.error('Failed to add pantry item', err);
      setError('Could not save pantry item.');
    }
  };

  const addMany = async (list: CreatePantryInput[]) => {
    if (!list.length) return;
    try {
      const results = await Promise.all(
        list.map((entry) => upsertPantryItem(callApi, entry)),
      );
      setItems((prev) => {
        const merged = [...prev];
        results.forEach((item) => {
          const idx = merged.findIndex((i) => i.id === item.id);
          if (idx >= 0) {
            merged[idx] = item;
          } else {
            merged.push(item);
          }
        });
        return merged;
      });
    } catch (err) {
      console.error('Failed to add pantry items', err);
      setError('Could not save some pantry items.');
    }
  };

  const removeItem = async (id: number, hard = false) => {
    try {
      await deletePantryItem(callApi, id, hard);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to remove pantry item', err);
      setError('Could not remove pantry item.');
    }
  };

  const toggleFinished = async (item: PantryItem) => {
    try {
      const updated = await upsertPantryItem(callApi, {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        isFinished: !item.isFinished,
      });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      console.error('Failed to update pantry item', err);
      setError('Could not update pantry item.');
    }
  };

  const clearItems = async (status: 'active' | 'finished') => {
    setError(null);
    setClearing(status);
    try {
      await clearPantryItems(callApi, status);
      setItems((prev) =>
        prev.filter((item) =>
          status === 'active' ? item.isFinished : !item.isFinished,
        ),
      );
    } catch (err) {
      console.error('Failed to clear pantry items', err);
      setError('Could not clear items.');
    } finally {
      setClearing((prev) => (prev === status ? null : prev));
    }
  };

  const totalTracked = useMemo(() => items.length, [items]);

  return (
    <div className="min-h-screen overflow-y-auto">
      <Header />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row">
        <Sidebar />
        <main className="flex-1 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Pantry</h1>
              <p className="text-muted-foreground">
                Track what you have and get recipe ideas using your pantry.
              </p>
            </div>
            <div className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">
              {totalTracked} item{totalTracked === 1 ? '' : 's'} tracked
            </div>
          </div>

          <PantryRecommendations
            recommendations={recommendations}
            loading={recsLoading}
            onRefresh={refreshRecommendations}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <PantryQuickAdd onAdd={(input) => void addItem(input)} />
            <PantryStaplesPreset
              existingItems={items}
              onAddMany={(inputs) => void addMany(inputs)}
            />
          </div>

          <PantryBatchAdd onAddMany={(inputs) => void addMany(inputs)} />

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="size-4" /> Loading pantry…
            </div>
          ) : (
            <PantryList
              items={items}
              onRemove={(id, hard) => void removeItem(id, hard)}
              onToggleFinished={(item) => void toggleFinished(item)}
              onClearActive={() => void clearItems('active')}
              onClearFinished={() => void clearItems('finished')}
              clearingActive={clearing === 'active'}
              clearingFinished={clearing === 'finished'}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default PantryPage;
