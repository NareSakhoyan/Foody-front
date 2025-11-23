import { Spinner } from '@/components/ui/spinner';

const Loading = () => {
  return (
    <div className="flex items-center gap-6">
      <Spinner className="size-8" />
    </div>
  );
};

export default Loading;
