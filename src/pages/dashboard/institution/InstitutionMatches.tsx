import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, X, Loader2, ClipboardList } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { handleQueryError } from "@/lib/queryHelpers";

interface Athlete { id: string; profiles?: { name: string }; sport: string; position: string | null; }
interface MatchReportForm { athlete_id: string; match_date: string; opponent: string; goals: number; assists: number; rating: number; notes: string; }
interface PerformanceTestForm { athlete_id: string; metric_name: string; value: number; unit: string; test_date: string; }

const InstitutionMatches = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState<any>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [matchReports, setMatchReports] = useState<any[]>([]);
  const [perfTests, setPerfTests] = useState<any[]>([]);
  const [tab, setTab] = useState<"matches" | "tests">("matches");
  const [saving, setSaving] = useState(false);

  const [matchForm, setMatchForm] = useState<MatchReportForm>({
    athlete_id: "", match_date: "", opponent: "", goals: 0, assists: 0, rating: 7, notes: ""
  });
  const [testForm, setTestForm] = useState<PerformanceTestForm>({
    athlete_id: "", metric_name: "", value: 0, unit: "", test_date: new Date().toISOString().split("T")[0]
  });
  const [matchOpen, setMatchOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data: inst } = await supabase.from("institutions").select("id").eq("profile_id", user.id).maybeSingle();
      if (inst) {
        setInstitution(inst);
        const { data: aths } = await supabase.from("athletes").select("id, sport, position, profiles(name)").eq("institution_id", inst.id);
        setAthletes((aths || []) as Athlete[]);

        const athleteIds = (aths || []).map((a: any) => a.id);
        if (athleteIds.length > 0) {
          const [reportsRes, testsRes] = await Promise.all([
            supabase.from("match_stats" as any).select("*, athletes(profiles(name))").in("athlete_id", athleteIds).order("created_at", { ascending: false }).limit(20),
            supabase.from("performance_tests" as any).select("*, athletes(profiles(name))").in("athlete_id", athleteIds).order("test_date", { ascending: false }).limit(20),
          ]);
          setMatchReports(reportsRes.data || []);
          setPerfTests(testsRes.data || []);
        }
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleAddMatchReport = async () => {
    if (!institution || !matchForm.athlete_id || !matchForm.match_date) return;
    setSaving(true);

    // Insert into match_stats directly (using existing schema)
    // First create a match record, then the stat
    const { data: matchData, error: matchErr } = await supabase.from("matches").insert([{
      home_team_id: institution.id,
      away_team_id: institution.id, // Simplified for MVP
      match_date: matchForm.match_date,
      competition: matchForm.opponent,
      status: "completed",
    }]).select().single();

    if (matchErr) { handleQueryError(matchErr, "Failed to create match."); setSaving(false); return; }

    const { data: statData, error: statErr } = await supabase.from("match_stats").insert([{
      athlete_id: matchForm.athlete_id,
      match_id: (matchData as any).id,
      goals: matchForm.goals,
      assists: matchForm.assists,
      rating: matchForm.rating,
      minutes_played: 90,
    }]).select("*, athletes(profiles(name))").single();

    if (statErr) { handleQueryError(statErr, "Failed to add match stats."); }
    else {
      setMatchReports([statData, ...matchReports]);
      setMatchForm({ athlete_id: "", match_date: "", opponent: "", goals: 0, assists: 0, rating: 7, notes: "" });
      setMatchOpen(false);
      toast({ title: "Match report added!" });
    }
    setSaving(false);
  };

  const handleAddPerfTest = async () => {
    if (!institution || !testForm.athlete_id || !testForm.metric_name) return;
    setSaving(true);
    const { data, error } = await supabase.from("performance_tests" as any).insert([{
      ...testForm,
      institution_id: institution.id,
    }]).select("*, athletes(profiles(name))").single();
    if (error) { handleQueryError(error, "Failed to add test."); }
    else {
      setPerfTests([data, ...perfTests]);
      setTestForm({ athlete_id: "", metric_name: "", value: 0, unit: "", test_date: new Date().toISOString().split("T")[0] });
      setTestOpen(false);
      toast({ title: "Performance test recorded!" });
    }
    setSaving(false);
  };

  if (loading) return <DashboardLayout role="institution"><div className="md:ml-16 space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div></DashboardLayout>;

  return (
    <DashboardLayout role="institution">
      <div className="md:ml-16 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Reports & Tests</h1>
            <p className="text-sm text-muted-foreground">Log match reports and add performance test results for your athletes.</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={matchOpen} onOpenChange={setMatchOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> Match Report</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Log Match Report</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Athlete</Label>
                    <select className="mt-1 w-full border border-border rounded-md p-2 bg-background text-foreground text-sm"
                      value={matchForm.athlete_id} onChange={e => setMatchForm({ ...matchForm, athlete_id: e.target.value })}>
                      <option value="">Select an athlete</option>
                      {athletes.map(a => <option key={a.id} value={a.id}>{(a.profiles as any)?.name || a.id} ({a.sport})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Match Date</Label>
                      <Input type="date" className="mt-1" value={matchForm.match_date} onChange={e => setMatchForm({ ...matchForm, match_date: e.target.value })} />
                    </div>
                    <div>
                      <Label>Opponent</Label>
                      <Input className="mt-1" placeholder="e.g. City FC" value={matchForm.opponent} onChange={e => setMatchForm({ ...matchForm, opponent: e.target.value })} />
                    </div>
                    <div>
                      <Label>Goals</Label>
                      <Input type="number" min="0" className="mt-1" value={matchForm.goals} onChange={e => setMatchForm({ ...matchForm, goals: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label>Assists</Label>
                      <Input type="number" min="0" className="mt-1" value={matchForm.assists} onChange={e => setMatchForm({ ...matchForm, assists: Number(e.target.value) })} />
                    </div>
                    <div className="col-span-2">
                      <Label>Rating (1–10)</Label>
                      <Input type="number" min="1" max="10" step="0.1" className="mt-1" value={matchForm.rating} onChange={e => setMatchForm({ ...matchForm, rating: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea className="mt-1 resize-none" rows={3} placeholder="Observations about the player's performance..." value={matchForm.notes} onChange={e => setMatchForm({ ...matchForm, notes: e.target.value })} />
                  </div>
                  <Button className="w-full" onClick={handleAddMatchReport} disabled={saving || !matchForm.athlete_id || !matchForm.match_date}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Match Report
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={testOpen} onOpenChange={setTestOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Performance Test</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Record Performance Test</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Athlete</Label>
                    <select className="mt-1 w-full border border-border rounded-md p-2 bg-background text-foreground text-sm"
                      value={testForm.athlete_id} onChange={e => setTestForm({ ...testForm, athlete_id: e.target.value })}>
                      <option value="">Select an athlete</option>
                      {athletes.map(a => <option key={a.id} value={a.id}>{(a.profiles as any)?.name || a.id} ({a.sport})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label>Metric Name</Label>
                      <Input className="mt-1" placeholder="e.g. 40m Sprint, Vertical Jump" value={testForm.metric_name} onChange={e => setTestForm({ ...testForm, metric_name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Value</Label>
                      <Input type="number" step="0.01" className="mt-1" value={testForm.value} onChange={e => setTestForm({ ...testForm, value: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Input className="mt-1" placeholder="e.g. sec, cm, kg" value={testForm.unit} onChange={e => setTestForm({ ...testForm, unit: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <Label>Test Date</Label>
                      <Input type="date" className="mt-1" value={testForm.test_date} onChange={e => setTestForm({ ...testForm, test_date: e.target.value })} />
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleAddPerfTest} disabled={saving || !testForm.athlete_id || !testForm.metric_name}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Test Result
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
          {(["matches", "tests"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "matches" ? "Match Reports" : "Performance Tests"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "matches" && (
            <motion.div key="matches" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
              {matchReports.length === 0 ? (
                <div className="text-center py-20">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">No match reports yet. Log one above.</p>
                </div>
              ) : matchReports.map((report, i) => (
                <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{(report.athletes as any)?.profiles?.name || "Athlete"}</div>
                    <div className="text-xs text-muted-foreground">{report.goals}G · {report.assists}A · {report.minutes_played}min</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-display font-bold text-foreground">{Number(report.rating).toFixed(1)}</div>
                    <div className="text-[10px] text-muted-foreground">Rating</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
          {tab === "tests" && (
            <motion.div key="tests" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
              {perfTests.length === 0 ? (
                <div className="text-center py-20">
                  <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">No performance tests yet. Add one above.</p>
                </div>
              ) : perfTests.map((test, i) => (
                <motion.div key={test.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{(test.athletes as any)?.profiles?.name || "Athlete"}</div>
                    <div className="text-xs text-muted-foreground">{test.metric_name} · {new Date(test.test_date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-display font-bold text-foreground">{test.value}</div>
                    <div className="text-[10px] text-muted-foreground">{test.unit}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default InstitutionMatches;
