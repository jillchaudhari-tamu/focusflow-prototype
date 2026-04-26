"use client";

import { useMemo, useState } from "react";

const starterTasks = [
  {
    id: 1,
    title: "Study for biology exam",
    details: "Chapter 3, Chapter 4, Chapter 5",
    energy: "low",
    delayedCount: 3,
    overwhelmed: true,
    completed: false,
  },
  {
    id: 2,
    title: "Write research paper draft",
    details: "Intro, first body paragraph, citations",
    energy: "medium",
    delayedCount: 1,
    overwhelmed: false,
    completed: false,
  },
  {
    id: 3,
    title: "Clean up project demo",
    details: "Fix UI, test buttons, prepare demo flow",
    energy: "high",
    delayedCount: 0,
    overwhelmed: false,
    completed: false,
  },
];

const templates = {
  exam: {
    low: ["Open notes", "Review for 10 minutes", "Do 3 practice questions"],
    medium: ["Review key concepts", "Make a short summary", "Do 8 practice questions"],
    high: ["Take a timed practice quiz", "Do active recall", "Review missed questions"],
  },
  paper: {
    low: ["Open the document", "Write the title", "Find one source"],
    medium: ["Draft the introduction", "Write one body paragraph", "Add 2 citations"],
    high: ["Write a full section", "Revise for clarity", "Clean up citations"],
  },
  project: {
    low: ["Open project files", "Pick one small fix", "Work for 10 minutes"],
    medium: ["Build one feature", "Test the main flow", "Write a progress note"],
    high: ["Finish a major feature", "Refactor rough code", "Test end-to-end"],
  },
  default: {
    low: ["Open what you need", "Do a 5-minute starter step", "Complete one tiny action"],
    medium: ["Work on the easiest useful part", "Continue for 15 minutes", "Choose the next step"],
    high: ["Do the hardest important part", "Finish a deep-work block", "Review your progress"],
  },
};

function classifyTask(title) {
  const text = String(title || "").toLowerCase();

  if (
    text.includes("exam") ||
    text.includes("study") ||
    text.includes("quiz") ||
    text.includes("chapter")
  ) {
    return "exam";
  }

  if (
    text.includes("paper") ||
    text.includes("essay") ||
    text.includes("report") ||
    text.includes("write")
  ) {
    return "paper";
  }

  if (
    text.includes("project") ||
    text.includes("code") ||
    text.includes("demo") ||
    text.includes("build")
  ) {
    return "project";
  }

  return "default";
}

function getEnergyInfo(energy) {
  if (energy === "low") {
    return {
      label: "Low energy",
      icon: "🌙",
      progress: 28,
      helper: "Small starting steps are best right now.",
      color: "from-amber-100 to-orange-50",
      chip: "bg-amber-100 text-amber-800",
    };
  }

  if (energy === "medium") {
    return {
      label: "Medium energy",
      icon: "⚡",
      progress: 58,
      helper: "Good for steady progress.",
      color: "from-sky-100 to-cyan-50",
      chip: "bg-sky-100 text-sky-800",
    };
  }

  return {
    label: "High energy",
    icon: "🚀",
    progress: 88,
    helper: "Good time for deeper focus work.",
    color: "from-emerald-100 to-lime-50",
    chip: "bg-emerald-100 text-emerald-800",
  };
}

function createPlan(task) {
  if (!task) {
    return {
      category: "default",
      overloadScore: 0,
      overloaded: false,
      steps: [],
      message: "Add a task to get an adaptive next step.",
      nextLabel: "No task selected",
    };
  }

  const category = classifyTask(task.title);
  const energy = task.energy || "low";
  const baseSteps = [...templates[category][energy]];
  const firstDetail = String(task.details || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)[0];

  if (firstDetail) {
    baseSteps[0] = `${baseSteps[0]}: ${firstDetail}`;
  }

  const overloadScore =
    (task.overwhelmed ? 2 : 0) +
    Number(task.delayedCount || 0) +
    (energy === "low" ? 1 : 0);

  const overloaded = overloadScore >= 3;

  const steps = overloaded
    ? baseSteps.map((step, index) => {
        if (index === 0) return step;
        if (index === 1) return `${step} for only 5-10 minutes`;
        return `Stop and reassess after: ${step}`;
      })
    : baseSteps;

  const message = overloaded
    ? "You seem overloaded, so FocusFlow reduced the task into a safer starting point."
    : energy === "high"
      ? "Your energy looks strong, so FocusFlow is surfacing a higher-impact action."
      : "FocusFlow is keeping this manageable so you can build momentum.";

  return {
    category,
    overloadScore,
    overloaded,
    steps,
    message,
    nextLabel: steps[0] || "Choose a task",
  };
}

function Button({ children, onClick, variant = "default", className = "", disabled = false, type = "button" }) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

  const styles = {
    default: "bg-slate-950 text-white shadow-sm hover:bg-slate-800",
    outline: "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
    soft: "bg-slate-100 text-slate-800 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant] || styles.default} ${className}`}
    >
      {children}
    </button>
  );
}

function Badge({ children, variant = "default" }) {
  const styles = {
    default: "bg-slate-950 text-white",
    soft: "bg-slate-100 text-slate-700",
    danger: "bg-rose-100 text-rose-700",
    success: "bg-emerald-100 text-emerald-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[variant] || styles.default}`}>
      {children}
    </span>
  );
}

function Card({ children, className = "" }) {
  return <section className={`rounded-[2rem] bg-white/95 p-5 shadow-sm ring-1 ring-black/5 ${className}`}>{children}</section>;
}

export default function FocusFlowApp() {
  const [tasks, setTasks] = useState(starterTasks);
  const [selectedId, setSelectedId] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [newEnergy, setNewEnergy] = useState("low");
  const [newOverwhelmed, setNewOverwhelmed] = useState(false);

  const selectedTask = tasks.find((task) => task.id === selectedId) || tasks[0] || null;
  const plan = useMemo(() => createPlan(selectedTask), [selectedTask]);
  const energyInfo = getEnergyInfo(selectedTask?.energy || "low");
  const completedCount = tasks.filter((task) => task.completed).length;
  const remainingCount = tasks.length - completedCount;
  const overallProgress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  function updateSelected(updates) {
    if (!selectedTask) return;

    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === selectedTask.id ? { ...task, ...updates } : task
      )
    );
  }

  function addTask() {
    if (!newTitle.trim()) return;

    const task = {
      id: Date.now(),
      title: newTitle.trim(),
      details: newDetails.trim(),
      energy: newEnergy,
      delayedCount: 0,
      overwhelmed: newOverwhelmed,
      completed: false,
    };

    setTasks((previousTasks) => [task, ...previousTasks]);
    setSelectedId(task.id);
    setNewTitle("");
    setNewDetails("");
    setNewEnergy("low");
    setNewOverwhelmed(false);
    setShowAdd(false);
  }

  function deleteTask(id) {
    const nextTasks = tasks.filter((task) => task.id !== id);
    setTasks(nextTasks);

    if (id === selectedId) {
      setSelectedId(nextTasks[0]?.id || null);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9f7ec,transparent_35%),linear-gradient(180deg,#fffaf2,#f2eadf)] px-4 py-7 text-slate-950">
      <div className="mx-auto max-w-md">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">✨ Adaptive task support</p>
            <h1 className="text-4xl font-black tracking-tight">FocusFlow</h1>
          </div>

          <Button onClick={() => setShowAdd(true)} className="shadow-md shadow-slate-900/10">＋ Add</Button>
        </header>

        <Card className="mb-5 overflow-hidden bg-slate-950 p-0 text-white">
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Today&apos;s focus</p>
                <h2 className="mt-2 text-2xl font-black leading-tight">
                  {selectedTask ? plan.nextLabel : "Add a task to begin"}
                </h2>
              </div>
              <div className="rounded-3xl bg-white/10 px-4 py-3 text-3xl shadow-inner">{energyInfo.icon}</div>
            </div>

            <p className="text-sm leading-6 text-slate-200">{plan.message}</p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-3xl bg-white/10 p-3 text-center">
                <p className="text-2xl font-black">{tasks.length}</p>
                <p className="text-xs text-slate-300">Tasks</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-3 text-center">
                <p className="text-2xl font-black">{remainingCount}</p>
                <p className="text-xs text-slate-300">Left</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-3 text-center">
                <p className="text-2xl font-black">{overallProgress}%</p>
                <p className="text-xs text-slate-300">Done</p>
              </div>
            </div>
          </div>
        </Card>

        {!selectedTask ? (
          <Card className="text-center">
            <h2 className="text-2xl font-bold">No tasks yet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Add a task and FocusFlow will break it into a smaller next step.
            </p>
            <Button className="mt-5" onClick={() => setShowAdd(true)}>
              Add task
            </Button>
          </Card>
        ) : (
          <>
            <Card className={`mb-5 bg-gradient-to-br ${energyInfo.color}`}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${energyInfo.chip}`}>
                      {energyInfo.label}
                    </span>
                    <Badge variant={plan.overloaded ? "danger" : "success"}>
                      {plan.overloaded ? "Overloaded" : "Ready"}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-black">{selectedTask.title}</h2>
                  {selectedTask.details ? (
                    <p className="mt-1 text-sm leading-6 text-slate-600">{selectedTask.details}</p>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-between rounded-3xl bg-white px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
                onClick={() => updateSelected({ completed: true })}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Recommended next step</p>
                  <p className="mt-1 text-sm font-bold leading-6 text-slate-950">{plan.steps[0]}</p>
                </div>
                <span className="ml-3 rounded-full bg-slate-950 px-3 py-2 text-sm font-bold text-white" aria-hidden="true">
                  →
                </span>
              </button>
            </Card>

            <Card className="mb-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black">Adaptive breakdown</h2>
                  <p className="text-xs text-slate-500">The task is rewritten into smaller action steps.</p>
                </div>
                <Badge variant="soft">Score {plan.overloadScore}</Badge>
              </div>

              <div className="space-y-3">
                {plan.steps.map((step, index) => (
                  <div
                    key={`${selectedTask.id}-${step}-${index}`}
                    className="flex items-start gap-3 rounded-3xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">
                      {index + 1}
                    </div>
                    <p className="text-sm font-semibold leading-6 text-slate-800">{step}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="mb-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black">Adjust state</h2>
                  <p className="text-xs text-slate-500">Change the task state and watch the plan adapt.</p>
                </div>
                <span className="text-xl">🧠</span>
              </div>

              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-bold">Readiness</span>
                  <span className="font-semibold text-slate-500">{energyInfo.progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-950 transition-all"
                    style={{ width: `${energyInfo.progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">{energyInfo.helper}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["low", "medium", "high"].map((energy) => (
                  <button
                    type="button"
                    key={energy}
                    onClick={() => updateSelected({ energy })}
                    className={`rounded-2xl border px-3 py-2.5 text-sm font-bold capitalize transition ${
                      selectedTask.energy === energy
                        ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {energy}
                  </button>
                ))}
              </div>

              <label className="mt-4 flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold">
                I feel overwhelmed
                <input
                  type="checkbox"
                  checked={Boolean(selectedTask.overwhelmed)}
                  onChange={(event) => updateSelected({ overwhelmed: event.target.checked })}
                  className="h-4 w-4"
                />
              </label>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-bold">Times delayed</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {selectedTask.delayedCount}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={selectedTask.delayedCount}
                  onChange={(event) => updateSelected({ delayedCount: Number(event.target.value) })}
                  className="w-full accent-slate-950"
                />
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    updateSelected({
                      delayedCount: Math.min(5, Number(selectedTask.delayedCount || 0) + 1),
                      overwhelmed: true,
                    })
                  }
                >
                  ↻ Delayed
                </Button>

                <Button
                  variant={selectedTask.completed ? "soft" : "default"}
                  className="flex-1"
                  onClick={() => updateSelected({ completed: !selectedTask.completed })}
                >
                  ✓ {selectedTask.completed ? "Done" : "Mark done"}
                </Button>
              </div>
            </Card>
          </>
        )}

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">Task queue</h2>
              <p className="text-xs text-slate-500">Select a task to generate a new plan.</p>
            </div>
            <p className="text-sm font-bold text-slate-500">
              {completedCount}/{tasks.length} done
            </p>
          </div>

          <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-950 transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          {tasks.length === 0 ? (
            <p className="rounded-3xl bg-slate-50 p-4 text-center text-sm text-slate-500">
              Your task list is empty.
            </p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => {
                const taskEnergy = getEnergyInfo(task.energy);
                const isSelected = selectedId === task.id;

                return (
                  <div
                    key={task.id}
                    className={`flex w-full items-center justify-between rounded-3xl border px-4 py-3 transition ${
                      isSelected
                        ? "border-slate-950 bg-slate-950 text-white shadow-md shadow-slate-900/10"
                        : "border-slate-100 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(task.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span aria-hidden="true">{taskEnergy.icon}</span>
                        <div
                          className={`truncate text-sm font-black ${
                            task.completed
                              ? isSelected
                                ? "text-white/50 line-through"
                                : "text-slate-400 line-through"
                              : isSelected
                                ? "text-white"
                                : "text-slate-900"
                          }`}
                        >
                          {task.title}
                        </div>
                      </div>
                      <div className={`mt-1 text-xs capitalize ${isSelected ? "text-white/60" : "text-slate-500"}`}>
                        {task.energy} energy · delayed {task.delayedCount}x
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className={`ml-2 rounded-full p-2 ${
                        isSelected
                          ? "text-white/60 hover:bg-white/10 hover:text-white"
                          : "text-slate-400 hover:bg-red-50 hover:text-red-500"
                      }`}
                      aria-label={`Delete ${task.title}`}
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {showAdd ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Add a task</h2>
                <p className="text-xs text-slate-500">FocusFlow will adapt it based on your state.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-full p-2 hover:bg-slate-100"
                aria-label="Close add task form"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="task-name" className="text-sm font-bold">
                  Task name
                </label>
                <input
                  id="task-name"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="Ex: Study for exam"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="task-details" className="text-sm font-bold">
                  Details
                </label>
                <textarea
                  id="task-details"
                  value={newDetails}
                  onChange={(event) => setNewDetails(event.target.value)}
                  placeholder="Ex: Chapter 3, practice quiz, notes"
                  className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold">Energy</p>
                <div className="grid grid-cols-3 gap-2">
                  {["low", "medium", "high"].map((energy) => (
                    <button
                      type="button"
                      key={energy}
                      onClick={() => setNewEnergy(energy)}
                      className={`rounded-2xl border px-3 py-2.5 text-sm font-bold capitalize transition ${
                        newEnergy === energy
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      {energy}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between rounded-3xl border bg-slate-50 px-4 py-3 text-sm font-bold">
                Feeling overwhelmed
                <input
                  type="checkbox"
                  checked={newOverwhelmed}
                  onChange={(event) => setNewOverwhelmed(event.target.checked)}
                  className="h-4 w-4"
                />
              </label>

              <Button className="w-full" onClick={addTask} disabled={!newTitle.trim()}>
                Add task
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
