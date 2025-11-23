'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';
import type { Recipe } from '@/lib/types/recipe';
import { createRecipe, updateRecipe } from '@/lib/api/recipes';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ButtonGroup } from '@/components/ui/button-group';

type RecipeFormProps = {
  mode?: 'create' | 'edit';
  initialData?: Partial<Recipe>;
  onSuccess?: (recipe: Recipe) => void;
  onCancel?: () => void;
  closeSignal?: number;
};

type RecipeDraft = Partial<Recipe>;

type IngredientInput = {
  name: string;
  quantity: number;
  measureUnit: string;
  note?: string;
};

const emptyIngredient: IngredientInput = {
  name: '',
  quantity: 1,
  measureUnit: '',
  note: '',
};

const draftStorageKey = 'recipeDraft';
const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

const RecipeForm = ({
  mode = 'create',
  initialData,
  onSuccess,
  onCancel,
  closeSignal = 0,
}: RecipeFormProps) => {
  const { getToken } = useAuth();
  const isEdit = mode === 'edit' && !!initialData?.id;
  const { callApi } = useApi();

  const [name, setName] = useState(initialData?.name ?? '');
  const [slug, setSlug] = useState(
    initialData?.slug ?? slugify(initialData?.name ?? ''),
  );
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription ?? '',
  );
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [prepDescription, setPrepDescription] = useState(
    initialData?.prepDescription ?? '',
  );
  const [cookDescription, setCookDescription] = useState(
    initialData?.cookDescription ?? '',
  );
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number | ''>(
    initialData?.prepTimeMinutes ?? '',
  );
  const [cookTimeMinutes, setCookTimeMinutes] = useState<number | ''>(
    initialData?.cookTimeMinutes ?? '',
  );
  const [servings, setServings] = useState<number | ''>(
    initialData?.servings ?? '',
  );
  const [tags, setTags] = useState(initialData?.tags?.join(', ') ?? '');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [ingredients, setIngredients] = useState<IngredientInput[]>(
    initialData?.ingredients?.length
      ? initialData.ingredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity,
          measureUnit: ing.measureUnit,
          note: ing.note ?? '',
        }))
      : [emptyIngredient],
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftSnapshot, setDraftSnapshot] = useState<RecipeDraft | null>(null);
  const [safelySaved, setSafelySaved] = useState(false);
  const hasMountedRef = useRef(false);
  const closeSignalRef = useRef(closeSignal);
  const initialIsPublicRef = useRef(initialData?.isPublic ?? true);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const hasContent = useMemo(() => {
    const hasText =
      name.trim() ||
      shortDescription.trim() ||
      imageUrl.trim() ||
      prepDescription.trim() ||
      cookDescription.trim() ||
      tags.trim();
    const hasNumbers =
      prepTimeMinutes !== '' || cookTimeMinutes !== '' || servings !== '';
    const hasIngredients = ingredients.some(
      (ing) =>
        ing.name.trim() ||
        ing.measureUnit.trim() ||
        (ing.quantity !== 1 && ing.quantity !== 0) ||
        (ing.note && ing.note.trim()),
    );
    const visibilityChanged = isPublic !== initialIsPublicRef.current;
    return Boolean(
      hasText || hasNumbers || hasIngredients || visibilityChanged,
    );
  }, [
    cookDescription,
    cookTimeMinutes,
    imageUrl,
    ingredients,
    isPublic,
    name,
    prepDescription,
    prepTimeMinutes,
    servings,
    shortDescription,
    tags,
  ]);

  useEffect(() => {
    if (isEdit) return;
    try {
      const stored = localStorage.getItem(draftStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDraftSnapshot(parsed);
        setShowDraftDialog(true);
      }
    } catch {
      // ignore
    }
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) return;
    if (!hasContent) {
      localStorage.removeItem(draftStorageKey);
      return;
    }
    const draftData: RecipeDraft = {
      name,
      slug,
      shortDescription,
      imageUrl,
      prepDescription,
      cookDescription,
      prepTimeMinutes,
      cookTimeMinutes,
      servings,
      tags,
      isPublic,
      ingredients,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(draftStorageKey, JSON.stringify(draftData));
  }, [
    cookDescription,
    cookTimeMinutes,
    hasContent,
    imageUrl,
    ingredients,
    isEdit,
    isPublic,
    name,
    prepDescription,
    prepTimeMinutes,
    servings,
    shortDescription,
    slug,
    tags,
  ]);

  const applyDraftSnapshot = () => {
    if (!draftSnapshot) return;
    setName(draftSnapshot.name ?? '');
    setSlug(draftSnapshot.slug ?? '');
    setShortDescription(draftSnapshot.shortDescription ?? '');
    setImageUrl(draftSnapshot.imageUrl ?? '');
    setImageUploadError(null);
    setPrepDescription(draftSnapshot.prepDescription ?? '');
    setCookDescription(draftSnapshot.cookDescription ?? '');
    setPrepTimeMinutes(draftSnapshot.prepTimeMinutes ?? '');
    setCookTimeMinutes(draftSnapshot.cookTimeMinutes ?? '');
    setServings(draftSnapshot.servings ?? '');
    setTags(draftSnapshot.tags ?? '');
    setIsPublic(draftSnapshot.isPublic ?? true);
    setIngredients(
      draftSnapshot.ingredients?.length
        ? draftSnapshot.ingredients
        : [emptyIngredient],
    );
  };

  const discardDraftSnapshot = () => {
    localStorage.removeItem(draftStorageKey);
    setDraftSnapshot(null);
    setShowDraftDialog(false);
  };

  useEffect(() => {
    if (safelySaved || submitting || !hasContent) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasContent, safelySaved, submitting]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    // Mark dirty again after any field change post-mount/save
    setSafelySaved(false);
  }, [
    cookDescription,
    cookTimeMinutes,
    imageUrl,
    ingredients,
    isPublic,
    name,
    prepDescription,
    prepTimeMinutes,
    servings,
    shortDescription,
    tags,
  ]);

  const updateIngredient = (
    index: number,
    field: keyof IngredientInput,
    value: string | number,
  ) => {
    setIngredients((prev) =>
      prev.map((ing, i) =>
        i === index
          ? {
              ...ing,
              [field]: field === 'quantity' ? Number(value) || 0 : value,
            }
          : ing,
      ),
    );
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { ...emptyIngredient }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCloseRequest = useCallback(() => {
    if (hasContent) {
      setShowCloseDialog(true);
    } else {
      onCancel?.();
    }
  }, [hasContent, onCancel]);

  useEffect(() => {
    if (closeSignal !== closeSignalRef.current) {
      closeSignalRef.current = closeSignal;
      handleCloseRequest();
    }
  }, [closeSignal, handleCloseRequest]);

  const handleImageUpload = async (file: File) => {
    setImageUploadError(null);
    setImageUploading(true);
    try {
      const token = await getToken();
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const signatureResponse = await fetch('/api/cloudinary-sign', {
        method: 'POST',
        headers,
        credentials: 'include',
      });

      if (!signatureResponse.ok) {
        let detail = '';
        try {
          const body = await signatureResponse.json();
          detail = body?.error || body?.message || '';
        } catch {
          try {
            detail = await signatureResponse.text();
          } catch {
            // ignore parsing errors
          }
        }
        const statusInfo = `(${signatureResponse.status})`;
        throw new Error(
          `Could not prepare the upload ${statusInfo}. ${
            detail || 'Please try again.'
          }`,
        );
      }

      const { timestamp, signature, apiKey, cloudName, folder } =
        (await signatureResponse.json()) as {
          timestamp: number;
          signature: string;
          apiKey: string;
          cloudName: string;
          folder?: string;
        };

      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', String(timestamp));
      formData.append('api_key', apiKey);
      formData.append('signature', signature);
      if (folder) formData.append('folder', folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        },
      );
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(
          uploadData?.error?.message || 'Upload failed. Please try again.',
        );
      }

      setImageUrl(uploadData.secure_url);
    } catch (err) {
      console.error('Error uploading image', err);
      setImageUploadError(
        err instanceof Error ? err.message : 'Image upload failed.',
      );
    } finally {
      setImageUploading(false);
      if (imageFileInputRef.current) {
        imageFileInputRef.current.value = '';
      }
    }
  };

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void handleImageUpload(file);
  };

  const buildPayload = (status: 'draft' | 'published') => {
    const effectiveSlug = (slug || slugify(name)).trim();
    const filteredIngredients = ingredients
      .map((ing) => ({
        ...ing,
        name: ing.name.trim(),
        measureUnit: ing.measureUnit.trim(),
      }))
      .filter((ing) => ing.name || status === 'draft');

    return {
      name: name.trim(),
      slug: effectiveSlug,
      shortDescription: shortDescription.trim() || null,
      imageUrl: imageUrl.trim() || null,
      prepDescription: prepDescription.trim() || null,
      cookDescription: cookDescription.trim() || null,
      prepTimeMinutes: prepTimeMinutes === '' ? null : Number(prepTimeMinutes),
      cookTimeMinutes: cookTimeMinutes === '' ? null : Number(cookTimeMinutes),
      servings: servings === '' ? null : Number(servings),
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      ingredients: filteredIngredients,
      isPublic,
      status,
    };
  };

  const handleDraftSave = async () => {
    setSubmitting(true);
    setError(null);

    if (imageUploading) {
      setError('Please wait for the image upload to finish.');
      setSubmitting(false);
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Name is required to save a draft.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = buildPayload('draft');
      const recipe = isEdit
        ? await updateRecipe(callApi, initialData?.id as string, payload)
        : await createRecipe(callApi, payload);
      localStorage.removeItem(draftStorageKey);
      setSafelySaved(true);
      onSuccess?.(recipe);
    } catch (err) {
      console.error('Error saving draft', err);
      setError('Failed to save draft. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (imageUploading) {
      setError('Please wait for the image upload to finish.');
      setSubmitting(false);
      return;
    }

    const trimmedName = name.trim();
    const trimmedSlug = (slug || slugify(name)).trim();

    const filteredIngredients = ingredients
      .map((ing) => ({
        ...ing,
        name: ing.name.trim(),
        measureUnit: ing.measureUnit.trim(),
      }))
      .filter((ing) => ing.name);

    if (!trimmedName) {
      setError('Name is required.');
      setSubmitting(false);
      return;
    }

    if (!trimmedSlug) {
      setError('Slug is required.');
      setSubmitting(false);
      return;
    }

    if (!filteredIngredients.length) {
      setError('Add at least one ingredient.');
      setSubmitting(false);
      return;
    }

    const payload = buildPayload('published');

    try {
      const recipe = isEdit
        ? await updateRecipe(callApi, initialData?.id as string, payload)
        : await createRecipe(callApi, payload);
      localStorage.removeItem(draftStorageKey);
      setSafelySaved(true);
      onSuccess?.(recipe);
    } catch (err) {
      console.error('Error saving recipe', err);
      setError('Failed to save recipe. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {showDraftDialog ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl border bg-card p-5 shadow-xl">
            <h3 className="text-lg font-semibold">Unfinished recipe</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We found an unfinished recipe draft. Do you want to continue
              editing it?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={discardDraftSnapshot}
                disabled={submitting}
              >
                Discard
              </Button>
              <Button
                onClick={() => {
                  applyDraftSnapshot();
                  setShowDraftDialog(false);
                }}
                disabled={submitting}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border bg-card p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEdit ? 'Edit recipe' : 'Add a new recipe'}
          </h2>
          {onCancel ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCloseRequest}
              disabled={submitting}
            >
              Cancel
            </Button>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Name *</span>
            <Input
              value={name}
              onChange={(e) => {
                const value = e.target.value;
                setName(value);
                setSlug(slugify(value));
              }}
              placeholder="Mom's lasagna"
              required
            />
          </label>

          <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 text-sm md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-foreground">Image</span>
            </div>

            <div className="space-y-2">
              <Input
                ref={imageFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={imageUploading || submitting}
              />
              <p className="text-xs text-muted-foreground">
                Upload a photo to save it to Cloudinary.
              </p>
              {imageUploading ? (
                <p className="text-xs text-muted-foreground">Uploading image…</p>
              ) : null}
            </div>

            {imageUrl ? (
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary underline underline-offset-4"
              >
                Preview current image
              </a>
            ) : null}
            {imageUploadError ? (
              <p className="text-xs text-destructive">{imageUploadError}</p>
            ) : null}
          </div>

          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            <span className="font-medium text-foreground">
              Tags (comma separated)
            </span>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="quick, vegetarian"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            <span className="font-medium text-foreground">
              Short description
            </span>
            <Textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={2}
              placeholder="A comforting family classic."
            />
          </label>

          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            <span className="font-medium text-foreground">
              Prep description
            </span>
            <Textarea
              value={prepDescription}
              onChange={(e) => setPrepDescription(e.target.value)}
              rows={3}
              placeholder="Chop onions, preheat oven..."
            />
          </label>

          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            <span className="font-medium text-foreground">
              Cook description
            </span>
            <Textarea
              value={cookDescription}
              onChange={(e) => setCookDescription(e.target.value)}
              rows={3}
              placeholder="Simmer sauce until thick..."
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Prep time (min)</span>
            <Input
              type="number"
              min={0}
              value={prepTimeMinutes}
              onChange={(e) =>
                setPrepTimeMinutes(e.target.value ? Number(e.target.value) : '')
              }
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Cook time (min)</span>
            <Input
              type="number"
              min={0}
              value={cookTimeMinutes}
              onChange={(e) =>
                setCookTimeMinutes(e.target.value ? Number(e.target.value) : '')
              }
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Servings</span>
            <Input
              type="number"
              min={1}
              value={servings}
              onChange={(e) =>
                setServings(e.target.value ? Number(e.target.value) : '')
              }
            />
          </label>

          <div className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Visibility</span>
            <ButtonGroup className="overflow-hidden rounded-lg border">
              <Button
                type="button"
                variant={isPublic ? 'outline' : 'default'}
                onClick={() => setIsPublic(false)}
              >
                Private
              </Button>
              <Button
                type="button"
                variant={isPublic ? 'default' : 'outline'}
                onClick={() => setIsPublic(true)}
              >
                Public
              </Button>
            </ButtonGroup>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Ingredients {mode === 'create' ? '*' : ''}
            </span>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={addIngredient}
            >
              Add ingredient
            </Button>
          </div>

          <div className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="grid gap-2 rounded-lg border bg-muted/30 p-3 md:grid-cols-4"
              >
                <Input
                  placeholder="Name"
                  value={ingredient.name}
                  onChange={(e) =>
                    updateIngredient(index, 'name', e.target.value)
                  }
                />
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Quantity"
                  value={ingredient.quantity}
                  onChange={(e) =>
                    updateIngredient(index, 'quantity', e.target.value)
                  }
                />
                <Input
                  placeholder="Measure unit"
                  value={ingredient.measureUnit}
                  onChange={(e) =>
                    updateIngredient(index, 'measureUnit', e.target.value)
                  }
                />
                <div className="flex gap-2">
                  <Input
                    className="w-full"
                    placeholder="Note (optional)"
                    value={ingredient.note}
                    onChange={(e) =>
                      updateIngredient(index, 'note', e.target.value)
                    }
                  />
                  {ingredients.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeIngredient(index)}
                    >
                      ✕
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleDraftSave}
              disabled={submitting}
            >
              {submitting ? 'Saving…' : 'Save draft'}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Finish' : 'Add recipe'}
            </Button>
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </div>
      </form>

      {showCloseDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl border bg-card p-5 shadow-xl">
            <h3 className="text-lg font-semibold">Discard changes?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You have unsaved changes. Are you sure you want to close without
              saving?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowCloseDialog(false)}
                disabled={submitting}
              >
                Stay
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  localStorage.removeItem(draftStorageKey);
                  setShowCloseDialog(false);
                  onCancel?.();
                }}
                disabled={submitting}
              >
                Leave without saving
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default RecipeForm;
