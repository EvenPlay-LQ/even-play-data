import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users, Plus, Trash2, Edit, Search, Trophy } from "lucide-react";
import { format } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { handleQueryError } from "@/lib/queryHelpers";

interface Team {
  id: string;
  team_name: string;
  sport: string;
}

interface Competition {
  id: string;
  competition_name: string;
  competition_type: string;
}

interface MatchFixture {
  id: string;
  home_team_id: string;
  away_team_id: string;
  kickoff_time: string;
  status: string;
  home_score?: number;
  away_score?: number;
  venue_name?: string;
  competition?: any;
  home_team?: Team;
  away_team?: Team;
}

const FixtureScheduler = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [fixtures, setFixtures] = useState<MatchFixture[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Form state
  const [newFixture, setNewFixture] = useState({
    home_team_id: "",
    away_team_id: "",
    competition_id: "",
    kickoff_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    venue_name: "",
  });
  
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all"); // all, upcoming, completed

  useEffect(() => {
    if (!user) return;
    loadInstitutionData();
  }, [user]);

  const loadInstitutionData = async () => {
    setLoading(true);
    
    const { data: instData } = await supabase
      .from("institutions")
      .select("id")
      .eq("profile_id", user!.id)
      .maybeSingle();
    
    if (instData) {
      setInstitution(instData);
      
      // Load teams
      const { data: teamData } = await supabase
        .from("teams")
        .select("*")
        .eq("institution_id", instData.id)
        .order("team_name");
      
      if (teamData) {
        setTeams(teamData as Team[]);
      }
      
      // Load competitions
      const { data: compData } = await supabase
        .from("competitions")
        .select("*")
        .eq("institution_id", instData.id)
        .order("competition_name");
      
      if (compData) {
        setCompetitions(compData as Competition[]);
      }
      
      // Load fixtures
      await loadFixtures(instData.id);
    }
    
    setLoading(false);
  };

  const loadFixtures = async (institutionId: string) => {
    const { data } = await supabase
      .from("match_fixtures")
      .select(`
        *,
        competitions(*),
        home_team:home_team_id(team_name, sport),
        away_team:away_team_id(team_name, sport)
      `)
      .or(`home_team.institution_id.eq.${institutionId},away_team.institution_id.eq.${institutionId}`)
      .order("kickoff_time", { ascending: true });
    
    if (data) {
      setFixtures(data as unknown as MatchFixture[]);
    }
  };

  const handleCreateFixture = async () => {
    if (!institution || !newFixture.home_team_id || !newFixture.away_team_id) return;
    
    if (newFixture.home_team_id === newFixture.away_team_id) {
      toast({ title: "Error", description: "A team cannot play against itself.", variant: "destructive" });
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase.from("match_fixtures").insert({
        home_team_id: newFixture.home_team_id,
        away_team_id: newFixture.away_team_id,
        competition_id: newFixture.competition_id || null,
        kickoff_time: new Date(newFixture.kickoff_time).toISOString(),
        venue_name: newFixture.venue_name || null,
        created_by: user!.id,
      });
      
      if (error) throw error;
      
      toast({ title: "Fixture created!", description: "Match has been scheduled." });
      
      setNewFixture({
        home_team_id: "",
        away_team_id: "",
        competition_id: "",
        kickoff_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        venue_name: "",
      });
      setCreateDialogOpen(false);
      loadFixtures(institution!.id);
      
    } catch (error: any) {
      handleQueryError(error, "Failed to create fixture.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFixture = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fixture?")) return;
    
    const { error } = await supabase.from("match_fixtures").delete().eq("id", id);
    
    if (error) {
      handleQueryError(error, "Failed to delete fixture.");
    } else {
      toast({ title: "Fixture deleted" });
      if (institution) loadFixtures(institution.id);
    }
  };

  const handleUpdateScore = async (match: MatchFixture, homeScore: number, awayScore: number) => {
    const { error } = await supabase
      .from("match_fixtures")
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: 'completed',
      })
      .eq("id", match.id);
    
    if (error) {
      handleQueryError(error, "Failed to update score.");
    } else {
      toast({ title: "Score updated!" });
      if (institution) loadFixtures(institution.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return <Badge variant="outline">Scheduled</Badge>;
      case 'live': return <Badge className="bg-red-500/10 text-red-600 animate-pulse">Live</Badge>;
      case 'completed': return <Badge variant="secondary">Completed</Badge>;
      case 'postponed': return <Badge className="bg-amber-500/10 text-amber-600">Postponed</Badge>;
      case 'cancelled': return <Badge className="bg-slate-500/10 text-slate-600">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredFixtures = fixtures.filter(match => {
    if (filter === "upcoming") return ['scheduled', 'live'].includes(match.status);
    if (filter === "completed") return match.status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <DashboardLayout role="institution">
        <div className="md:ml-16 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="institution">
      <div className="md:ml-16 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Match Fixtures</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Schedule and manage matches for your teams
            </p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Match
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Match</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Home Team *</Label>
                    <Select 
                      value={newFixture.home_team_id} 
                      onValueChange={(val) => setNewFixture({ ...newFixture, home_team_id: val })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.team_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Away Team *</Label>
                    <Select 
                      value={newFixture.away_team_id} 
                      onValueChange={(val) => setNewFixture({ ...newFixture, away_team_id: val })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.team_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>Competition (Optional)</Label>
                  <Select 
                    value={newFixture.competition_id} 
                    onValueChange={(val) => setNewFixture({ ...newFixture, competition_id: val })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Competition</SelectItem>
                      {competitions.map(comp => (
                        <SelectItem key={comp.id} value={comp.id}>
                          {comp.competition_name} ({comp.competition_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Kickoff Time *</Label>
                  <Input
                    type="datetime-local"
                    value={newFixture.kickoff_time}
                    onChange={(e) => setNewFixture({ ...newFixture, kickoff_time: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Venue</Label>
                  <Input
                    placeholder="e.g., Main Field"
                    value={newFixture.venue_name}
                    onChange={(e) => setNewFixture({ ...newFixture, venue_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleCreateFixture}
                  disabled={saving || !newFixture.home_team_id || !newFixture.away_team_id}
                >
                  {saving ? "Scheduling..." : "Schedule Match"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All Matches
          </Button>
          <Button
            variant={filter === "upcoming" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("upcoming")}
          >
            Upcoming
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
          >
            Completed
          </Button>
        </div>

        {/* Fixtures List */}
        <div className="space-y-3">
          {filteredFixtures.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-display font-semibold text-foreground mb-1">No matches found</h3>
              <p className="text-sm text-muted-foreground">Schedule your first match above.</p>
            </div>
          ) : (
            filteredFixtures.map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl border border-border p-5 shadow-card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold text-lg">
                          {match.home_team?.team_name || "Home Team"}
                          {" vs "}
                          {match.away_team?.team_name || "Away Team"}
                        </h3>
                        {getStatusBadge(match.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(match.kickoff_time), "MMM dd, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(match.kickoff_time), "hh:mm a")}
                        </span>
                        {match.venue_name && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {match.venue_name}
                          </span>
                        )}
                        {match.competition && (
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {match.competition.competition_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteFixture(match.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {match.status === 'completed' && (
                  <div className="bg-muted/50 rounded-lg p-4 mt-3">
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <div className="text-3xl font-display font-bold text-foreground">
                          {match.home_score ?? '-'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Home</div>
                      </div>
                      <div className="text-2xl font-bold text-muted-foreground px-4">-</div>
                      <div className="text-center flex-1">
                        <div className="text-3xl font-display font-bold text-foreground">
                          {match.away_score ?? '-'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Away</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {match.status === 'scheduled' && (
                  <div className="flex gap-2 mt-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          Update Score
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Match Score</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <div>
                            <Label>Home Score</Label>
                            <Input
                              type="number"
                              defaultValue={match.home_score || 0}
                              id="home-score"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Away Score</Label>
                            <Input
                              type="number"
                              defaultValue={match.away_score || 0}
                              id="away-score"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <Button
                          className="w-full mt-4"
                          onClick={() => {
                            const homeScore = parseInt((document.getElementById('home-score') as HTMLInputElement).value);
                            const awayScore = parseInt((document.getElementById('away-score') as HTMLInputElement).value);
                            handleUpdateScore(match, homeScore, awayScore);
                          }}
                        >
                          Update Score & Complete Match
                        </Button>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to match details page (to be implemented)
                        toast({ title: "Feature coming soon", description: "Match events tracking" });
                      }}
                    >
                      Track Events
                    </Button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FixtureScheduler;
