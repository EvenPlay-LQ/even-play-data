import { useEffect, useState } from "react";
import { User, Save, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SPORT_OPTIONS } from "@/config/constants";
import { handleQueryError } from "@/lib/queryHelpers";

const AthleteProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [athlete, setAthlete] = useState<any>(null);
  const [sport, setSport] = useState("");
  const [position, setPosition] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("athletes").select("*").eq("profile_id", user.id).maybeSingle();
      if (error) handleQueryError(error);
      if (data) {
        setAthlete(data);
        setSport(data.sport || "");
        setPosition(data.position || "");
        setProvince(data.province || "");
        setCountry(data.country || "");
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!athlete) return;
    setSaving(true);
    const { error } = await supabase
      .from("athletes")
      .update({ sport, position, province, country } as Record<string, unknown>)
      .eq("id", athlete.id);

    if (error) {
      handleQueryError(error, "Failed to save profile.");
    } else {
      toast({ title: "Profile updated!" });
    }
    setSaving(false);
  };

  if (loading) {
    return <DashboardLayout role="athlete"><div className="md:ml-16"><Skeleton className="h-48 rounded-xl" /></div></DashboardLayout>;
  }

  if (!athlete) {
    return (
      <DashboardLayout role="athlete">
        <div className="md:ml-16 text-center py-20">
          <User className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-sm text-muted-foreground">No athlete profile found.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="athlete">
      <div className="md:ml-16 space-y-6 max-w-lg">
        <h1 className="text-2xl font-display font-bold text-foreground">Athlete Profile</h1>

        <div className="bg-card rounded-xl p-6 border border-border shadow-card space-y-4">
          <div>
            <Label className="text-foreground">Sport</Label>
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select sport" /></SelectTrigger>
              <SelectContent>
                {SPORT_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground">Position</Label>
            <Input className="mt-1.5" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Striker, Midfielder" />
          </div>
          <div>
            <Label className="text-foreground">Province</Label>
            <Input className="mt-1.5" value={province} onChange={(e) => setProvince(e.target.value)} placeholder="e.g. Gauteng" />
          </div>
          <div>
            <Label className="text-foreground">Country</Label>
            <Input className="mt-1.5" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. South Africa" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AthleteProfilePage;
