import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Plus, Edit, Trash2, Star, Users, Loader2, Building2,
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

interface LocationForm {
  location_name: string;
  address: string;
  city: string;
  province: string;
  country: string;
  contact_phone: string;
  contact_email: string;
  capacity: string;
  facilities_description: string;
  is_primary: boolean;
}

const emptyForm: LocationForm = {
  location_name: "",
  address: "",
  city: "",
  province: "",
  country: "South Africa",
  contact_phone: "",
  contact_email: "",
  capacity: "",
  facilities_description: "",
  is_primary: false,
};

const InstitutionLocations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [athleteCounts, setAthleteCounts] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LocationForm>(emptyForm);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const { data: inst } = await supabase
      .from("institutions")
      .select("id, institution_name")
      .eq("profile_id", user!.id)
      .maybeSingle();

    if (!inst) { setLoading(false); return; }
    setInstitution(inst);

    const { data: locs, error } = await supabase
      .from("institution_locations")
      .select("*")
      .eq("institution_id", inst.id)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) handleQueryError(error);
    else setLocations(locs || []);

    // Get athlete counts per location
    const { data: athletes } = await supabase
      .from("athletes")
      .select("location_id")
      .eq("institution_id", inst.id)
      .not("location_id", "is", null);

    if (athletes) {
      const counts: Record<string, number> = {};
      athletes.forEach((a: any) => {
        if (a.location_id) counts[a.location_id] = (counts[a.location_id] || 0) + 1;
      });
      setAthleteCounts(counts);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.location_name.trim() || !institution) return;
    setSaving(true);

    try {
      const payload = {
        institution_id: institution.id,
        location_name: form.location_name.trim(),
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        province: form.province.trim() || null,
        country: form.country.trim() || "South Africa",
        contact_phone: form.contact_phone.trim() || null,
        contact_email: form.contact_email.trim() || null,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        facilities_description: form.facilities_description.trim() || null,
        is_primary: form.is_primary,
      };

      // If setting as primary, unset other primaries first
      if (form.is_primary) {
        await supabase
          .from("institution_locations")
          .update({ is_primary: false })
          .eq("institution_id", institution.id)
          .eq("is_primary", true);
      }

      if (editingId) {
        const { error } = await supabase
          .from("institution_locations")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast({ title: "Location updated" });
      } else {
        // If this is the first location, make it primary
        if (locations.length === 0) payload.is_primary = true;
        const { error } = await supabase
          .from("institution_locations")
          .insert(payload);
        if (error) throw error;
        toast({ title: "Location added" });
      }

      setCreateOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadData();
    } catch (error: any) {
      handleQueryError(error, "Failed to save location.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("institution_locations")
      .delete()
      .eq("id", id);
    if (error) handleQueryError(error, "Failed to delete location.");
    else {
      toast({ title: "Location removed" });
      await loadData();
    }
  };

  const openEdit = (loc: any) => {
    setForm({
      location_name: loc.location_name || "",
      address: loc.address || "",
      city: loc.city || "",
      province: loc.province || "",
      country: loc.country || "South Africa",
      contact_phone: loc.contact_phone || "",
      contact_email: loc.contact_email || "",
      capacity: loc.capacity?.toString() || "",
      facilities_description: loc.facilities_description || "",
      is_primary: loc.is_primary || false,
    });
    setEditingId(loc.id);
    setCreateOpen(true);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setCreateOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout role="institution">
        <div className="md:ml-16 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="institution">
      <div className="md:ml-16 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Locations & Facilities</h1>
            <p className="text-sm text-muted-foreground">Manage your institution's physical locations and training grounds.</p>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Add Location
          </Button>
        </div>

        {locations.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground mb-4">No locations set up yet.</p>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Add Your First Location</Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {locations.map((loc, i) => (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl p-5 border border-border shadow-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{loc.location_name}</h3>
                      {loc.is_primary && (
                        <Badge variant="secondary" className="text-[10px] mt-0.5">
                          <Star className="h-2.5 w-2.5 mr-0.5" /> Primary
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(loc)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    {!loc.is_primary && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(loc.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {loc.address && <p>{loc.address}</p>}
                  {(loc.city || loc.province) && (
                    <p>{[loc.city, loc.province].filter(Boolean).join(", ")}</p>
                  )}
                  {loc.facilities_description && (
                    <p className="text-foreground/70">{loc.facilities_description}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{athleteCounts[loc.id] || 0} athletes</span>
                  </div>
                  {loc.capacity && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span>Capacity: {loc.capacity}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={createOpen} onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) { setEditingId(null); setForm(emptyForm); }
        }}>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingId ? "Edit Location" : "Add Location"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Location Name *</Label>
                <Input className="mt-1" placeholder="e.g. Main Campus" value={form.location_name}
                  onChange={e => setForm({ ...form, location_name: e.target.value })} />
              </div>
              <div>
                <Label>Address</Label>
                <Input className="mt-1" placeholder="e.g. 123 Main St" value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>City</Label>
                  <Input className="mt-1" placeholder="e.g. Johannesburg" value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <Label>Province</Label>
                  <Input className="mt-1" placeholder="e.g. Gauteng" value={form.province}
                    onChange={e => setForm({ ...form, province: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Contact Phone</Label>
                  <Input className="mt-1" placeholder="+27..." value={form.contact_phone}
                    onChange={e => setForm({ ...form, contact_phone: e.target.value })} />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input className="mt-1" type="email" placeholder="location@example.com" value={form.contact_email}
                    onChange={e => setForm({ ...form, contact_email: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Capacity (max athletes)</Label>
                <Input className="mt-1" type="number" placeholder="e.g. 200" value={form.capacity}
                  onChange={e => setForm({ ...form, capacity: e.target.value })} />
              </div>
              <div>
                <Label>Facilities Description</Label>
                <Textarea className="mt-1 resize-none" rows={2}
                  placeholder="e.g. 2 grass fields, 1 indoor court, gym"
                  value={form.facilities_description}
                  onChange={e => setForm({ ...form, facilities_description: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_primary" checked={form.is_primary}
                  onChange={e => setForm({ ...form, is_primary: e.target.checked })}
                  className="rounded border-border" />
                <Label htmlFor="is_primary" className="text-sm cursor-pointer">Set as primary location</Label>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={saving || !form.location_name.trim()}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingId ? "Save Changes" : "Add Location"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default InstitutionLocations;
