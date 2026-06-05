import { Labeled, TextArea, TextInput, Toggle } from "./inputs";

export default function QuizSettingsPanel({ draft, onChange }) {
  function patch(changes) {
    onChange({ ...draft, ...changes });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-5">
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
        <p className="mb-2 text-sm font-black text-neutral-700">Live exam pacing</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { value: "", label: "🎙 Instructor-paced", hint: "Teacher advances each question" },
            { value: "free-navigation", label: "🏃 Self-paced", hint: "Answer in any order, submit at end" }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => patch({ flow: option.value })}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                (draft.flow ?? "") === option.value
                  ? "border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200"
                  : "border-neutral-200 bg-neutral-50 hover:bg-white"
              }`}
            >
              <p className="text-sm font-extrabold text-neutral-900">{option.label}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{option.hint}</p>
            </button>
          ))}
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
