import { useState, useEffect } from "react";
import { Search, Building2, MapPin, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface InstitutionSearchProps {
  onSelect: (institutionId: string | null, locationId: string | null) => void;
  selectedInstitutionId: string | null;
  selectedLocationId: string | null;
}

const InstitutionSearch = ({ onSelect, selectedInstitutionId, selectedLocationId }: InstitutionSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from("institutions")
        .select("id, institution_name, institution_type, province, logo_url")
        .ilike("institution_name", `%${query.trim()}%`)
        .limit(8);
      setResults(data || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  // Load locations when institution selected
  useEffect(() => {
    if (!selectedInstitutionId) {
      setLocations([]);
      return;
    }
    const loadLocs = async () => {
      setLoadingLocations(true);
      const { data } = await supabase
        .from("institution_locations")
        .select("id, location_name, city, province, is_primary")
        .eq("institution_id", selectedInstitutionId)
        .eq("status", "active")
        .order("is_primary", { ascending: false });
      setLocations(data || []);
      setLoadingLocations(false);

      // Auto-select primary location if only one exists
      if (data && data.length === 1) {
        onSelect(selectedInstitutionId, data[0].id);
      }
    };
    loadLocs();
  }, [selectedInstitutionId]);

  const handleSelectInstitution = (inst: any) => {
    setSelectedInstitution(inst);
    onSelect(inst.id, null);
    setQuery("");
    setResults([]);
  };

  const handleClear = () => {
    setSelectedInstitution(null);
    setLocations([]);
    onSelect(null, null);
    setQuery("");
  };

  return (
    <div className="space-y-4">
      {!selectedInstitution ? (
        <>
          <div>
            <Label>Search for your institution</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Type institution name..."
                className="pl-10"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>

          {searching && (
            <p className="text-xs text-muted-foreground">Searching...</p>
          )}

          {results.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {results.map(inst => (
                <button
                  key={inst.id}
                  onClick={() => handleSelectInstitution(inst)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {inst.logo_url ? (
                      <img src={inst.logo_url} alt="" className="w-8 h-8 rounded-md object-cover" />
                    ) : (
                      <Building2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">{inst.institution_name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {inst.institution_type}{inst.province ? ` · ${inst.province}` : ""}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query.trim().length >= 2 && !searching && results.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">
              No institutions found. You can skip this step and link later.
            </p>
          )}
        </>
      ) : (
        <>
          {/* Selected Institution */}
          <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-primary/30 bg-primary/5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground">{selectedInstitution.institution_name}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {selectedInstitution.institution_type}{selectedInstitution.province ? ` · ${selectedInstitution.province}` : ""}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Location selector */}
          {loadingLocations ? (
            <p className="text-xs text-muted-foreground">Loading locations...</p>
          ) : locations.length > 1 ? (
            <div>
              <Label>Select your location / campus</Label>
              <select
                className="mt-1 w-full border border-border rounded-md p-2 bg-background text-foreground text-sm"
                value={selectedLocationId || ""}
                onChange={e => onSelect(selectedInstitutionId, e.target.value || null)}
              >
                <option value="">Select a location</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.location_name}
                    {loc.city ? ` (${loc.city})` : ""}
                    {loc.is_primary ? " - Primary" : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : locations.length === 1 ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-muted/30 rounded-lg">
              <MapPin className="h-3.5 w-3.5" />
              <span>Location: {locations[0].location_name}</span>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default InstitutionSearch;
