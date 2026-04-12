export default function LiveLeaderboard({ players = [] }) {
  return (
    <div className="glass-card rounded-[28px] p-5">
      <h3 className="text-lg font-extrabold">Leaderboard</h3>
      <div className="mt-4 space-y-3">
        {players.length ? (
          players.map((player, index) => (
            <div key={player.socketId} className="flex items-center justify-between rounded-[20px] bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 font-extrabold">
                  {index + 1}
                </span>
                <div>
                  <span className="font-semibold">{player.name}</span>
                  <p className="text-xs text-neutral-400">
                    Violations: {player.violations ?? 0}
                    {typeof player.currentQuestionIndex === "number"
                      ? player.completed
                        ? " / Done"
                        : ` / Q${player.currentQuestionIndex + 1}`
                      : ""}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-neutral-500">{player.score} pts</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-neutral-500">Players will appear here after joining the room.</p>
        )}
      </div>
    </div>
  );
}
