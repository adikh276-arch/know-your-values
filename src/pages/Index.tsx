import { useState, useEffect } from "react";
import ProgressIndicator from "@/components/ProgressIndicator";
import ValueCard from "@/components/ValueCard";
import ActivityButton from "@/components/ActivityButton";
import { allValues } from "@/data/values";
import { Reflection, ValueItem } from "@/types/reflection";
import { format } from "date-fns";

const STORAGE_KEY = "values-reflections";

const getHistory = (): Reflection[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveReflection = (r: Reflection) => {
  const history = getHistory();
  history.unshift(r);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

const Index = () => {
  const [screen, setScreen] = useState<"intro" | "choose" | "reflect" | "action" | "summary" | "history">("intro");
  const [selectedValues, setSelectedValues] = useState<ValueItem[]>([]);
  const [chosenValue, setChosenValue] = useState<ValueItem | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [actionText, setActionText] = useState("");
  const [history, setHistory] = useState<Reflection[]>([]);
  const [savedReflection, setSavedReflection] = useState<Reflection | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const toggleValue = (v: ValueItem) => {
    setSelectedValues((prev) =>
      prev.find((p) => p.name === v.name)
        ? prev.filter((p) => p.name !== v.name)
        : [...prev, v]
    );
  };

  const handleSave = () => {
    if (!chosenValue) return;
    const r: Reflection = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      valueEmoji: chosenValue.emoji,
      valueName: chosenValue.name,
      reflection: reflectionText,
      action: actionText,
    };
    saveReflection(r);
    setSavedReflection(r);
    setScreen("summary");
  };

  const handleFinish = () => {
    setHistory(getHistory());
    setScreen("history");
  };

  const resetActivity = () => {
    setSelectedValues([]);
    setChosenValue(null);
    setReflectionText("");
    setActionText("");
    setSavedReflection(null);
    setScreen("intro");
  };

  const stepMap: Record<string, number> = { intro: 1, choose: 2, reflect: 3, action: 4 };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* INTRO */}
        {screen === "intro" && (
          <div className="bg-card rounded-[var(--radius)] shadow-card p-8 animate-in fade-in duration-500">
            <div className="text-center mb-6">
              <span className="text-5xl">🌱</span>
            </div>
            <h1 className="text-[32px] font-semibold text-foreground text-center mb-6 leading-tight">
              Know What Matters to You
            </h1>
            <p className="text-base text-muted-foreground leading-[1.6] text-justified mb-4">
              Values are the principles that guide how we live, make decisions, and treat others. Understanding your values helps you focus on what truly matters in your life.
            </p>
            <p className="text-base text-muted-foreground leading-[1.6] text-justified mb-8">
              In this short activity, you will explore the values that resonate most with you and reflect on how they show up in your daily life.
            </p>
            <ActivityButton onClick={() => setScreen("choose")}>
              Start Reflection →
            </ActivityButton>
            <button
              onClick={() => { setHistory(getHistory()); setScreen("history"); }}
              className="w-full mt-3 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View History
            </button>
          </div>
        )}

        {/* CHOOSE VALUES */}
        {screen === "choose" && (
          <div className="bg-card rounded-[var(--radius)] shadow-card p-8 animate-in fade-in duration-500">
            <ProgressIndicator currentStep={2} totalSteps={4} />
            <h2 className="text-xl font-semibold text-foreground text-center mb-2">
              Choose Values That Feel Important to You
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Select any values that resonate with you. There is no right or wrong choice.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {allValues.map((v) => (
                <ValueCard
                  key={v.name}
                  emoji={v.emoji}
                  name={v.name}
                  selected={!!selectedValues.find((s) => s.name === v.name)}
                  onClick={() => toggleValue(v)}
                />
              ))}
            </div>
            {selectedValues.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Selected Values</p>
                <div className="flex flex-wrap gap-2">
                  {selectedValues.map((v) => (
                    <span key={v.name} className="bg-accent text-accent-foreground text-sm px-3 py-1 rounded-full">
                      {v.emoji} {v.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <ActivityButton onClick={() => setScreen("reflect")} disabled={selectedValues.length === 0}>
              Continue →
            </ActivityButton>
          </div>
        )}

        {/* REFLECT */}
        {screen === "reflect" && (
          <div className="bg-card rounded-[var(--radius)] shadow-card p-8 animate-in fade-in duration-500">
            <ProgressIndicator currentStep={3} totalSteps={4} />
            <h2 className="text-xl font-semibold text-foreground text-center mb-4">
              Reflect on One Value
            </h2>
            <p className="text-base text-muted-foreground leading-[1.6] text-justified mb-6">
              Choose one of the values you selected and think about how it appears in your daily life.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedValues.map((v) => (
                <button
                  key={v.name}
                  onClick={() => setChosenValue(v)}
                  className={`text-sm px-4 py-2 rounded-full transition-all duration-200 ${
                    chosenValue?.name === v.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground hover:bg-primary/10"
                  }`}
                >
                  {v.emoji} {v.name}
                </button>
              ))}
            </div>
            {chosenValue && (
              <>
                <p className="text-sm font-medium text-foreground mb-2">
                  How does this value show up in your life?
                </p>
                <textarea
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="I try to spend quality time with my parents every weekend."
                  className="w-full bg-muted border-0 rounded-[var(--radius)] p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none h-28 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-6"
                />
                <ActivityButton onClick={() => setScreen("action")} disabled={!reflectionText.trim()}>
                  Next →
                </ActivityButton>
              </>
            )}
          </div>
        )}

        {/* ACTION */}
        {screen === "action" && chosenValue && (
          <div className="bg-card rounded-[var(--radius)] shadow-card p-8 animate-in fade-in duration-500">
            <ProgressIndicator currentStep={4} totalSteps={4} />
            <h2 className="text-xl font-semibold text-foreground text-center mb-4">
              Live This Value
            </h2>
            <div className="flex justify-center mb-4">
              <span className="bg-accent text-accent-foreground text-sm px-4 py-2 rounded-full font-medium">
                {chosenValue.emoji} {chosenValue.name}
              </span>
            </div>
            <p className="text-base text-muted-foreground leading-[1.6] text-justified mb-6">
              Small actions help bring our values into everyday life.
            </p>
            <p className="text-sm font-medium text-foreground mb-2">
              What is one small thing you can do this week to live this value?
            </p>
            <textarea
              value={actionText}
              onChange={(e) => setActionText(e.target.value)}
              placeholder="Plan dinner with my family this weekend."
              className="w-full bg-muted border-0 rounded-[var(--radius)] p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none h-28 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-6"
            />
            <ActivityButton onClick={handleSave} disabled={!actionText.trim()}>
              Save Reflection →
            </ActivityButton>
          </div>
        )}

        {/* SUMMARY */}
        {screen === "summary" && savedReflection && (
          <div className="bg-card rounded-[var(--radius)] shadow-card p-8 animate-in fade-in duration-500">
            <h2 className="text-xl font-semibold text-foreground text-center mb-6">
              Your Value Reflection
            </h2>
            <div className="bg-accent rounded-[var(--radius)] p-6 mb-6">
              <div className="text-center mb-4">
                <span className="text-4xl">{savedReflection.valueEmoji}</span>
                <p className="text-xs font-semibold tracking-widest text-accent-foreground mt-2 uppercase">
                  {savedReflection.valueName}
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Reflection</p>
                  <p className="text-sm text-foreground text-justified leading-[1.6]">{savedReflection.reflection}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Action</p>
                  <p className="text-sm text-foreground text-justified leading-[1.6]">{savedReflection.action}</p>
                </div>
              </div>
            </div>
            <blockquote className="text-center mb-6">
              <p className="text-sm italic text-muted-foreground mb-1">
                "Your values become your destiny."
              </p>
              <cite className="text-xs text-muted-foreground not-italic">— Mahatma Gandhi</cite>
            </blockquote>
            <ActivityButton onClick={handleFinish}>Finish</ActivityButton>
          </div>
        )}

        {/* HISTORY */}
        {screen === "history" && (
          <div className="animate-in fade-in duration-500">
            <div className="bg-card rounded-[var(--radius)] shadow-card p-8 mb-5">
              <h2 className="text-xl font-semibold text-foreground text-center mb-2">
                Your Reflections
              </h2>
              <p className="text-sm text-muted-foreground text-justified leading-[1.6]">
                Your previous reflections are saved here so you can revisit them anytime.
              </p>
            </div>
            {history.length === 0 ? (
              <div className="bg-card rounded-[var(--radius)] shadow-card p-8 text-center">
                <p className="text-sm text-muted-foreground mb-6">
                  You haven't completed a values reflection yet.
                </p>
                <ActivityButton onClick={resetActivity}>Start Activity</ActivityButton>
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {history.map((r) => (
                    <div key={r.id} className="bg-card rounded-[var(--radius)] shadow-card p-6">
                      <p className="text-xs text-muted-foreground mb-2">
                        {format(new Date(r.date), "MMMM d")}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{r.valueEmoji}</span>
                        <span className="text-sm font-semibold text-foreground">{r.valueName}</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">Reflection</p>
                          <p className="text-sm text-foreground text-justified leading-[1.6]">{r.reflection}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">Action</p>
                          <p className="text-sm text-foreground text-justified leading-[1.6]">{r.action}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <ActivityButton onClick={resetActivity}>Start New Reflection</ActivityButton>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
