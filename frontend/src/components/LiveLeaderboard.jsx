function formatAverageSeconds(value) {
  if (!value) {
    return "0.0s";
  }

  return `${value >= 10 ? value.toFixed(1) : value.toFixed(2)}s`;
}

export default function LiveLeaderboard({ players = [], showTitle = true }) {
  const sortedPlayers = [...players].sort(
    (first, second) =>
      (second.score ?? 0) - (first.score ?? 0) ||
      (second.correctAnswers ?? 0) - (first.correctAnswers ?? 0) ||
      (first.averageResponseTimeSeconds ?? 0) - (second.averageResponseTimeSeconds ?? 0)
  );

  const rankBadge = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  const rowClasses = (index) => {
    if (index === 0) return "border-amber-200 bg-amber-50";
    if (index === 1) return "border-slate-200 bg-slate-100";
    if (index === 2) return "border-amber-100 bg-amber-50";
    return "border-neutral-200 bg-white";
  };

  return (
    <div className="glass-card rounded-[28px] p-6">
      {showTitle ? <h3 className="text-base font-extrabold text-neutral-950 sm:text-lg">Live ranking</h3> : null}
      <div className={`${showTitle ? "mt-4" : "mt-0"} hidden grid-cols-[minmax(0,2.3fr)_0.8fr_0.7fr_0.95fr_0.75fr] gap-3 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500 lg:grid xl:text-xs`}>
        <div>Player</div>
        <div>Avg time</div>
        <div>Correct</div>
        <div>Violations</div>
        <div>Points</div>
      </div>

      <div className="mt-3 max-h-[560px] overflow-y-auto space-y-3" role="list" aria-label="Live quiz leaderboard">
        {sortedPlayers.length ? (
          sortedPlayers.map((player, index) => (
            <div
              key={player.id ?? `${player.name}-${index}`}
              role="listitem"
              className={`rounded-[20px] border px-4 py-4 ${rowClasses(index)}`}
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,2.3fr)_0.8fr_0.7fr_0.95fr_0.75fr] lg:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-300 text-sm font-extrabold text-neutral-950">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-neutral-950 xl:text-xl" title={player.name}>
                      {player.name}
                    </p>
                  </div>
                  {rankBadge(index) ? (
                    <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-bold text-neutral-700 shadow-sm">
                      {rankBadge(index)}
                    </span>
                  ) : null}
                </div>

                <div className="hidden lg:block lg:text-left">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Avg time</div>
                  <div className="text-sm font-semibold text-neutral-900">
                    {formatAverageSeconds(player.averageResponseTimeSeconds ?? 0)}
                  </div>
                </div>

                <div className="hidden lg:block lg:text-left">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Correct</div>
                  <div className="text-sm font-semibold text-neutral-900">{player.correctAnswers ?? 0}</div>
                </div>

                <div className="hidden lg:block lg:text-left">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Violations</div>
                  <div className="text-sm font-semibold text-neutral-900">{player.violations ?? 0}</div>
                </div>

                <div className="hidden lg:block lg:text-left">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Points</div>
                  <div className="text-base font-bold text-neutral-950 sm:text-lg">{player.score ?? 0}</div>
                </div>
              </div>

              <div className="mt-4 flex gap-3 overflow-x-auto lg:hidden px-1 pb-1">
                <div className="min-w-[110px] rounded-[18px] border border-neutral-200 bg-slate-50 px-3 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Avg time</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">
                    {formatAverageSeconds(player.averageResponseTimeSeconds ?? 0)}
                  </div>
                </div>
                <div className="min-w-[110px] rounded-[18px] border border-neutral-200 bg-slate-50 px-3 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Correct</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">{player.correctAnswers ?? 0}</div>
                </div>
                <div className="min-w-[110px] rounded-[18px] border border-neutral-200 bg-slate-50 px-3 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Violations</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">{player.violations ?? 0}</div>
                </div>
                <div className="min-w-[110px] rounded-[18px] border border-neutral-200 bg-slate-50 px-3 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Points</div>
                  <div className="mt-1 text-base font-bold text-neutral-950 sm:text-lg">{player.score ?? 0}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-neutral-500">Players will appear here after joining the room.</p>
        )}
      </div>
    </div>
  );
}
