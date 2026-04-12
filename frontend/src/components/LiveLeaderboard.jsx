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

  return (
    <div className="glass-card rounded-[28px] p-6">
      {showTitle ? <h3 className="text-base font-extrabold text-neutral-950 sm:text-lg">Leaderboard</h3> : null}
      <div className={`${showTitle ? "mt-4" : "mt-0"} hidden grid-cols-[minmax(0,2.3fr)_0.8fr_0.7fr_0.95fr_0.75fr] gap-3 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500 lg:grid xl:text-xs`}>
        <div>Player</div>
        <div>Avg time</div>
        <div>Correct</div>
        <div>Violations</div>
        <div>Points</div>
      </div>

      <div className="mt-3 space-y-3" role="list" aria-label="Live quiz leaderboard">
        {sortedPlayers.length ? (
          sortedPlayers.map((player, index) => (
            <div
              key={player.id ?? `${player.name}-${index}`}
              role="listitem"
              className={`rounded-[20px] border px-4 py-4 ${
                index === 0 ? "border-amber-200 bg-amber-50" : "border-neutral-200 bg-white"
              }`}
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
                </div>

                <div className="lg:text-left">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 lg:hidden">Avg time</div>
                  <div className="text-sm font-semibold text-neutral-900">
                    {formatAverageSeconds(player.averageResponseTimeSeconds ?? 0)}
                  </div>
                </div>

                <div className="lg:text-left">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 lg:hidden">Correct</div>
                  <div className="text-sm font-semibold text-neutral-900">{player.correctAnswers ?? 0}</div>
                </div>

                <div className="lg:text-left">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 lg:hidden">Violations</div>
                  <div className="text-sm font-semibold text-neutral-900">{player.violations ?? 0}</div>
                </div>

                <div className="lg:text-left">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 lg:hidden">Points</div>
                  <div className="text-base font-bold text-neutral-950 sm:text-lg">{player.score ?? 0}</div>
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
