"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Clock3,
  Heart,
  Zap,
  ListTodo,
  RefreshCcw,
  Plus,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const taskTemplates = {
  exam: {
    low: [
      "Open notes for Chapter 3",
      "Review Chapter 3 for 10 minutes",
      "Do 3 practice questions",
    ],
    medium: [
      "Review key concepts from Chapters 3 and 4",
      "Make a quick summary sheet",
      "Do 8 practice questions",
    ],
    high: [
      "Take a timed practice quiz",
      "Do a brain-dump recall session",
      "Review mistakes and weak topics",
    ],
  },
  paper: {
    low: [
      "Open your document",
      "Write the title and heading structure",
      "Find one strong source",
    ],
    medium: [
      "Draft the introduction",
      "Write one body paragraph",
      "Add 2 supporting citations",
    ],
    high: [
      "Finish a full draft section",
      "Revise for clarity and flow",
      "Clean up citations and formatting",
    ],
  },
  project: {
    low: [
      "Open the project files",
      "Pick one tiny bug or feature",
      "Work for 10 focused minutes",
    ],
    medium: [
      "Implement one contained feature",
      "Test the main flow",
      "Write a short progress note",
    ],
    high: [
      "Complete a major feature block",
      "Refactor rough code sections",
      "Test the full workflow end-to-end",
    ],
  },
  default: {
    low: [
      "Open what you need to get started",
      "Do a 5-minute starter step",
      "Complete one very small action",
    ],
    medium: [
      "Work on the easiest meaningful section",
      "Continue for 15 minutes",
      "Check progress and choose the next step",
    ],
    high: [
      "Do the hardest important part first",
      "Push through one solid deep-work block",
      "Review and wrap up progress",
    ],
  },
};

const starterTasks = [
  { label: "Open notes for Chapter 3", type: "Low effort", icon: BookOpen },
  { label: "Answer 3 practice questions", type: "Quick start", icon: Zap },
  { label: "Write one paragraph heading", type: "Low pressure", icon: ListTodo },
];

function classifyTask(task) {
  const t = task.toLowerCase();
  if (t.includes("exam") || t.includes("study") || t.includes("chapter") || t.includes("quiz")) return "exam";
  if (t.includes("paper") || t.includes("essay") || t.includes("report") || t.includes("write")) return "paper";
  if (t.includes("project") || t.includes("code") || t.includes("app") || t.includes("build")) return "project";
  return "default";
}

function energyMeta(energy) {
  if (energy === "low") {
    return {
      icon: BatteryLow,
      label: "Low energy",
      helper: "Prioritize tiny starting steps.",
      progress: 28,
    };
  }
  if (energy === "medium") {
    return {
      icon: BatteryMedium,
      label: "Medium energy",
      helper: "Good for steady progress.",
      progress: 58,
    };
  }
  return {
    icon: BatteryFull,
    label: "High energy",
    helper: "Good time for deeper focus tasks.",
    progress: 88,
  };
}

function generateAdaptivePlan({ task, topics, energy, delayedCount, overwhelmed }) {
  const category = classifyTask(task);
  let steps = [...taskTemplates[category][energy]];

  if (topics.trim()) {
    const firstTopic = topics
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)[0];

    if (firstTopic) {
      steps[0] = steps[0].replace(/Chapter 3|the project files|your document|what you need to get started/i, firstTopic);
    }
  }

  const overloadScore = (overwhelmed ? 2 : 0) + Number(delayedCount || 0) + (energy === "low" ? 1 : 0);
  const isOverloaded = overloadScore >= 3;

  if (isOverloaded) {
    steps = steps.map((step, index) => {
      if (index === 0) return step;
      if (index === 1) return `${step} for just 5–10 minutes`;
      return `Stop after this step and reassess: ${step}`;
    });
  }

  const dashboard = {
    nextStep: steps[0],
    lowEffort: steps[0],
    highFocus:
      energy === "high"
        ? steps[1] || "Complete a focused deep-work block"
        : `Save this for later: ${task || "main task"}`,
    recovery: overwhelmed
      ? "Take a 5-minute reset, then return to the first step"
      : "Short break, water, then continue if momentum feels good",
  };

  const message = isOverloaded
    ? "You seem overloaded. FocusFlow reduced the task into a safer starting point."
    : energy === "high"
    ? "You have enough energy for stronger progress. FocusFlow is surfacing higher-impact actions."
    : "FocusFlow is keeping the task light so it feels easier to begin.";

  return {
    category,
    overloadScore,
    isOverloaded,
    steps,
    dashboard,
    message,
  };
}

function Pill({ children }) {
  return <div className="rounded-full border px-3 py-1 text-xs font-medium text-slate-600">{children}</div>;
}

export default function FocusFlowPrototype() {
  const [screen, setScreen] = useState("input");
  const [task, setTask] = useState("Study for biology exam");
  const [topics, setTopics] = useState("Chapter 3, Chapter 4, Chapter 5");
  const [energy, setEnergy] = useState("low");
  const [delayedCount, setDelayedCount] = useState(2);
  const [overwhelmed, setOverwhelmed] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(
    () => generateAdaptivePlan({ task, topics, energy, delayedCount, overwhelmed }),
    [task, topics, energy, delayedCount, overwhelmed]
  );

  const meta = energyMeta(energy);
  const EnergyIcon = meta.icon;

  const runDemo = () => {
    setSubmitted(true);
    setScreen("results");
  };

  const loadScenario = (type) => {
    if (type === "overwhelmed") {
      setTask("Study for biology exam");
      setTopics("Chapter 3, Chapter 4, Chapter 5");
      setEnergy("low");
      setDelayedCount(3);
      setOverwhelmed(true);
    } else if (type === "focused") {
      setTask("Study for biology exam");
      setTopics("Chapter 3, Chapter 4, Chapter 5");
      setEnergy("high");
      setDelayedCount(1);
      setOverwhelmed(false);
    } else {
      setTask("Write research paper draft");
      setTopics("Introduction, Body Paragraph 1, Sources");
      setEnergy("medium");
      setDelayedCount(2);
      setOverwhelmed(false);
    }
    setSubmitted(false);
    setScreen("input");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-stone-50 to-emerald-50 p-4 md:p-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border bg-white/90 p-6 shadow-sm backdrop-blur"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  <Sparkles className="h-4 w-4" />
                  Adaptive task support prototype
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  FocusFlow
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                  A task system that adapts to energy, avoidance, and overload instead of expecting the user to do all the planning.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-2xl" onClick={() => loadScenario("overwhelmed")}>Overwhelmed demo</Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => loadScenario("focused")}>High-energy demo</Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => loadScenario("paper")}>Paper demo</Button>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-xl">Prototype workflow</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={screen === "input" ? "default" : "outline"}
                      className="rounded-2xl"
                      onClick={() => setScreen("input")}
                    >
                      Input
                    </Button>
                    <Button
                      variant={screen === "results" ? "default" : "outline"}
                      className="rounded-2xl"
                      onClick={() => setScreen("results")}
                    >
                      Output
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {screen === "input" ? (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <Label>Task</Label>
                        <Input
                          value={task}
                          onChange={(e) => setTask(e.target.value)}
                          className="rounded-2xl"
                          placeholder="Ex: Study for biology exam"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Topics / details</Label>
                        <Textarea
                          value={topics}
                          onChange={(e) => setTopics(e.target.value)}
                          className="min-h-[110px] rounded-2xl"
                          placeholder="Ex: Chapter 3, Chapter 4, Chapter 5"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3 rounded-2xl border p-4">
                          <div className="flex items-center gap-2">
                            <EnergyIcon className="h-4 w-4 text-slate-600" />
                            <span className="text-sm font-medium">Energy check-in</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              ["low", "Low"],
                              ["medium", "Medium"],
                              ["high", "High"],
                            ].map(([value, label]) => (
                              <button
                                key={value}
                                onClick={() => setEnergy(value)}
                                className={`rounded-2xl border px-3 py-2 text-sm transition ${
                                  energy === value
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500">{meta.helper}</p>
                        </div>

                        <div className="space-y-3 rounded-2xl border p-4">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-slate-600" />
                            <span className="text-sm font-medium">Overload signals</span>
                          </div>

                          <div className="space-y-3">
                            <label className="flex items-center justify-between rounded-2xl border px-3 py-2 text-sm">
                              Feeling overwhelmed
                              <input
                                type="checkbox"
                                checked={overwhelmed}
                                onChange={(e) => setOverwhelmed(e.target.checked)}
                                className="h-4 w-4"
                              />
                            </label>

                            <div>
                              <div className="mb-2 flex items-center justify-between text-sm">
                                <span>Times delayed</span>
                                <span className="font-semibold">{delayedCount}</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={5}
                                value={delayedCount}
                                onChange={(e) => setDelayedCount(Number(e.target.value))}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-1">
                        <Button onClick={runDemo} className="rounded-2xl px-5">
                          Generate adaptive plan
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-2xl"
                          onClick={() => {
                            setDelayedCount((v) => Math.min(5, v + 1));
                            setOverwhelmed(true);
                          }}
                        >
                          Simulate procrastination
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-5"
                    >
                      <div className="rounded-3xl border bg-emerald-50/60 p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-800">
                          <Brain className="h-4 w-4" />
                          FocusFlow analysis
                        </div>
                        <p className="text-sm leading-6 text-slate-700">{result.message}</p>
                      </div>

                      <div className="grid gap-3">
                        {result.steps.map((step, index) => (
                          <motion.div
                            key={step}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.08 }}
                            className="flex items-start gap-3 rounded-2xl border bg-white p-4"
                          >
                            <div className="mt-0.5 rounded-full bg-slate-900 p-1 text-white">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                                Step {index + 1}
                              </div>
                              <div className="text-sm font-medium text-slate-800 md:text-base">{step}</div>
                            </div>
                            {index === 0 && <Badge className="rounded-full">Next step</Badge>}
                          </motion.div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-3 pt-1">
                        <Button className="rounded-2xl" onClick={() => setScreen("dashboard")}>
                          View dashboard
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="rounded-2xl" onClick={() => setScreen("input")}>
                          Edit inputs
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Why this feels smarter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="rounded-2xl border p-4">
                      <div className="mb-1 text-sm font-semibold">Detect</div>
                      <p className="text-sm text-slate-600">Uses energy, delay patterns, and overwhelm check-ins to infer friction.</p>
                    </div>
                    <div className="rounded-2xl border p-4">
                      <div className="mb-1 text-sm font-semibold">Adapt</div>
                      <p className="text-sm text-slate-600">Breaks large tasks into safer starting steps instead of leaving everything abstract.</p>
                    </div>
                    <div className="rounded-2xl border p-4">
                      <div className="mb-1 text-sm font-semibold">Guide</div>
                      <p className="text-sm text-slate-600">Suggests what to do next based on likely cognitive state, not just a schedule.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Live state</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>{meta.label}</span>
                      <span className="text-slate-500">{meta.progress}% readiness</span>
                    </div>
                    <Progress value={meta.progress} className="h-2" />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>Overload score</span>
                      <span className="font-semibold">{result.overloadScore}/8</span>
                    </div>
                    <Progress value={Math.min(100, result.overloadScore * 12.5)} className="h-2" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Pill>{overwhelmed ? "Overwhelmed" : "Not overwhelmed"}</Pill>
                    <Pill>{delayedCount} delays</Pill>
                    <Pill>{classifyTask(task)} task</Pill>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="sticky top-8 rounded-[2rem] border-0 bg-[#f7f1e8] shadow-sm">
            <CardHeader className="pb-0">
              <div className="mx-auto h-2 w-24 rounded-full bg-black/10" />
            </CardHeader>
            <CardContent className="p-5">
              <div className="mx-auto max-w-sm rounded-[2.5rem] border-8 border-black bg-[#f6efe4] p-4 shadow-inner">
                <div className="space-y-4">
                  <div className="rounded-3xl bg-[#dceee7] p-4 shadow-sm">
                    <div className="mb-1 text-xs text-slate-500">{meta.label}</div>
                    <div className="text-xl font-bold text-slate-900">Hi, here&apos;s your next step.</div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {result.isOverloaded
                        ? "You seem overloaded. Try a small starter task."
                        : "You have a clearer path forward right now."}
                    </p>
                    <button className="mt-3 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-medium shadow-sm">
                      <ArrowRight className="h-4 w-4" />
                      {result.dashboard.nextStep}
                    </button>
                  </div>

                  <div>
                    <div className="mb-3 text-base font-semibold text-slate-900">Your tasks</div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-3 shadow-sm">
                        <div>
                          <div className="text-sm font-medium">{result.dashboard.lowEffort}</div>
                          <div className="text-xs text-slate-500">Low effort</div>
                        </div>
                        <Badge variant="secondary" className="rounded-full">Easy start</Badge>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-3 shadow-sm">
                        <div>
                          <div className="text-sm font-medium">{result.dashboard.highFocus}</div>
                          <div className="text-xs text-slate-500">High focus</div>
                        </div>
                        <Badge variant="secondary" className="rounded-full">Deep work</Badge>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-3 shadow-sm">
                        <div>
                          <div className="text-sm font-medium">{result.dashboard.recovery}</div>
                          <div className="text-xs text-slate-500">Recovery</div>
                        </div>
                        <Badge variant="secondary" className="rounded-full">Reset</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Heart className="h-4 w-4" />
                      Quick check-in
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        ["low", "Low"],
                        ["medium", "Medium"],
                        ["high", "High"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => setEnergy(value)}
                          className={`rounded-2xl border px-3 py-2 text-sm ${
                            energy === value ? "border-slate-900 bg-slate-900 text-white" : "bg-white"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <div className="mb-2 text-sm font-semibold">Starter ideas</div>
                    <div className="space-y-2">
                      {starterTasks.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.label}
                            className="flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="h-4 w-4 text-slate-500" />
                              <div>
                                <div className="font-medium">{item.label}</div>
                                <div className="text-xs text-slate-500">{item.type}</div>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 rounded-2xl" onClick={() => setScreen("input")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add task
                    </Button>
                    <Button variant="outline" className="rounded-2xl" onClick={() => {
                      setDelayedCount((v) => Math.min(5, v + 1));
                      setOverwhelmed(true);
                    }}>
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
