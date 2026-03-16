import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Dumbbell, Zap, Plus, Loader2, TrendingUp
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { handleQueryError } from "@/lib/queryHelpers";

interface MetricForm {
  speed: number;
  endurance: number;
  strength: number;
  reaction_time: number;
  agility: number;
  training_hours_per_week: number;
  recorded_at: string;
}

const defaultMetricForm: MetricForm = {
  speed: 70,
  endurance: 70,
  strength: 70,
  reaction_time: 0.35,
  agility: 70,
  training_hours_per_week: 10,
  recorded_at: new Date().toISOString().split("T")[0],
};

const CHART_COLORS = {
  speed: "#F97316",
  endurance: "#3B82F6",
  strength: "#A855F7",
  agility: "#EC4899",
};

const PIE_COLORS = ["#22C55E", "#EAB308", "#EF4444"];

const AthleteAnalytics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [athlete, setAthlete] = useState<any>(null);
  const [matchStats, setMatchStats] = useState<any[]>([]);
  const [perfTests, setPerfTests] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [athleteMatches, setAthleteMatches] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MetricForm>(defaultMetricForm);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data: ath } = await supabase.from("athletes").select("*").eq("profile_id", user.id).maybeSingle();
      if (ath) {
        setAthlete(ath);
        const [msRes, ptRes, pmRes, amRes] = await Promise.all([
          supabase.from("match_stats").select("*").eq("athlete_id", ath.id),
          supabase.from("performance_tests" as any).select("*").eq("athlete_id", ath.id).order("test_date", { ascending: true }),
          supabase.from("performance_metrics" as any).select("*").eq("athlete_id", ath.id).order("recorded_at", { ascending: true }),
          supabase.from("athlete_matches" as any).select("*").eq("athlete_id", ath.id),
        ]);
        if (!msRes.error) setMatchStats(msRes.data || []);
        if (!ptRes.error) setPerfTests((ptRes.data as any[]) || []);
        if (!pmRes.error) setMetrics((pmRes.data as any[]) || []);
        if (!amRes.error) setAthleteMatches((amRes.data as any[]) || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleAddMetrics = async () => {
    if (!athlete) return;
    setSaving(true);
    const { data, error } = await supabase.from("performance_metrics" as any)
      .insert([{ ...form, athlete_id: athlete.id }])
      .select().single();
    if (error) { handleQueryError(error); }
    else {
      setMetrics([...metrics, data]);
      setOpen(false);
      setForm({ ...defaultMetricForm, recorded_at: new Date().toISOString().split("T")[0] });
      toast({ title: "Performance metrics recorded!" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout role="athlete">
        <div className="md:ml-16 space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  // Compute analytics
  const allMatches = [...matchStats, ...athleteMatches];
  const totalPlayed = athleteMatches.length;
  const wins = athleteMatches.filter(m => m.result === "win").length;
  const draws = athleteMatches.filter(m => m.result === "draw").length;
  const losses = athleteMatches.filter(m => m.result === "loss").length;
  const winRate = totalPlayed > 0 ? Math.round((wins / totalPlayed) * 100) : 0;
  const totalGoals = athleteMatches.reduce((s, m) => s + (m.goals || 0), 0);
  const avgRating = athleteMatches.length > 0
    ? (athleteMatches.reduce((s, m) => s + Number(m.rating || 0), 0) / athleteMatches.length).toFixed(1)
    : "—";

  const recentPerf = athleteMatches.slice(-10).map((m, i) => ({
    name: new Date(m.match_date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    rating: Number(m.rating || 0),
    goals: m.goals || 0,
  }));

  const metricsChartData = metrics.map((m) => ({
    date: new Date(m.recorded_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
    speed: m.speed,
    endurance: m.endurance,
    strength: m.strength,
    agility: m.agility,
  }));

  const pieData = [
    { name: "Wins", value: wins },
    { name: "Draws", value: draws },
    { name: "Losses", value: losses },
  ].filter(d => d.value > 0);

  const latestMetrics = metrics[metrics.length - 1];

  return (
    <DashboardLayout role="athlete">
      <div className="md:ml-16 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Analytics & Performance</h1>
            <p className="text-sm text-muted-foreground mt-1">Track your progress, trends, and fitness metrics.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Plus className="h-4 w-4 mr-1" /> Record Metrics</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Record Performance Metrics</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Date</Label>
                  <Input type="date" className="mt-1" value={form.recorded_at} onChange={e => setForm({ ...form, recorded_at: e.target.value })} />
                </div>
                {([
                  { key: "speed", label: "Speed (0–100)", max: 100, step: 1 },
                  { key: "endurance", label: "Endurance (0–100)", max: 100, step: 1 },
                  { key: "strength", label: "Strength (0–100)", max: 100, step: 1 },
                  { key: "agility", label: "Agility (0–100)", max: 100, step: 1 },
                  { key: "reaction_time", label: "Reaction Time (seconds)", max: 1, step: 0.01 },
                  { key: "training_hours_per_week", label: "Training Hours / Week", max: 40, step: 0.5 },
                ] as const).map(f => (
                  <div key={f.key}>
                    <div className="flex justify-between">
                      <Label>{f.label}</Label>
                      <span className="text-sm font-semibold text-foreground">{(form as any)[f.key]}</span>
                    </div>
                    <input type="range" min={0} max={f.max} step={f.step} value={(form as any)[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: Number(e.target.value) })}
                      className="w-full mt-2 accent-primary" />
                  </div>
                ))}
                <Button className="w-full" onClick={handleAddMetrics} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Metrics
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {!athlete ? (
          <div className="text-center py-20">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">No athlete profile found.</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Matches Played", value: totalPlayed, color: "text-foreground" },
                { label: "Win Rate", value: `${winRate}%`, color: "text-stat-green" },
                { label: "Total Goals", value: totalGoals, color: "text-gold" },
                { label: "Avg Rating", value: avgRating, color: "text-primary" },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="bg-card rounded-xl p-4 border border-border shadow-card text-center">
                  <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Match Rating Trend */}
            {recentPerf.length > 1 && (
              <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Match Performance Trend
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={recentPerf}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="rating" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} name="Rating" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Win/Loss Pie + Goals Bar */}
            <div className="grid md:grid-cols-2 gap-4">
              {pieData.length > 0 && (
                <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                  <h2 className="font-display font-semibold text-foreground mb-4">Win / Loss Ratio</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {recentPerf.length > 0 && (
                <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                  <h2 className="font-display font-semibold text-foreground mb-4">Goals per Match</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={recentPerf}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      <Bar dataKey="goals" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Goals" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Performance Metrics Trend */}
            {metricsChartData.length > 1 && (
              <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary" /> Fitness Metrics Progression
                </h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={metricsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Legend />
                    {Object.entries(CHART_COLORS).map(([key, color]) => (
                      <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} name={key.charAt(0).toUpperCase() + key.slice(1)} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Latest Snapshot */}
            {latestMetrics ? (
              <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> Current Fitness Snapshot
                </h2>
                <div className="space-y-3">
                  {[
                    { label: "Speed", value: latestMetrics.speed, max: 100 },
                    { label: "Endurance", value: latestMetrics.endurance, max: 100 },
                    { label: "Strength", value: latestMetrics.strength, max: 100 },
                    { label: "Agility", value: latestMetrics.agility, max: 100 },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="font-semibold text-foreground">{m.value}</span>
                      </div>
                      <Progress value={Math.min((m.value / m.max) * 100, 100)} className="h-2" />
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                    <span className="text-xs text-muted-foreground">Training hours/week</span>
                    <Badge variant="secondary" className="font-display font-bold">{latestMetrics.training_hours_per_week}h</Badge>
                  </div>
                  {latestMetrics.reaction_time && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Reaction time</span>
                      <Badge variant="secondary" className="font-display font-bold">{latestMetrics.reaction_time}s</Badge>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl border border-border border-dashed">
                <Dumbbell className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <h3 className="font-display font-semibold text-foreground mb-1">Record Performance Metrics</h3>
                <p className="text-sm text-muted-foreground mb-4">Track your speed, endurance, and strength over time.</p>
                <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Record Metrics
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AthleteAnalytics;
