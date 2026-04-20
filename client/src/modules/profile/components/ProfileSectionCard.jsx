export default function ProfileSectionCard({
  title,
  children,
  actionLabel = 'Guardar',
  onAction,
  hideAction = false,
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <div className="mt-6">{children}</div>

      {!hideAction ? (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onAction}
            className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500"
          >
            {actionLabel}
          </button>
        </div>
      ) : null}
    </section>
  );
}