export default function LiveLeaderboard({ players = [] }) {
  // Sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const getPlacementColor = (index) => {
    if (index === 0) return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200";
    if (index === 1) return "bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200";
    if (index === 2) return "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200";
    return "bg-white border-neutral-200";
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  };

  return (
    <div className="glass-card rounded-[28px] p-6">
      <h3 className="text-lg font-extrabold">Leaderboard</h3>
      <div className="mt-4 space-y-2" role="list" aria-label="Live quiz leaderboard">
        {sortedPlayers.length ? (
          sortedPlayers.map((player, index) => (
            <div
              key={player.socketId}
              role="listitem"
              className={`flex items-center justify-between rounded-[20px] border px-4 py-3 transition ${getPlacementColor(index)}`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 font-extrabold text-sm">
                  {getMedalEmoji(index) || index + 1}
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-neutral-900 break-words">{player.name}</span>
                  <p className="text-sm text-neutral-600">
                    Violations: {player.violations ?? 0}
                    {typeof player.currentQuestionIndex === "number"
                      ? player.completed
                        ? " / Done"
                        : ` / Q${player.currentQuestionIndex + 1}`
                      : ""}
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold text-neutral-900 ml-2 whitespace-nowrap">{player.score ?? 0} pts</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-neutral-500">Players will appear here after joining the room.</p>
        )}
      </div>
    </div>
  );
}
