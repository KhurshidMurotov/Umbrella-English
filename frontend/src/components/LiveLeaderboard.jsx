import { AlertTriangle, Check } from "lucide-react";

export default function LiveLeaderboard({ players = [], showTitle = true, showAnsweredStatus = false, selfPaced = false }) {
  const sortedPlayers = [...players].sort(
    (first, second) =>
      (second.score ?? 0) - (first.score ?? 0) ||
      (second.correctAnswers ?? 0) - (first.correctAnswers ?? 0)
  );

  const medal = (index) => (index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : null);
  const isCheater = (player) => Boolean(player?.disqualified) || (player?.violations ?? 0) >= 2;

  return (
    <div>
      {showTitle ? <h3 className="h3" style={{ marginBottom: 14 }}>Live ranking</h3> : null}
      {sortedPlayers.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }} role="list" aria-label="Live quiz leaderboard">
          {sortedPlayers.map((player, index) => {
            const cheater = isCheater(player);
            return (
              <div
                key={player.id ?? `${player.name}-${index}`}
                role="listitem"
                className={`lb-row${index === 0 && !cheater ? " top" : ""}${cheater ? " cheater" : ""}`}
              >
                <span className="rank">{index + 1}</span>
                <span className="name" title={player.name}>{player.name}</span>
                {medal(index) ? <span style={{ fontSize: 18 }}>{medal(index)}</span> : null}
                {cheater ? <span className="chip chip-tomato"><AlertTriangle size={13} />Cheater</span> : null}
                {showAnsweredStatus && !cheater ? (
                  selfPaced ? (
                    player.completed
                      ? <span className="chip chip-grass">Done</span>
                      : <span className="chip chip-yellow">Answering</span>
                  ) : player.answeredCurrent
                    ? <span className="chip chip-grass">Answered</span>
                    : <span className="chip" style={{ color: "var(--ink-400)" }}>Waiting</span>
                ) : null}
                <span className="meta"><Check size={13} />{player.correctAnswers ?? 0}</span>
                {(player.violations ?? 0) > 0 ? <span className="meta"><AlertTriangle size={13} />{player.violations}</span> : null}
                <span className="pts">{player.score ?? 0}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="muted" style={{ fontSize: 14 }}>Players will appear here after joining the room.</p>
      )}
    </div>
  );
}
