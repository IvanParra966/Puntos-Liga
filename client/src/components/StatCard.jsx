export default function StatCard({ title, value, subtitle, icon = null }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft backdrop-blur sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-400">{title}</p>
        {icon ? <span className="text-cyan-300">{icon}</span> : null}
      </div>

      <h3 className="mt-3 break-words text-2xl font-semibold text-white sm:text-3xl">{value}</h3>
      <p className="mt-2 text-xs leading-5 text-slate-500">{subtitle}</p>
    </div>
  );
}
