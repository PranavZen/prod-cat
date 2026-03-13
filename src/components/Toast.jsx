const toneClass = (tone) =>
  tone === "error"
    ? "border-rose-200 bg-rose-50 text-rose-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";

const titleLabel = (tone) => (tone === "error" ? "Error" : "Success");

const Toast = ({ toast, onDismiss }) => {
  if (!toast?.message) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 w-full max-w-md sm:right-6 sm:top-6">
      <div
        role={toast.tone === "error" ? "alert" : "status"}
        className={`pointer-events-auto rounded-3xl border px-5 py-4 shadow-xl backdrop-blur ${toneClass(toast.tone)}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-1">
            <strong className="text-sm font-semibold uppercase tracking-wide">
              {toast.title || titleLabel(toast.tone)}
            </strong>
            <span className="text-sm leading-6">{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="btn-ghost !px-0 !py-0 hover:bg-transparent"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;