import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Shield, Calendar, MapPin, Shirt, Star, Trash2, Edit, Search } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
const supabaseAny = supabase as any;
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { handleQueryError } from "@/lib/queryHelpers";
import { useNavigate } from "react-router-dom";

interface Team {
  id: string;
  team_name: string;
  sport: string;
  age_group?: string;
  skill_level?: string;
  season?: string;
  coach_name?: string;
  assistant_coach_name?: string;
  team_colors?: string[];
  home_venue?: string;
  created_at: string;
}

interface SquadMember {
  id: string;
  athlete_id: string;
  full_name: string;
  sport: string;
  position?: string;
  squad_role: string;
  jersey_number?: number;
  status: string;
  joined_date: string;
}

const InstitutionTeams = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [squadMembers, setSquadMembers] = useState<SquadMember[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [squadDialogOpen, setSquadDialogOpen] = useState(false);
  
  // Helper function to capitalize first letter
  const capitalize = (str?: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  // Create team form
  const [newTeam, setNewTeam] = useState({
    team_name: "",
    sport: "Football",
    age_group: "U16",
    skill_level: "intermediate",
    season: "year-round",
    home_venue: "",
  });
  
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;
    loadInstitutionAndTeams();
  }, [user]);

  const loadInstitutionAndTeams = async () => {
    setLoading(true);
    
    const { data: instData } = await supabase
      .from("institutions")
      .select("id")
      .eq("profile_id", user!.id)
      .maybeSingle();
    
    if (instData) {
      setInstitution(instData);
      
      const { data: teamData } = await supabase
        .from("teams")
        .select("*")
        .eq("institution_id", instData.id)
        .order("created_at", { ascending: false });
      
      if (teamData) {
        setTeams(teamData as Team[]);
      }
    }
    
    setLoading(false);
  };

  const handleCreateTeam = async () => {
    if (!institution || !newTeam.team_name.trim()) return;
    
    setSaving(true);
    try {
      const { error } = await supabase.from("teams").insert({
        institution_id: institution.id,
        team_name: newTeam.team_name.trim(),
        sport: newTeam.sport,
        age_group: newTeam.age_group || null,
        skill_level: newTeam.skill_level || null,
        season: newTeam.season || null,
        home_venue: newTeam.home_venue || null,
      });
      
      if (error) throw error;
      
      toast({ title: "Team created!", description: `${newTeam.team_name} has been added.` });
      
      setNewTeam({
        team_name: "",
        sport: "Football",
        age_group: "U16",
        skill_level: "intermediate",
        season: "year-round",
        home_venue: "",
      });
      setCreateDialogOpen(false);
      loadInstitutionAndTeams();
      
    } catch (error: any) {
      handleQueryError(error, "Failed to create team.");
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSquad = async (team: Team) => {
    setSelectedTeam(team);
    setSquadDialogOpen(true);
    
    const { data: roster } = await supabaseAny.rpc("get_team_roster", { team_id_param: team.id });
    
    if (roster) {
      setSquadMembers(roster as unknown as unknown as SquadMember[]);
    }
  };

  const handleAddToSquad = async (athleteId: string, role: string = 'player') => {
    if (!selectedTeam) return;
    
    const { error } = await supabaseAny.from("team_squads").insert({
      team_id: selectedTeam.id,
      athlete_id: athleteId,
      squad_role: role,
      joined_date: new Date().toISOString(),
      status: 'active',
    });
    
    if (error) {
      handleQueryError(error, "Failed to add athlete to squad.");
    } else {
      toast({ title: "Athlete added to squad!" });
      handleLoadSquad(selectedTeam);
    }
  };

  const handleRemoveFromSquad = async (athleteId: string) => {
    if (!selectedTeam) return;
    
    const { error } = await (supabase as any)
      .from("team_squads")
      .delete()
      .eq("team_id", selectedTeam.id)
      .eq("athlete_id", athleteId);
    
    if (error) {
      handleQueryError(error, "Failed to remove athlete.");
    } else {
      toast({ title: "Athlete removed from squad" });
      handleLoadSquad(selectedTeam);
    }
  };

  const getAgeGroupColor = (ageGroup?: string) => {
    if (!ageGroup) return "bg-slate-500/10 text-slate-600";
    if (ageGroup.startsWith("U")) return "bg-blue-500/10 text-blue-600";
    if (ageGroup === "Senior") return "bg-purple-500/10 text-purple-600";
    return "bg-green-500/10 text-green-600";
  };

  const getSkillLevelIcon = (level?: string) => {
    switch (level) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🌿';
      case 'advanced': return '🌳';
      case 'elite': return '⭐';
      case 'academy': return '🎓';
      default: return '🏆';
    }
  };

  const filteredSquad = squadMembers.filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-2xl font-display font-bold text-foreground">Teams Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Organize athletes into squads by age group and skill level
            </p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Team Name *</Label>
                  <Input
                    placeholder="e.g., Thunderbirds U16"
                    value={newTeam.team_name}
                    onChange={(e) => setNewTeam({ ...newTeam, team_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Sport</Label>
                  <Select value={newTeam.sport} onValueChange={(val) => setNewTeam({ ...newTeam, sport: val })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Football">Football</SelectItem>
                      <SelectItem value="Basketball">Basketball</SelectItem>
                      <SelectItem value="Rugby">Rugby</SelectItem>
                      <SelectItem value="Netball">Netball</SelectItem>
                      <SelectItem value="Cricket">Cricket</SelectItem>
                      <SelectItem value="Athletics">Athletics</SelectItem>
                      <SelectItem value="Swimming">Swimming</SelectItem>
                      <SelectItem value="Tennis">Tennis</SelectItem>
                      <SelectItem value="Volleyball">Volleyball</SelectItem>
                      <SelectItem value="Hockey">Hockey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Age Group</Label>
                    <Select value={newTeam.age_group} onValueChange={(val) => setNewTeam({ ...newTeam, age_group: val })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="U8">U8</SelectItem>
                        <SelectItem value="U10">U10</SelectItem>
                        <SelectItem value="U12">U12</SelectItem>
                        <SelectItem value="U14">U14</SelectItem>
                        <SelectItem value="U16">U16</SelectItem>
                        <SelectItem value="U18">U18</SelectItem>
                        <SelectItem value="U21">U21</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Skill Level</Label>
                    <Select value={newTeam.skill_level} onValueChange={(val) => setNewTeam({ ...newTeam, skill_level: val })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                        <SelectItem value="academy">Academy</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>Season</Label>
                  <Select value={newTeam.season} onValueChange={(val) => setNewTeam({ ...newTeam, season: val })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fall">Fall</SelectItem>
                      <SelectItem value="winter">Winter</SelectItem>
                      <SelectItem value="spring">Spring</SelectItem>
                      <SelectItem value="summer">Summer</SelectItem>
                      <SelectItem value="year-round">Year-Round</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Home Venue</Label>
                  <Input
                    placeholder="e.g., Main Field, Gym A"
                    value={newTeam.home_venue}
                    onChange={(e) => setNewTeam({ ...newTeam, home_venue: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleCreateTeam}
                  disabled={saving || !newTeam.team_name.trim()}
                >
                  {saving ? "Creating..." : "Create Team"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Teams Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-display font-semibold text-foreground mb-1">No teams yet</h3>
              <p className="text-sm text-muted-foreground">Create your first team to get started.</p>
            </div>
          ) : (
            teams.map((team, i) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-lg text-foreground">{team.team_name}</h3>
                    <p className="text-sm text-muted-foreground">{team.sport}</p>
                  </div>
                  <Badge className={getAgeGroupColor(team.age_group)}>
                    {team.age_group || "Open"}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>{getSkillLevelIcon(team.skill_level)} {capitalize(team.skill_level) || "All Levels"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{capitalize(team.season) || "Year-Round"}</span>
                  </div>
                  {team.home_venue && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{team.home_venue}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleLoadSquad(team)}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    View Squad
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/institution/matches?team=${team.id}`)}
                  >
                    <Calendar className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Squad Management Dialog */}
        <Dialog open={squadDialogOpen} onOpenChange={setSquadDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {selectedTeam?.team_name} - Squad Management
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto mt-4 space-y-4">
              {/* Add Athlete Section */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Add Athlete to Squad</h4>
                <AddAthleteToSquad onAdd={handleAddToSquad} institutionId={institution?.id} currentSquad={squadMembers.map(s => s.athlete_id)} />
              </div>
              
              {/* Squad List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Current Squad ({squadMembers.length})</h4>
                  <Input
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                
                <div className="space-y-2">
                  {filteredSquad.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="font-display font-semibold text-sm text-primary">
                            {member.full_name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{member.full_name}</p>
                            {member.squad_role === 'captain' && (
                              <Badge variant="default" className="text-xs">C</Badge>
                            )}
                            {member.squad_role === 'vice_captain' && (
                              <Badge variant="secondary" className="text-xs">VC</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {member.position || member.sport} · Jersey #{member.jersey_number || 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {member.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveFromSquad(member.athlete_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

// Sub-component for adding athletes to squad
const AddAthleteToSquad = ({ 
  onAdd, 
  institutionId, 
  currentSquad 
}: { 
  onAdd: (athleteId: string, role: string) => void;
  institutionId?: string;
  currentSquad: string[];
}) => {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState("");
  const [role, setRole] = useState("player");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (institutionId) {
      loadAvailableAthletes();
    }
  }, [institutionId]);

  const loadAvailableAthletes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("athletes")
      .select("*")
      .eq("institution_id", institutionId!)
      .not("id", "in", `(${currentSquad.join(',')})`)
      .order("full_name");
    
    if (data) setAthletes(data);
    setLoading(false);
  };

  const handleAdd = () => {
    if (selectedAthlete) {
      onAdd(selectedAthlete, role);
      setSelectedAthlete("");
      setRole("player");
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <Label>Athlete</Label>
        <Select value={selectedAthlete} onValueChange={setSelectedAthlete}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select athlete..." />
          </SelectTrigger>
          <SelectContent>
            {athletes.map(athlete => (
              <SelectItem key={athlete.id} value={athlete.id}>
                {athlete.full_name} - {athlete.sport}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-40">
        <Label>Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="player">Player</SelectItem>
            <SelectItem value="captain">Captain</SelectItem>
            <SelectItem value="vice_captain">Vice-Captain</SelectItem>
            <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button onClick={handleAdd} disabled={!selectedAthlete || loading}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default InstitutionTeams;
