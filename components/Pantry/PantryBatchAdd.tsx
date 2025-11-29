import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { parseBatchLines, type CreatePantryInput } from './pantry-utils';

type PantryBatchAddProps = {
  onAddMany: (items: CreatePantryInput[]) => void;
};

function PantryBatchAdd({ onAddMany }: PantryBatchAddProps) {
  const [text, setText] = useState('');

  const handleAdd = () => {
    const entries = parseBatchLines(text);
    if (!entries.length) return;
    onAddMany(entries);
    setText('');
  };

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Batch add</h3>
          <p className="text-sm text-muted-foreground">
            Paste multiple items. Format: name | quantity
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={handleAdd} disabled={!text.trim()}>
          Add all
        </Button>
      </div>
      <div className="mt-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={'tomatoes | 4 pcs\nsoy sauce | bottle'}
        />
      </div>
    </div>
  );
}

export { PantryBatchAdd };
