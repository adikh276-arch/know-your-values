import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ProgressIndicator from "@/components/ProgressIndicator";
import ValueCard from "@/components/ValueCard";
import ActivityButton from "@/components/ActivityButton";
import { allValues } from "@/data/values";
import { Reflection, ValueItem } from "@/types/reflection";
import { format } from "date-fns";

import { toast } from "sonner";

import { useAuth } from "@/components/AuthContext";
import { sql } from "@/lib/db";

const Index = () => {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const [screen, setScreen] = useState<"intro" | "choose" | "reflect" | "action" | "summary" | "history">("intro");
  const [selectedValues, setSelectedValues] = useState<ValueItem[]>([]);
  const [chosenValue, setChosenValue] = useState<ValueItem | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [actionText, setActionText] = useState("");
  const [history, setHistory] = useState<Reflection[]>([]);
  const [savedReflection, setSavedReflection] = useState<Reflection | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await sql("SELECT id, user_id, date, value_emoji as \"valueEmoji\", value_name as \"valueName\", reflection, action FROM reflections WHERE user_id = $1 ORDER BY date DESC", [userId]);
      setHistory(res.rows);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      toast.error("Failed to load history from database");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const toggleValue = (v: ValueItem) => {
    setSelectedValues((prev) =>
      prev.find((p) => p.name === v.name)
        ? prev.filter((p) => p.name !== v.name)
        : [...prev, v]
    );
  };

  const handleSave = async () => {
    console.log("handleSave called. userId:", userId, "chosenValue:", chosenValue);
    if (!chosenValue || !userId) {
      console.warn("Missing chosenValue or userId. Skipping save.");
      return;
    }
    setIsLoading(true);
    const r: Omit<Reflection, 'id'> = {
      date: new Date().toISOString(),
      valueEmoji: chosenValue.emoji,
      valueName: chosenValue.name,
      reflection: reflectionText,
      action: actionText,
    };

    try {
      const res = await sql(
        "INSERT INTO reflections (user_id, date, value_emoji, value_name, reflection, action) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        [userId, r.date, r.valueEmoji, r.valueName, r.reflection, r.action]
      );

      const fullReflection: Reflection = { ...r, id: res.rows[0].id.toString() };
      setSavedReflection(fullReflection);
      setScreen("summary");
      toast.success("Reflection saved to database");
    } catch (err) {
      console.error("Failed to save reflection:", err);
      toast.error("Failed to save reflection to database");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    fetchHistory();
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
      <div className="w-full max-w-md mx-auto pt-16">
        {/* INTRO */}
        {screen === "intro" && (
          <div className="bg-card rounded-[var(--radius)] shadow-card p-8 animate-in fade-in duration-500">
            <div className="text-center mb-6">
              <span className="text-5xl">🌱</span>
            </div>
            <h1 className="text-[32px] font-semibold text-foreground text-center mb-6 leading-tight">
              {t('app.title')}
            </h1>
            <p className="text-base text-muted-foreground leading-[1.6] text-justified mb-4">
              {t('app.description1')}
            </p>
            <p className="text-base text-muted-foreground leading-[1.6] text-justified mb-8">
              {t('app.description2')}
            </p>
            <ActivityButton onClick={() => setScreen("choose")}>
              {t('app.startReflection')}
            </ActivityButton>
            <button
              onClick={() => { fetchHistory(); setScreen("history"); }}
              className="w-full mt-3 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {t('app.viewHistory')}
            </button>
          </div>
        )}

        {/* CHOOSE VALUES */}
        {screen === "choose" && (
          <div className="bg-card rounded-[var(--radius)] shadow-card p-8 animate-in fade-in duration-500">
            <ProgressIndicator currentStep={2} totalSteps={4} />
            <h2 className="text-xl font-semibold text-foreground text-center mb-2">
              {t('app.chooseTitle')}
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              {t('app.chooseDesc')}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {allValues.map((v) => (
                <ValueCard
                  key={v.name}
                  emoji={v.emoji}
                  name={t(`values.${v.name}`)}
                  selected={!!selectedValues.find((s) => s.name === v.name)}
                  onClick={() => toggleValue(v)}
                />
              ))}
            </div>
            {selectedValues.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-muted-foreground mb-2">{t('app.selectedValues')}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedValues.map((v) => (
                    <span key={v.name} className="bg-accent text-accent-foreground text-sm px-3 py-1 rounded-full">
                      {v.emoji} {t(`values.${v.name}`)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <ActivityButton onClick={() => setScreen("reflect")} disabled={selectedValues.length === 0}>
              {t('app.continue')}
            </ActivityButton>
          </div>
        )}

        {/* REFLECT */}
        {screen === "reflect" && (
          <div className="bg-card rounded-[var(--radius)] shadow-card p-8 animate-in fade-in duration-500">
            <ProgressIndicator currentStep={3} totalSteps={4} />
            <h2 className="text-xl font-semibold text-foreground text-center mb-4">
              {t('app.reflectTitle')}
            </h2>
            <p className="text-base text-muted-foreground leading-[1.6] text-justified mb-6">
              {t('app.reflectDesc')}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedValues.map((v) => (
                <button
                  key={v.name}
                  onClick={() => setChosenValue(v)}
                  className={`text-sm px-4 py-2 rounded-full transition-all duration-200 ${chosenValue?.name === v.name
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground hover:bg-primary/10"
                    }`}
                >
                  {v.emoji} {t(`values.${v.name}`)}
                </button>
              ))}
            </div>
            {chosenValue && (
              <>
                <p className="text-sm font-medium text-foreground mb-2">
                  {t('app.reflectQuestion')}
                </p>
                <textarea
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder={t('app.reflectPlaceholder')}
                  className="w-full bg-muted border-0 rounded-[var(--radius)] p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none h-28 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-6"
                />
                <ActivityButton onClick={() => setScreen("action")} disabled={!reflectionText.trim()}>
                  {t('app.next')}
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
              {t('app.liveTitle')}
            </h2>
            <div className="flex justify-center mb-4">
              <span className="bg-accent text-accent-foreground text-sm px-4 py-2 rounded-full font-medium">
                {chosenValue.emoji} {t(`values.${chosenValue.name}`)}
              </span>
            </div>
            <p className="text-base text-muted-foreground leading-[1.6] text-justified mb-6">
              {t('app.liveDesc')}
            </p>
            <p className="text-sm font-medium text-foreground mb-2">
              {t('app.liveQuestion')}
            </p>
            <textarea
              value={actionText}
              onChange={(e) => setActionText(e.target.value)}
              placeholder={t('app.livePlaceholder')}
              className="w-full bg-muted border-0 rounded-[var(--radius)] p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none h-28 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-6"
            />
            <ActivityButton onClick={handleSave} disabled={!actionText.trim()}>
              {t('app.saveReflection')}
            </ActivityButton>
          </div>
        )}

        {/* SUMMARY */}
        {screen === "summary" && savedReflection && (
          <div className="bg-card rounded-[var(--radius)] shadow-card p-8 animate-in fade-in duration-500">
            <h2 className="text-xl font-semibold text-foreground text-center mb-6">
              {t('app.summaryTitle')}
            </h2>
            <div className="bg-accent rounded-[var(--radius)] p-6 mb-6">
              <div className="text-center mb-4">
                <span className="text-4xl">{savedReflection.valueEmoji}</span>
                <p className="text-xs font-semibold tracking-widest text-accent-foreground mt-2 uppercase">
                  {t(`values.${savedReflection.valueName}`)}
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">{t('app.reflectionLabel')}</p>
                  <p className="text-sm text-foreground text-justified leading-[1.6]">{savedReflection.reflection}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">{t('app.actionLabel')}</p>
                  <p className="text-sm text-foreground text-justified leading-[1.6]">{savedReflection.action}</p>
                </div>
              </div>
            </div>
            <blockquote className="text-center mb-6">
              <p className="text-sm italic text-muted-foreground mb-1">
                {t('app.quote')}
              </p>
              <cite className="text-xs text-muted-foreground not-italic">— {t('app.quoteAuthor')}</cite>
            </blockquote>
            <ActivityButton onClick={handleFinish}>{t('app.finish')}</ActivityButton>
          </div>
        )}

        {/* HISTORY */}
        {screen === "history" && (
          <div className="animate-in fade-in duration-500">
            <div className="bg-card rounded-[var(--radius)] shadow-card p-8 mb-5">
              <h2 className="text-xl font-semibold text-foreground text-center mb-2">
                {t('app.historyTitle')}
              </h2>
              <p className="text-sm text-muted-foreground text-justified leading-[1.6]">
                {t('app.historyDesc')}
              </p>
            </div>
            {history.length === 0 ? (
              <div className="bg-card rounded-[var(--radius)] shadow-card p-8 text-center">
                <p className="text-sm text-muted-foreground mb-6">
                  {t('app.noHistory')}
                </p>
                <ActivityButton onClick={resetActivity}>{t('app.startActivity')}</ActivityButton>
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
                        <span className="text-sm font-semibold text-foreground">{t(`values.${r.valueName}`)}</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">{t('app.reflectionLabel')}</p>
                          <p className="text-sm text-foreground text-justified leading-[1.6]">{r.reflection}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">{t('app.actionLabel')}</p>
                          <p className="text-sm text-foreground text-justified leading-[1.6]">{r.action}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <ActivityButton onClick={resetActivity}>{t('app.startNew')}</ActivityButton>
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
