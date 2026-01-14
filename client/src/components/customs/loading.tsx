export const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/20 opacity-75"></span>
        <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <span className="text-2xl font-bold text-primary-foreground">C</span>
        </div>
      </div>
      <p className="text-muted-foreground animate-pulse text-sm font-medium">Loading...</p>
    </div>
  );
};
