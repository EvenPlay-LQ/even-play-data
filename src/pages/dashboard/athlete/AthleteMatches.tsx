import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Trophy, Plus, Loader2, ChevronUp, ChevronDown,
  Filter, Search, Trash2, X, CheckCircle, MinusCircle, XCircle
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { handleQueryError } from "@/lib/queryHelpers";

type Result = "win" | "loss" | "draw";
type SortKey = "match_date" | "opponent" | "result" | "goals" | "rating";

interface MatchForm {
  opponent: string;
  match_date: string;
  result: Result;
  score: string;
  goals: number;
  assists: number;
  minutes_played: number;
  rating: number;
  notes: string;
}

const RESULT_CONFIG = {
  win: { label: "Win", icon: CheckCircle, color: "text-stat-green", bg: "bg-stat-green/10" },
  draw: { label: "Draw", icon: MinusCircle, color: "text-gold", bg: "bg-gold/10" },
  loss: { label: "Loss", icon: XCircle, color: "text-stat-red", bg: "bg-stat-red/10" },
};

const defaultForm: MatchForm = {
  opponent: "",
  match_date: new Date().toISOString().split("T")[0],
  result: "win",
  score: "",
  goals: 0,
  assists: 0,
  minutes_played: 90,
  rating: 7,
  notes: "",
};

const AthleteMatches = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [athlete, setAthlete] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MatchForm>(defaultForm);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<Result | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("match_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data: athleteData } = await supabase
        .from("athletes").select("id").eq("profile_id", user.id).maybeSingle();
      if (athleteData) {
        setAthlete(athleteData);
        const { data, error } = await supabase
          .from("athlete_matches" as any)
          .select("*")
          .eq("athlete_id", athleteData.id)
          .order("match_date", { ascending: false });
        if (error) handleQueryError(error, "Failed to load matches.");
        else setMatches(data || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleAdd = async () => {
    if (!athlete || !form.opponent || !form.match_date) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("athlete_matches" as any)
      .insert([{ ...form, athlete_id: athlete.id }])
      .select().single();
    if (error) { handleQueryError(error, "Failed to add match."); }
    else {
      setMatches([data, ...matches]);
      setForm(defaultForm);
      setOpen(false);
      toast({ title: "Match logged!", description: `vs ${form.opponent} recorded.` });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("athlete_matches" as any).delete().eq("id", id);
    if (error) handleQueryError(error);
    else {
      setMatches(matches.filter(m => m.id !== id));
      toast({ title: "Match removed." });
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="h-3 w-3 opacity-30" />;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  const filtered = useMemo(() => {
    let data = [...matches];
    if (search) data = data.filter(m => m.opponent.toLowerCase().includes(search.toLowerCase()));
    if (resultFilter !== "all") data = data.filter(m => m.result === resultFilter);
    data.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return data;
  }, [matches, search, resultFilter, sortKey, sortDir]);

  // Summary stats
  const wins = matches.filter(m => m.result === "win").length;
  const losses = matches.filter(m => m.result === "loss").length;
  const draws = matches.filter(m => m.result === "draw").length;
  const winRate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0;
  const totalGoals = matches.reduce((s, m) => s + (m.goals || 0), 0);
  const avgRating = matches.length > 0 ? (matches.reduce((s, m) => s + Number(m.rating || 0), 0) / matches.length).toFixed(1) : "—";

  if (loading) {
    return (
      <DashboardLayout role="athlete">
        <div className="md:ml-16 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="athlete">
      <div className="md:ml-16 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">My Matches</h1>
            <p className="text-sm text-muted-foreground mt-1">Log and track every match you play.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> Log Match</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Log a New Match</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label>Opponent</Label>
                    <Input className="mt-1" placeholder="e.g. City FC" value={form.opponent} onChange={e => setForm({ ...form, opponent: e.target.value })} />
                  </div>
                  <div>
                    <Label>Match Date</Label>
                    <Input type="date" className="mt-1" value={form.match_date} onChange={e => setForm({ ...form, match_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Score</Label>
                    <Input className="mt-1" placeholder="e.g. 2-1" value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} />
                  </div>
                </div>

                <div>
                  <Label>Result</Label>
                  <div className="flex gap-2 mt-2">
                    {(["win", "draw", "loss"] as Result[]).map(r => {
                      const c = RESULT_CONFIG[r];
                      return (
                        <button key={r} onClick={() => setForm({ ...form, result: r })}
                          className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${form.result === r ? `border-current ${c.color} ${c.bg}` : "border-border text-muted-foreground"}`}>
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Goals</Label>
                    <Input type="number" min={0} className="mt-1" value={form.goals} onChange={e => setForm({ ...form, goals: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Assists</Label>
                    <Input type="number" min={0} className="mt-1" value={form.assists} onChange={e => setForm({ ...form, assists: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Minutes</Label>
                    <Input type="number" min={0} max={120} className="mt-1" value={form.minutes_played} onChange={e => setForm({ ...form, minutes_played: Number(e.target.value) })} />
                  </div>
                </div>

                <div>
                  <Label>Rating (1–10)</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <input type="range" min={1} max={10} step={0.5} value={form.rating}
                      onChange={e => setForm({ ...form, rating: Number(e.target.value) })}
                      className="flex-1 accent-primary" />
                    <span className="font-display font-bold text-lg text-foreground w-10 text-right">{form.rating}</span>
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea className="mt-1 resize-none" rows={3} placeholder="How did you perform? Key moments..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>

                <Button className="w-full" onClick={handleAdd} disabled={saving || !form.opponent || !form.match_date}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trophy className="mr-2 h-4 w-4" />}
                  Save Match
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Stats */}
        {matches.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Played", value: matches.length, color: "text-foreground" },
              { label: "Wins", value: wins, color: "text-stat-green" },
              { label: "Draws", value: draws, color: "text-gold" },
              { label: "Losses", value: losses, color: "text-stat-red" },
              { label: "Win Rate", value: `${winRate}%`, color: "text-primary" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl p-4 border border-border shadow-card text-center">
                <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Filters */}
        {matches.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search opponent..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              {(["all", "win", "draw", "loss"] as const).map(r => (
                <button key={r} onClick={() => setResultFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${resultFilter === r ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Match Table / Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 px-4 bg-card rounded-xl border border-dashed border-border">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display font-semibold text-foreground mb-1">
              {matches.length === 0 ? "Add Your First Match" : "No matches match your filter"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {matches.length === 0 ? "Tap \"Log Match\" to record your first game." : "Try adjusting the search or filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 gap-2 px-6 py-4 bg-card rounded-t-xl border border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {[
                { key: "opponent", label: "Opponent", span: 3 },
                { key: "match_date", label: "Date", span: 2 },
                { key: "result", label: "Result", span: 2 },
                { key: "goals", label: "G / A", span: 2 },
                { key: "rating", label: "Rating", span: 2 },
              ].map(col => (
                <button key={col.key} onClick={() => toggleSort(col.key as SortKey)}
                  className={`col-span-${col.span} flex items-center gap-1.5 hover:text-foreground transition-colors`}>
                  {col.label} <SortIcon col={col.key as SortKey} />
                </button>
              ))}
              <div className="col-span-1" />
            </div>

            <div className="grid gap-3 md:gap-0 md:bg-card md:border md:border-t-0 md:border-border md:rounded-b-xl md:divide-y md:divide-border overflow-hidden">
              {filtered.map((match, i) => {
                const rc = RESULT_CONFIG[match.result as Result] || RESULT_CONFIG.draw;
                const ResultIcon = rc.icon;
                return (
                  <motion.div 
                    key={match.id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.03 }}
                    className="group bg-card md:bg-transparent rounded-xl md:rounded-none border md:border-0 border-border p-4 md:px-6 md:py-4 flex flex-col md:grid md:grid-cols-12 md:gap-2 md:items-center hover:bg-muted/30 transition-all shadow-sm md:shadow-none"
                  >
                    {/* Mobile Header (Opponent + Date) */}
                    <div className="flex items-start justify-between md:col-span-3 mb-4 md:mb-0">
                      <div className="min-w-0">
                        <div className="text-base md:text-sm font-bold text-foreground truncate">vs {match.opponent}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 md:hidden">
                          {new Date(match.match_date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                      <div className="md:hidden">
                         <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${rc.bg} ${rc.color} border border-current/10`}>
                          <ResultIcon className="h-3 w-3" /> {rc.label.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Date (Desktop Only) */}
                    <div className="hidden md:block md:col-span-2 text-xs text-muted-foreground font-medium">
                      {new Date(match.match_date).toLocaleDateString("en", { month: "short", day: "numeric", year: "2-digit" })}
                    </div>

                    {/* Result (Desktop Only) */}
                    <div className="hidden md:block md:col-span-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${rc.bg} ${rc.color} border border-current/10`}>
                        <ResultIcon className="h-3 w-3" /> {rc.label}
                      </span>
                    </div>

                    {/* Mobile Grid (Stats + Rating) */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-border md:border-0 md:py-0 md:col-span-4 mb-4 md:mb-0">
                      <div className="text-center md:text-left">
                        <div className="text-[10px] text-muted-foreground uppercase mb-0.5 md:hidden">Goals</div>
                        <div className="text-sm font-bold text-foreground">{match.goals}</div>
                      </div>
                      <div className="text-center md:text-left">
                        <div className="text-[10px] text-muted-foreground uppercase mb-0.5 md:hidden">Assists</div>
                        <div className="text-sm font-bold text-foreground">{match.assists}</div>
                      </div>
                      <div className="text-center md:flex md:items-center md:justify-start">
                        <div className="text-[10px] text-muted-foreground uppercase mb-0.5 md:hidden">Rating</div>
                        <span className={`text-base md:text-sm font-display font-bold ${Number(match.rating) >= 8 ? "text-stat-green" : Number(match.rating) >= 6 ? "text-gold" : "text-stat-red"}`}>
                          {Number(match.rating).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="flex items-center justify-between mt-auto md:mt-0 md:col-span-1 md:justify-end">
                      {match.score && <div className="text-xs font-semibold bg-muted px-2 py-0.5 rounded md:hidden">{match.score}</div>}
                      <div className="hidden md:block text-xs font-medium text-muted-foreground mr-4 truncate">{match.score}</div>
                      <button onClick={() => handleDelete(match.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all p-2 rounded-lg ml-auto md:ml-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AthleteMatches;
