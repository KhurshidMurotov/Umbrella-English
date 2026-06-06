import { Footprints, Mic } from "lucide-react";
import { Labeled, TextArea, TextInput, Toggle } from "./inputs";

export default function QuizSettingsPanel({ draft, onChange }) {
  function patch(changes) {
    onChange({ ...draft, ...changes });
  }

  return (
    <div className="card space-y-4">
      <Labeled label="Test title">
        <TextInput value={draft.title} onChange={(value) => patch({ title: value })} placeholder="My Unit 3 Test" />
      </Labeled>
      <Labeled label="Description (optional)">
        <TextArea value={draft.description} onChange={(value) => patch({ description: value })} placeholder="What this test covers." rows={2} />
      </Labeled>
      <div className="grid gap-3 sm:grid-cols-2">
        <Labeled label="Level / difficulty (optional)">
          <TextInput value={draft.difficulty} onChange={(value) => patch({ difficulty: value })} placeholder="A2" />
        </Labeled>
        <Labeled label="Estimated time (optional)">
          <TextInput value={draft.estimatedTime} onChange={(value) => patch({ estimatedTime: value })} placeholder="10 min" />
        </Labeled>
      </div>

      <div>
        <p className="eyebrow" style={{ marginBottom: 8 }}>Live exam pacing</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { value: "", label: "Instructor-paced", hint: "Teacher advances each question", Icon: Mic },
            { value: "free-navigation", label: "Self-paced", hint: "Answer in any order, submit at end", Icon: Footprints }
          ].map((option) => {
            const active = (draft.flow ?? "") === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => patch({ flow: option.value })}
                className="text-left"
                style={{
                  borderRadius: "var(--r-md)", padding: "12px 16px", cursor: "pointer", fontFamily: "inherit",
                  border: active ? "var(--border)" : "var(--border-thin)",
                  background: active ? "var(--yellow-100)" : "var(--card)",
                  boxShadow: active ? "var(--pop-sm)" : "none"
                }}
              >
                <p style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><option.Icon size={16} />{option.label}</p>
                <p className="muted" style={{ marginTop: 2, fontSize: 13 }}>{option.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Toggle
          checked={draft.fixedUnitScoring !== false}
          onChange={(checked) => patch({ fixedUnitScoring: checked })}
          label="Score by points per item"
        />
        <Toggle
          checked={draft.showLiveRankingDuringTest === true}
          onChange={(checked) => patch({ showLiveRankingDuringTest: checked })}
          label="Show live ranking during test"
        />
        <Toggle
          checked={draft.shuffleQuestions === true}
          onChange={(checked) => patch({ shuffleQuestions: checked })}
          label="Shuffle questions"
        />
        <Toggle
          checked={draft.shuffleOptions === true}
          onChange={(checked) => patch({ shuffleOptions: checked })}
          label="Shuffle options"
        />
      </div>
    </div>
  );
}
