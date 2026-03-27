const formatPlayersRange = (rule) => {
  if (rule.maxPlayers === null) {
    return `${rule.minPlayers}+ jugadores`;
  }

  if (rule.minPlayers === rule.maxPlayers) {
    return `${rule.minPlayers} jugadores`;
  }

  return `${rule.minPlayers} a ${rule.maxPlayers} jugadores`;
};

const formatPlacementRange = (rule) => {
  if (rule.placingFrom === rule.placingTo) {
    return `${rule.placingFrom}° puesto`;
  }

  return `${rule.placingFrom}° al ${rule.placingTo}° puesto`;
};

export default function PointsEditor({ rules = [] }) {
  const groups = rules.reduce((acc, rule) => {
    if (!acc[rule.label]) {
      acc[rule.label] = [];
    }

    acc[rule.label].push(rule);
    return acc;
  }, {});

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft backdrop-blur sm:p-5 lg:p-6">
      <div>
        <h3 className="text-lg font-semibold text-white sm:text-xl">Reglas de puntaje</h3>
        
      </div>

      <div className="mt-5 space-y-4">
        {Object.entries(groups).map(([label, items]) => (
          <section key={label} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex flex-col gap-1">
              <h4 className="text-base font-semibold text-white">{label}</h4>
              <p className="text-sm text-slate-500">{formatPlayersRange(items[0])}</p>
            </div>

            <div className="mt-4 space-y-3">
              {items.map((rule) => (
                <div key={rule.id || `${rule.label}-${rule.placingFrom}-${rule.placingTo}`} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{formatPlacementRange(rule)}</p>
                    <p className="text-xs text-slate-500">{rule.points} puntos</p>
                  </div>

                  <span className="inline-flex rounded-full bg-cyan-400/15 px-3 py-1 text-sm font-semibold text-cyan-300">
                    {rule.points}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
