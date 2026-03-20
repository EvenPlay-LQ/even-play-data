import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Dumbbell, Zap, Plus, Loader2, TrendingUp
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { performanceMetricSchema } from "@/lib/validations";
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
  sprint_40m_s?: number;
  vo2_max?: number;
  bench_press_1rm_kg?: number;
  squat_1rm_kg?: number;
  illinois_agility_s?: number;
  vertical_jump_cm?: number;
  reaction_time?: number;
  training_hours_per_week?: number;
  recorded_at: string;
}

const defaultMetricForm: MetricForm = {
  sprint_40m_s: undefined,
  vo2_max: undefined,
  bench_press_1rm_kg: undefined,
  squat_1rm_kg: undefined,
  illinois_agility_s: undefined,
  vertical_jump_cm: undefined,
  reaction_time: 0.35,
  training_hours_per_week: 10,
  recorded_at: new Date().toISOString().split("T")[0],
};

const CHART_COLORS = {
  sprint_40m_s: "#F97316",
  vo2_max: "#3B82F6",
  bench_press_1rm_kg: "#A855F7",
  vertical_jump_cm: "#EC4899",
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
    
    // Validate with Zod
    const result = performanceMetricSchema.safeParse(form);
    if (!result.success) {
      toast({ 
        title: "Validation Error", 
        description: result.error.issues[0].message,
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    const { data, error } = await supabase.from("performance_metrics" as any)
      .insert([{ ...form, athlete_id: athlete.id }])
      .select().single();
    if (error) { 
      handleQueryError(error, "Unable to save your performance record. Please ensure your profile is complete and try again."); 
    }
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

  const metricsChartData = metrics.slice(-12).map((m) => ({
    date: new Date(m.recorded_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
    sprint_40m_s: m.sprint_40m_s,
    vo2_max: m.vo2_max,
    bench_press_1rm_kg: m.bench_press_1rm_kg,
    vertical_jump_cm: m.vertical_jump_cm,
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Record Industry-Standard Metrics</DialogTitle></DialogHeader>
              <TooltipProvider>
                <div className="space-y-6 pt-2">
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">General Info</Label>
                    <div className="mt-3">
                      <Label>Test Date</Label>
                      <Input type="date" className="mt-1" value={form.recorded_at} onChange={e => setForm({ ...form, recorded_at: e.target.value })} />
                      <p className="text-[10px] text-muted-foreground mt-1">Select the date these tests were performed.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Speed & Agility */}
                    <div className="space-y-4">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Speed & Agility</Label>
                      
                      <div className="bg-card p-4 rounded-xl border border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-1.5">
                            40m Sprint (s)
                            <Tooltip>
                              <TooltipTrigger><Info className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger>
                              <TooltipContent><p className="max-w-xs">Measures explosive speed and acceleration from a standing start.</p></TooltipContent>
                            </Tooltip>
                          </Label>
                        </div>
                        <Input type="number" step="0.01" placeholder="e.g. 4.85" value={form.sprint_40m_s || ""} onChange={e => setForm({ ...form, sprint_40m_s: Number(e.target.value) })} />
                        <p className="text-[10px] text-muted-foreground">Typical range: 4.5s - 6.5s.</p>
                      </div>

                      <div className="bg-card p-4 rounded-xl border border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-1.5">
                            Illinois Agility (s)
                            <Tooltip>
                              <TooltipTrigger><Info className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger>
                              <TooltipContent><p className="max-w-xs">Standardized test for change of direction speed and maneuverability.</p></TooltipContent>
                            </Tooltip>
                          </Label>
                        </div>
                        <Input type="number" step="0.01" placeholder="e.g. 15.20" value={form.illinois_agility_s || ""} onChange={e => setForm({ ...form, illinois_agility_s: Number(e.target.value) })} />
                        <p className="text-[10px] text-muted-foreground">Typical range: 14s - 20s.</p>
                      </div>
                    </div>

                    {/* Strength & Power */}
                    <div className="space-y-4">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Strength & Power</Label>
                      
                      <div className="bg-card p-4 rounded-xl border border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-1.5">
                            1RM Bench Press (kg)
                            <Tooltip>
                              <TooltipTrigger><Info className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger>
                              <TooltipContent><p className="max-w-xs">One-Rep Maximum: The maximum weight you can lift for a single repetition.</p></TooltipContent>
                            </Tooltip>
                          </Label>
                        </div>
                        <Input type="number" placeholder="e.g. 80" value={form.bench_press_1rm_kg || ""} onChange={e => setForm({ ...form, bench_press_1rm_kg: Number(e.target.value) })} />
                        <p className="text-[10px] text-muted-foreground">Enter your verified peak lift.</p>
                      </div>

                      <div className="bg-card p-4 rounded-xl border border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-1.5">
                            Vertical Jump (cm)
                            <Tooltip>
                              <TooltipTrigger><Info className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger>
                              <TooltipContent><p className="max-w-xs">Measures explosive lower body power and leaping ability.</p></TooltipContent>
                            </Tooltip>
                          </Label>
                        </div>
                        <Input type="number" placeholder="e.g. 65" value={form.vertical_jump_cm || ""} onChange={e => setForm({ ...form, vertical_jump_cm: Number(e.target.value) })} />
                        <p className="text-[10px] text-muted-foreground">Best jump out of 3 attempts.</p>
                      </div>
                    </div>

                    {/* Aerobic & Training */}
                    <div className="md:col-span-2 space-y-4">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aerobic & Training</Label>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-card p-4 rounded-xl border border-border space-y-3">
                          <Label className="flex items-center gap-1.5">
                            VO2 Max (ml/kg/min)
                            <Tooltip>
                              <TooltipTrigger><Info className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger>
                              <TooltipContent><p className="max-w-xs">Measures the maximum amount of oxygen you can utilize during intense exercise.</p></TooltipContent>
                            </Tooltip>
                          </Label>
                          <Input type="number" step="0.1" placeholder="e.g. 52.5" value={form.vo2_max || ""} onChange={e => setForm({ ...form, vo2_max: Number(e.target.value) })} />
                          <p className="text-[10px] text-muted-foreground">Professional athletes range 55 - 85.</p>
                        </div>

                        <div className="bg-card p-4 rounded-xl border border-border space-y-3">
                          <Label>Training Hours / Week</Label>
                          <Input type="number" step="0.5" placeholder="e.g. 12" value={form.training_hours_per_week || ""} onChange={e => setForm({ ...form, training_hours_per_week: Number(e.target.value) })} />
                          <p className="text-[10px] text-muted-foreground">Total structured training time.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full h-12 text-base font-bold shadow-elevated" onClick={handleAddMetrics} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                    Save Performance Record
                  </Button>
                </div>
              </TooltipProvider>
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
                    <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
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
                      <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
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
                      <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
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
                    <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Legend />
                    {Object.entries(CHART_COLORS).map(([key, color]) => (
                      <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} 
                        name={key.replace(/_/g, " ").replace(" s", "(s)").replace(" kg", "(kg)").toUpperCase()} />
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
                <div className="space-y-4">
                  {[
                    { label: "40m Sprint", value: latestMetrics.sprint_40m_s, unit: "s", max: 10, inverse: true },
                    { label: "VO2 Max", value: latestMetrics.vo2_max, unit: " ml/kg", max: 100 },
                    { label: "1RM Bench", value: latestMetrics.bench_press_1rm_kg, unit: "kg", max: 200 },
                    { label: "Vert Jump", value: latestMetrics.vertical_jump_cm, unit: "cm", max: 120 },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs mb-1.5 align-bottom">
                        <span className="text-muted-foreground font-medium">{m.label}</span>
                        <span className="font-display font-bold text-foreground">{m.value || "—"}<span className="text-[10px] ml-0.5 font-normal text-muted-foreground">{m.unit}</span></span>
                      </div>
                      <Progress value={m.value ? (m.inverse ? (1 - (m.value / m.max)) * 100 : (m.value / m.max) * 100) : 0} className="h-1.5" />
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
