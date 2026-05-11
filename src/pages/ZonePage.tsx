import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Target, BarChart3, ShoppingBag, User, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { SPORT_OPTIONS, getLevelName } from "@/config/constants";
import { handleQueryError } from "@/lib/queryHelpers";

interface Athlete {
  id: string;
  sport: string;
  position: string;
  level: number;
  xp_points: number;
  performance_score: number;
  profile_id: string;
  /** Denormalized name from athletes.full_name — kept in sync with profiles.name via DB trigger */
  full_name: string | null;
  profiles?: { name: string | null; avatar: string | null };
}

const ZonePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"participants" | "compare" | "marketplace">("participants");
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [compareA, setCompareA] = useState<Athlete | null>(null);
  const [compareB, setCompareB] = useState<Athlete | null>(null);

  /** Returns the best display name for an athlete.
   *  Priority: athletes.full_name → profiles.name → "Unknown Athlete"
   *  athletes.full_name is authoritative for stub & claimed athletes alike
   *  and is synced by trg_sync_athlete_fullname when profiles.name changes.
   */
  const getDisplayName = (athlete: Athlete): string =>
    athlete.full_name?.trim() ||
    athlete.profiles?.name?.trim() ||
    "Unknown Athlete";

  const getInitials = (athlete: Athlete): string => {
    const name = getDisplayName(athlete);
    if (name === "Unknown Athlete") return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const fetchAthletes = useCallback(async () => {
    setLoading(true);
    // Select full_name directly — it is the single source of truth for display names
    // and is kept in sync with profiles.name via DB trigger (20260510100000 migration).
    let query = supabase
      .from("athletes")
      .select(
        "id, sport, position, level, xp_points, performance_score, profile_id, full_name, profiles(name, avatar)"
      )
      .order("performance_score", { ascending: false });

    if (sportFilter !== "all") {
      query = query.eq("sport", sportFilter);
    }

    const { data, error } = await query;
    if (error) handleQueryError(error, "Failed to load athletes.");
    setAthletes((data as unknown as Athlete[]) || []);
    setLoading(false);
  }, [sportFilter]);

  useEffect(() => {
    fetchAthletes();
    // Refetch when user returns to this tab — e.g. after editing their name on Profile page
    const handleFocus = () => fetchAthletes();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchAthletes]);

  const filteredAthletes = athletes.filter(
    (a) =>
      !searchQuery.trim() ||
      getDisplayName(a).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { key: "participants" as const, label: "Participants", icon: User },
    { key: "compare" as const, label: "Compare", icon: BarChart3 },
    { key: "marketplace" as const, label: "Marketplace", icon: ShoppingBag },
  ];

  const handleAddToCompare = (e: React.MouseEvent, athlete: Athlete) => {
    e.stopPropagation();
    if (!compareA) {
      setCompareA(athlete);
    } else if (!compareB && compareA.id !== athlete.id) {
      setCompareB(athlete);
      setActiveTab("compare");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">Zone</h1>
          <p className="text-sm text-muted-foreground">
            Discover talent, compare athletes, explore opportunities
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Participants */}
        {activeTab === "participants" && (
          <div className="space-y-4">
            {/* Search + Filter */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by athlete name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={sportFilter} onValueChange={setSportFilter}>
                <SelectTrigger className="w-36">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  {SPORT_OPTIONS.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredAthletes.length === 0 ? (
              <div className="text-center py-20 px-4 border-2 border-dashed border-border rounded-xl">
                <Target className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-display font-semibold text-foreground mb-1">No athletes found</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  {searchQuery
                    ? "No athletes match your search. Try a different name."
                    : "Athletes will appear here once profiles are created."}
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {filteredAthletes.length} athlete{filteredAthletes.length !== 1 ? "s" : ""} ·
                  Tap card to view profile · Use "+ Compare" to compare two athletes side by side
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredAthletes.map((athlete, i) => (
                    <motion.div
                      key={athlete.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-card rounded-xl p-4 border border-border shadow-card hover:border-primary/40 hover:shadow-elevated transition-all cursor-pointer group"
                      onClick={() => navigate(`/profile?athleteId=${athlete.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                          {athlete.profiles?.avatar ? (
                            <img
                              src={athlete.profiles.avatar}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="font-display font-semibold text-sm text-primary">
                              {getInitials(athlete)}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">
                            {getDisplayName(athlete)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {athlete.position || athlete.sport} · {athlete.sport}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-display font-bold text-foreground">
                            {Number(athlete.performance_score).toFixed(0)}
                          </div>
                          <div className="flex items-center gap-1 justify-end">
                            <Zap className="h-3 w-3 text-primary" />
                            <span className="text-[10px] text-muted-foreground">Lvl {athlete.level}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer: badge + compare button */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {getLevelName(athlete.level)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{athlete.xp_points} XP</span>
                        </div>
                        <button
                          className="text-[10px] text-muted-foreground hover:text-primary transition-colors border border-border hover:border-primary/40 rounded px-1.5 py-0.5"
                          onClick={(e) => handleAddToCompare(e, athlete)}
                          title="Add to side-by-side comparison"
                        >
                          + Compare
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Compare */}
        {activeTab === "compare" && (
          <div className="space-y-6">
            {!compareA && !compareB && (
              <p className="text-center text-sm text-muted-foreground">
                Go to Participants and click "+ Compare" on two athletes to compare them here.
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              {([compareA, compareB] as (Athlete | null)[]).map((athlete, idx) => (
                <div key={idx} className="bg-card rounded-xl p-5 border border-border shadow-card text-center">
                  {athlete ? (
                    <>
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        {athlete.profiles?.avatar ? (
                          <img
                            src={athlete.profiles.avatar}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="font-display font-bold text-lg text-primary">
                            {getInitials(athlete)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-semibold text-foreground">{getDisplayName(athlete)}</h3>
                      <p className="text-xs text-muted-foreground">{athlete.sport} · {athlete.position}</p>
                      <div className="mt-4 space-y-2">
                        {[
                          { label: "Score", value: Number(athlete.performance_score).toFixed(0) },
                          { label: "XP", value: athlete.xp_points },
                          { label: "Level", value: athlete.level },
                        ].map((stat) => (
                          <div key={stat.label} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{stat.label}</span>
                            <span className="font-semibold text-foreground">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => (idx === 0 ? setCompareA(null) : setCompareB(null))}
                        className="mt-3 text-xs text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <div className="py-8 border border-dashed border-border rounded-lg">
                      <User className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Select an athlete from Participants to compare
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Marketplace */}
        {activeTab === "marketplace" && (
          <div className="text-center py-20">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display font-semibold text-foreground mb-1">Marketplace Opening Soon</h3>
            <p className="text-sm text-muted-foreground">
              Transfer listings, scouting reports, and exclusive opportunities will appear here.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ZonePage;
