import { Spinner } from '@/components/ui/spinner';

const Loading = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Spinner className="size-8" />
        <span>Loading…</span>
      </div>
    </div>
  );
};

export default Loading;
