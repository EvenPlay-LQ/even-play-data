import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, CheckCircle, XCircle, Clock, AlertCircle, Trophy } from "lucide-react";
import { format } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
const supabaseAny = supabase as any;
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { handleQueryError } from "@/lib/queryHelpers";

interface Athlete {
  id: string;
  full_name: string;
  sport: string;
  position: string;
  profiles?: { name: string; avatar?: string };
}

interface AttendanceSession {
  id: string;
  session_type: string;
  session_date: string;
  duration_minutes?: number;
  location?: string;
  coach_notes?: string;
}

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

const AttendanceTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [institution, setInstitution] = useState<any>(null);
  
  // Session creation state
  const [sessionDate, setSessionDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [sessionType, setSessionType] = useState("training");
  const [duration, setDuration] = useState("90");
  const [location, setLocation] = useState("");
  const [coachNotes, setCoachNotes] = useState("");
  
  // Attendance marking state
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);
  
  // Session history
  const [sessions, setSessions] = useState<any[]>([]);
  const [viewHistory, setViewHistory] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadInstitutionAndAthletes();
  }, [user]);

  const loadInstitutionAndAthletes = async () => {
    setLoading(true);
    
    // Load institution
    const { data: instData } = await supabase
      .from("institutions")
      .select("id")
      .eq("profile_id", user!.id)
      .maybeSingle();
    
    if (instData) {
      setInstitution(instData);
      
      // Load athletes
      const { data: athleteData } = await supabase
        .from("athletes")
        .select(`
          id,
          full_name,
          sport,
          position,
          profiles(name, avatar)
        `)
        .eq("institution_id", instData.id)
        .order("full_name", { ascending: true });
      
      if (athleteData) {
        setAthletes(athleteData);
        
        // Initialize all as present by default
        const initialAttendance: Record<string, AttendanceStatus> = {};
        athleteData.forEach(a => {
          initialAttendance[a.id] = 'present';
        });
        setAttendance(initialAttendance);
      }
      
      // Load recent sessions
      const { data: sessionData } = await supabase
        .from("attendance_sessions")
        .select("*")
        .eq("institution_id", instData.id)
        .order("session_date", { ascending: false })
        .limit(10);
      
      if (sessionData) {
        setSessions(sessionData);
      }
    }
    
    setLoading(false);
  };

  const handleMarkAttendance = (athleteId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [athleteId]: status }));
  };

  const handleSubmitAttendance = async () => {
    if (!institution || athletes.length === 0) return;
    
    setSaving(true);
    try {
      // Create session
      const { data: session, error: sessionError } = await supabase
        .from("attendance_sessions")
        .insert({
          institution_id: institution.id,
          session_type: sessionType,
          session_date: new Date(sessionDate).toISOString(),
          duration_minutes: parseInt(duration),
          location: location || null,
          coach_notes: coachNotes || null,
          created_by: user!.id,
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;
      
      // Create attendance records
      const records = athletes.map(athlete => ({
        session_id: session!.id,
        athlete_id: athlete.id,
        status: attendance[athlete.id] || 'absent',
      }));
      
      const { error: recordsError } = await supabase
        .from("attendance_records")
        .insert(records);
      
      if (recordsError) throw recordsError;
      
      toast({
        title: "Attendance recorded!",
        description: `Successfully marked ${athletes.length} athletes.`,
      });
      
      // Reset form
      setAttendance({});
      setTimeout(() => {
        athletes.forEach(a => {
          setAttendance(prev => ({ ...prev, [a.id]: 'present' }));
        });
      }, 100);
      
      // Reload sessions
      loadInstitutionAndAthletes();
      
    } catch (error: any) {
      handleQueryError(error, "Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const allAttendance: Record<string, AttendanceStatus> = {};
    athletes.forEach(a => {
      allAttendance[a.id] = status;
    });
    setAttendance(allAttendance);
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'absent': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'late': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'excused': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4" />;
      case 'absent': return <XCircle className="h-4 w-4" />;
      case 'late': return <Clock className="h-4 w-4" />;
      case 'excused': return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="institution">
        <div className="md:ml-16 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
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
            <h1 className="text-2xl font-display font-bold text-foreground">Attendance Tracker</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track athlete participation in training, matches, and team activities
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setViewHistory(!viewHistory)}
          >
            {viewHistory ? "New Session" : "View History"}
          </Button>
        </div>

        {viewHistory ? (
          /* Session History View */
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display font-semibold mb-4">Recent Sessions</h2>
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No sessions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map(session => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        session.session_type === 'training' ? 'bg-blue-500/10 text-blue-600' :
                        session.session_type === 'match' ? 'bg-green-500/10 text-green-600' :
                        'bg-purple-500/10 text-purple-600'
                      }`}>
                        {session.session_type === 'training' && <Users className="h-6 w-6" />}
                        {session.session_type === 'match' && <Trophy className="h-6 w-6" />}
                        {['meeting', 'assessment'].includes(session.session_type) && <Calendar className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="font-semibold capitalize">{session.session_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(session.session_date), "MMM dd, yyyy • hh:mm a")}
                          {session.duration_minutes && ` • ${session.duration_minutes} min`}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* New Session Form */
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Session Setup */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-display font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Session Details
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Session Type *</Label>
                  <Select value={sessionType} onValueChange={setSessionType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="training">Training Session</SelectItem>
                      <SelectItem value="match">Match</SelectItem>
                      <SelectItem value="meeting">Team Meeting</SelectItem>
                      <SelectItem value="assessment">Fitness Assessment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label>Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Location</Label>
                <Input
                  placeholder="e.g., Main Field, Gym A"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Coach Notes</Label>
                <Textarea
                  placeholder="Session objectives, focus areas..."
                  value={coachNotes}
                  onChange={(e) => setCoachNotes(e.target.value)}
                  rows={4}
                  className="mt-1 resize-none"
                />
              </div>
            </div>

            {/* Attendance Marking */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Mark Attendance
                </h2>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAll('present')}
                  >
                    All Present
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAll('absent')}
                  >
                    All Absent
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {athletes.map(athlete => (
                  <div
                    key={athlete.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-display font-semibold text-sm text-primary">
                          {(athlete.profiles?.name || athlete.full_name || "?").charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {athlete.profiles?.name || athlete.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {athlete.sport} · {athlete.position}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {(['present', 'late', 'excused', 'absent'] as const).map(status => (
                        <Button
                          key={status}
                          variant={attendance[athlete.id] === status ? "default" : "outline"}
                          size="sm"
                          className={attendance[athlete.id] === status ? getStatusColor(status) : ""}
                          onClick={() => handleMarkAttendance(athlete.id, status)}
                          title={status.charAt(0).toUpperCase() + status.slice(1)}
                        >
                          {getStatusIcon(status)}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                className="w-full"
                onClick={handleSubmitAttendance}
                disabled={saving || athletes.length === 0}
              >
                {saving ? "Saving..." : `Submit Attendance (${athletes.length} Athletes)`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AttendanceTracker;
