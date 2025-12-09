'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { PantryStaplesPreset } from '@/components/Pantry/PantryStaplesPreset';
import { PantryBatchAdd } from '@/components/Pantry/PantryBatchAdd';
import { PantryList } from '@/components/Pantry/PantryList';
import { ShoppingList } from '@/components/Pantry/ShoppingList';
import {
  type CreatePantryInput,
  type PantryItem,
} from '@/components/Pantry/pantry-utils';
import {
  type CreateShoppingItemInput,
  type ShoppingItem,
} from '@/components/Pantry/shopping-utils';
import { useApi } from '@/hooks/useApi';
import {
  fetchPantryItems,
  upsertPantryItem,
  deletePantryItem,
  clearPantryItems,
} from '@/lib/api/pantry';
import {
  fetchShoppingItems,
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
} from '@/lib/api/shopping-list';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

const PantryPage = () => {
  const { callApi } = useApi();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shoppingLoading, setShoppingLoading] = useState(true);
  const [clearing, setClearing] = useState<'active' | 'finished' | null>(null);
  const [addingFinishedIds, setAddingFinishedIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [error, setError] = useState<string | null>(null);
  const [shoppingError, setShoppingError] = useState<string | null>(null);

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

  const loadShopping = useCallback(async () => {
    setShoppingLoading(true);
    setShoppingError(null);
    try {
      const data = await fetchShoppingItems(callApi);
      setShoppingItems(data);
    } catch (err) {
      console.error('Failed to load shopping list', err);
      setShoppingError('Failed to load shopping list.');
    } finally {
      setShoppingLoading(false);
    }
  }, [callApi]);

  useEffect(() => {
    void loadShopping();
  }, [loadShopping]);

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
      if (!item.isFinished) {
        await deletePantryItem(callApi, item.id, false);
        void loadPantry();
      } else {
        const updated = await upsertPantryItem(callApi, {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          isFinished: false,
        });
        setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      }
    } catch (err) {
      console.error('Failed to update pantry item', err);
      setError('Could not update pantry item.');
    }
  };

  const addShoppingItem = async (input: CreateShoppingItemInput) => {
    try {
      const created = await createShoppingItem(callApi, input);
      setShoppingItems((prev) => {
        const byId = prev.findIndex((s) => s.id === created.id);
        if (byId >= 0) {
          const next = [...prev];
          next[byId] = created;
          return next;
        }
        const byName = prev.findIndex(
          (s) =>
            s.name.trim().toLowerCase() === created.name.trim().toLowerCase(),
        );
        if (byName >= 0) {
          const next = [...prev];
          next[byName] = created;
          return next;
        }
        return [...prev, created];
      });
    } catch (err) {
      console.error('Failed to add shopping item', err);
      setShoppingError('Could not add shopping item.');
    }
  };

  const togglePurchased = async (item: ShoppingItem) => {
    try {
      const updated = await updateShoppingItem(callApi, item.id, {
        isPurchased: !item.isPurchased,
      });
      setShoppingItems((prev) =>
        updated.isPurchased
          ? prev.filter((i) => i.id !== item.id)
          : prev.map((i) => (i.id === item.id ? updated : i)),
      );
      if (!item.isPurchased && updated.isPurchased) {
        // Backend adds to pantry; refresh pantry list to reflect it
        void loadPantry();
        toast.success(`${updated.name} added to pantry`);
      }
    } catch (err) {
      console.error('Failed to update shopping item', err);
      setShoppingError('Could not update shopping item.');
    }
  };

  const removeShoppingItem = async (id: number) => {
    try {
      await deleteShoppingItem(callApi, id);
      setShoppingItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to remove shopping item', err);
      setShoppingError('Could not remove shopping item.');
    }
  };

  const addFinishedItemToShopping = async (item: PantryItem) => {
    if (!item.isFinished || addingFinishedIds.has(item.id)) return;
    setAddingFinishedIds((prev) => new Set(prev).add(item.id));
    setShoppingError(null);
    try {
      const created = await createShoppingItem(callApi, {
        name: item.name,
        quantity: item.quantity ?? undefined,
      });
      setShoppingItems((prev) => {
        const byId = prev.findIndex((s) => s.id === created.id);
        if (byId >= 0) {
          const next = [...prev];
          next[byId] = created;
          return next;
        }
        const byName = prev.findIndex(
          (s) =>
            s.name.trim().toLowerCase() === created.name.trim().toLowerCase(),
        );
        if (byName >= 0) {
          const next = [...prev];
          next[byName] = created;
          return next;
        }
        return [...prev, created];
      });
    } catch (err) {
      console.error('Failed to add finished item to shopping list', err);
      setShoppingError('Could not add finished item to shopping list.');
    } finally {
      setAddingFinishedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
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
      <div className="flex flex-col gap-6 px-4 py-6 md:flex-row md:items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Pantry</h1>
              <p className="text-muted-foreground">
                Track what you have and keep your shopping list in sync.
              </p>
            </div>
            <div className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">
              {totalTracked} item{totalTracked === 1 ? '' : 's'} tracked
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <PantryStaplesPreset
              existingItems={items}
              onAddMany={(inputs) => void addMany(inputs)}
            />
            <PantryBatchAdd onAddMany={(inputs) => void addMany(inputs)} />
          </div>

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
              onAddFinishedToShopping={(item) =>
                void addFinishedItemToShopping(item)
              }
              addingFinishedIds={addingFinishedIds}
            />
          )}

          {shoppingError ? (
            <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {shoppingError}
            </div>
          ) : null}
          <ShoppingList
            items={shoppingItems}
            loading={shoppingLoading}
            onAdd={(input) => void addShoppingItem(input)}
            onTogglePurchased={(item) => void togglePurchased(item)}
            onRemove={(id) => void removeShoppingItem(id)}
          />
        </main>
      </div>
    </div>
  );
};

export default PantryPage;
