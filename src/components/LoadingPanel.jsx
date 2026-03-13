const skeleton = (className) => (
  <div className={`animate-pulse rounded-full bg-slate-200 ${className}`} />
);

const renderVariant = (variant, compact) => {
  if (variant === "table") {
    return (
      <div className="grid w-full gap-3">
        <div className="hidden grid-cols-5 gap-3 md:grid">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-4 animate-pulse rounded-lg bg-slate-200"
            />
          ))}
        </div>
        {Array.from({ length: compact ? 3 : 5 }).map((_, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-5">
            {Array.from({ length: 5 }).map((__, cellIndex) => (
              <div
                key={cellIndex}
                className="h-11 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className="grid w-full gap-4">
        <div className="grid gap-3">
          <div className="h-4 w-1/3 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-12 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-28 animate-pulse rounded-3xl bg-slate-200" />
          <div className="grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        </div>
        <div className="h-56 animate-pulse rounded-[1.75rem] bg-slate-200" />
      </div>
    );
  }

  return (
    <div
      className={`grid w-full gap-4 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4"}`}
    >
      {Array.from({ length: compact ? 2 : 4 }).map((_, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="h-4 w-2/5 animate-pulse rounded-lg bg-slate-200" />
          <div
            className={`${compact ? "h-20" : "h-32"} animate-pulse rounded-3xl bg-slate-200`}
          />
          {skeleton("h-3 w-2/3")}
          {skeleton("h-3 w-1/2")}
        </div>
      ))}
    </div>
  );
};

const LoadingPanel = ({
  title = "Loading",
  message = "Please wait...",
  compact = false,
  variant = "cards",
}) => {
  return (
    <div
      className={`surface-muted grid gap-4 text-center ${compact ? "min-h-[120px] p-5" : "min-h-[220px] p-7"}`}
    >
      <div className="grid justify-items-center gap-1.5">
        <strong
          className={`${compact ? "text-base" : "text-lg"} font-semibold text-slate-900`}
        >
          {title}
        </strong>
        <span className="max-w-xl text-sm leading-6 text-slate-500">
          {message}
        </span>
      </div>
      {renderVariant(variant, compact)}
    </div>
  );
};

export default LoadingPanel;
