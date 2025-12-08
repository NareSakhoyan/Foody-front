const PlannerHeader = () => {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Meal planner</h1>
        <p className="text-muted-foreground">
          Block out the week, drag recipes into slots, and keep a dock of ideas
          ready to go.
        </p>
      </div>
    </div>
  );
};

export { PlannerHeader };
