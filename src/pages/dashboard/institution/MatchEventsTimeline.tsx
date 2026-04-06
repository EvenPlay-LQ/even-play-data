import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, Goal, User, AlertCircle, ArrowRightLeft, 
  Activity, TrendingUp, Video, Plus, Trash2, Search 
} from "lucide-react";
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
const supabaseAny = supabase as any;
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { handleQueryError } from "@/lib/queryHelpers";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Team {
  id: string;
  team_name: string;
}

interface MatchEvent {
  id: string;
  match_id: string;
  athlete_id?: string;
  team_id?: string;
  event_type: string;
  minute: number;
  extra_minute?: number;
  description?: string;
  player_name?: string;
  team_side: 'home' | 'away';
}

interface MatchFixture {
  id: string;
  home_team_id: string;
  away_team_id: string;
  kickoff_time: string;
  status: string;
  home_score?: number;
  away_score?: number;
  home_team?: Team;
  away_team?: Team;
}

const MatchEventsTimeline = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [match, setMatch] = useState<MatchFixture | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Event form state
  const [newEvent, setNewEvent] = useState({
    event_type: "goal",
    minute: "1",
    extra_minute: "",
    team_side: "home" as 'home' | 'away',
    athlete_id: "",
    player_name: "",
    description: "",
  });
  
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all"); // all, goals, cards, substitutions

  useEffect(() => {
    if (!user) return;
    
    const matchId = searchParams.get('match');
    if (matchId) {
      setSelectedMatch(matchId);
    }
    
    loadInstitutionData();
  }, [user, searchParams]);

  useEffect(() => {
    if (selectedMatch) {
      loadMatchEvents(selectedMatch);
    }
  }, [selectedMatch]);

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
        
        // Load recent matches if no match selected
        if (!selectedMatch) {
          const teamIds = teamData.map(t => t.id);
          const { data: matchData } = await (supabase as any)
            .from("match_fixtures")
            .select(`
              *,
              home_team:home_team_id(team_name),
              away_team:away_team_id(team_name)
            `)
            .or(`home_team_id.in.(${teamIds.join(',')}),away_team_id.in.(${teamIds.join(',')})`)
            .order("kickoff_time", { ascending: false })
            .limit(10);
          
          if (matchData && matchData.length > 0) {
            setSelectedMatch(matchData[0].id);
          }
        }
      }
    }
    
    setLoading(false);
  };

  const loadMatchEvents = async (matchId: string) => {
    // Load match details
    const { data: matchData } = await (supabase as any)
      .from("match_fixtures")
      .select(`
        *,
        home_team:home_team_id(team_name),
        away_team:away_team_id(team_name)
      `)
      .eq("id", matchId)
      .single();
    
    if (matchData) {
      setMatch(matchData as unknown as MatchFixture);
    }
    
    // Load events
    const { data: eventData } = await (supabase as any)
      .from("match_events")
      .select("*")
      .eq("match_id", matchId)
      .order("minute", { ascending: true });
    
    if (eventData) {
      setEvents(eventData as unknown as MatchEvent[]);
    }
  };

  const handleAddEvent = async () => {
    if (!selectedMatch || !newEvent.minute) return;
    
    setSaving(true);
    try {
      const { error } = await supabaseAny.from("match_events").insert({
        match_id: selectedMatch,
        event_type: newEvent.event_type,
        minute: parseInt(newEvent.minute),
        extra_minute: newEvent.extra_minute ? parseInt(newEvent.extra_minute) : null,
        team_side: newEvent.team_side,
        athlete_id: newEvent.athlete_id || null,
        player_name: newEvent.player_name || null,
        description: newEvent.description || null,
      });
      
      if (error) throw error;
      
      toast({ title: "Event added!", description: "Match timeline updated." });
      
      setNewEvent({
        event_type: "goal",
        minute: "1",
        extra_minute: "",
        team_side: "home",
        athlete_id: "",
        player_name: "",
        description: "",
      });
      setCreateDialogOpen(false);
      loadMatchEvents(selectedMatch);
      
    } catch (error: any) {
      handleQueryError(error, "Failed to add event.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Delete this event?")) return;
    
    const { error } = await supabaseAny.from("match_events").delete().eq("id", eventId);
    
    if (error) {
      handleQueryError(error, "Failed to delete event.");
    } else {
      toast({ title: "Event deleted" });
      if (selectedMatch) loadMatchEvents(selectedMatch);
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'goal': return <Goal className="h-4 w-4 text-green-600" />;
      case 'own_goal': return <Activity className="h-4 w-4 text-red-600" />;
      case 'assist': return <User className="h-4 w-4 text-blue-600" />;
      case 'yellow_card': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'second_yellow': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'red_card': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'substitution_on': return <ArrowRightLeft className="h-4 w-4 text-green-600" />;
      case 'substitution_off': return <ArrowRightLeft className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'goal': return 'Goal';
      case 'own_goal': return 'Own Goal';
      case 'assist': return 'Assist';
      case 'yellow_card': return 'Yellow Card';
      case 'second_yellow': return 'Second Yellow';
      case 'red_card': return 'Red Card';
      case 'substitution_on': return 'Substitution On';
      case 'substitution_off': return 'Substitution Off';
      default: return type.replace(/_/g, ' ').toUpperCase();
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === "goals") return ['goal', 'own_goal'].includes(event.event_type);
    if (filter === "cards") return ['yellow_card', 'second_yellow', 'red_card'].includes(event.event_type);
    if (filter === "substitutions") return ['substitution_on', 'substitution_off'].includes(event.event_type);
    return true;
  });

  const getTeamName = (teamSide: string) => {
    if (!match) return teamSide;
    return teamSide === 'home' ? match.home_team?.team_name : match.away_team?.team_name;
  };

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
            <h1 className="text-2xl font-display font-bold text-foreground">Match Events Timeline</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track goals, cards, and substitutions in real-time
            </p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedMatch}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Match Event</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Event Type *</Label>
                  <Select value={newEvent.event_type} onValueChange={(val) => setNewEvent({ ...newEvent, event_type: val })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goal">Goal</SelectItem>
                      <SelectItem value="assist">Assist</SelectItem>
                      <SelectItem value="own_goal">Own Goal</SelectItem>
                      <SelectItem value="yellow_card">Yellow Card</SelectItem>
                      <SelectItem value="second_yellow">Second Yellow</SelectItem>
                      <SelectItem value="red_card">Red Card</SelectItem>
                      <SelectItem value="substitution_on">Substitution On</SelectItem>
                      <SelectItem value="substitution_off">Substitution Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Minute *</Label>
                    <Input
                      type="number"
                      min="1"
                      max="90"
                      value={newEvent.minute}
                      onChange={(e) => setNewEvent({ ...newEvent, minute: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Extra Time (optional)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="15"
                      value={newEvent.extra_minute}
                      onChange={(e) => setNewEvent({ ...newEvent, extra_minute: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Team Side *</Label>
                  <Select value={newEvent.team_side} onValueChange={(val) => setNewEvent({ ...newEvent, team_side: val as 'home' | 'away' })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home Team ({match?.home_team?.team_name || 'Home'})</SelectItem>
                      <SelectItem value="away">Away Team ({match?.away_team?.team_name || 'Away'})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Player Name</Label>
                  <Input
                    placeholder="e.g., John Doe"
                    value={newEvent.player_name}
                    onChange={(e) => setNewEvent({ ...newEvent, player_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    placeholder="Additional details..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    rows={3}
                    className="mt-1 resize-none"
                  />
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleAddEvent}
                  disabled={saving || !newEvent.minute}
                >
                  {saving ? "Adding..." : "Add Event"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Match Selector */}
        <div className="bg-card rounded-xl border border-border p-4">
          <Label>Select Match</Label>
          <Select value={selectedMatch} onValueChange={setSelectedMatch}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose a match..." />
            </SelectTrigger>
            <SelectContent>
              {teams.flatMap(team => (
                <optgroup key={team.id} label={team.team_name}>
                  {/* In production, load actual matches for each team */}
                  <option value={team.id}>{team.team_name} - Recent Matches</option>
                </optgroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Score Display */}
        {match && (
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl border border-primary/30 p-6">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <h3 className="font-display font-bold text-xl">{match.home_team?.team_name || "Home"}</h3>
                <div className="text-5xl font-display font-bold mt-2">{match.home_score ?? 0}</div>
              </div>
              <div className="text-2xl font-bold text-muted-foreground px-8">vs</div>
              <div className="text-center flex-1">
                <h3 className="font-display font-bold text-xl">{match.away_team?.team_name || "Away"}</h3>
                <div className="text-5xl font-display font-bold mt-2">{match.away_score ?? 0}</div>
              </div>
            </div>
            <div className="text-center mt-4">
              <Badge variant={match.status === 'live' ? 'destructive' : 'secondary'}>
                {match.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All Events ({events.length})
          </Button>
          <Button
            variant={filter === "goals" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("goals")}
          >
            <Goal className="h-3 w-3 mr-1" />
            Goals ({events.filter(e => ['goal', 'own_goal'].includes(e.event_type)).length})
          </Button>
          <Button
            variant={filter === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("cards")}
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Cards ({events.filter(e => ['yellow_card', 'red_card', 'second_yellow'].includes(e.event_type)).length})
          </Button>
          <Button
            variant={filter === "substitutions" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("substitutions")}
          >
            <ArrowRightLeft className="h-3 w-3 mr-1" />
            Subs ({events.filter(e => ['substitution_on', 'substitution_off'].includes(e.event_type)).length})
          </Button>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-20">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-display font-semibold text-foreground mb-1">No events yet</h3>
              <p className="text-sm text-muted-foreground">Start tracking match events by adding your first event.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
              
              <AnimatePresence>
                {filteredEvents.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative pl-20 py-3"
                  >
                    {/* Timeline dot */}
                    <div className={`absolute left-6 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center ${
                      event.event_type.includes('goal') ? 'bg-green-500' :
                      event.event_type.includes('card') ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}>
                      {getEventTypeIcon(event.event_type)}
                    </div>
                    
                    <div className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {event.minute}'{event.extra_minute ? `+${event.extra_minute}` : ''}
                            </Badge>
                            <span className="font-semibold text-sm">{getEventTypeLabel(event.event_type)}</span>
                          </div>
                          {event.player_name && (
                            <p className="text-sm text-foreground mb-1">
                              <strong>{event.player_name}</strong>
                            </p>
                          )}
                          {event.description && (
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {getTeamName(event.team_side)}
                          </p>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MatchEventsTimeline;
