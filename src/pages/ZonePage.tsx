import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Target, BarChart3, ShoppingBag, User, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { LEVEL_NAMES, SPORT_OPTIONS, getLevelName } from "@/config/constants";

interface Athlete {
  id: string;
  sport: string;
  position: string;
  level: number;
  xp_points: number;
  performance_score: number;
  profile_id: string;
  profiles?: { name: string; avatar: string | null };
}


const ZonePage = () => {
  const [activeTab, setActiveTab] = useState<"participants" | "compare" | "marketplace">("participants");
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [compareA, setCompareA] = useState<Athlete | null>(null);
  const [compareB, setCompareB] = useState<Athlete | null>(null);

  useEffect(() => {
    const fetchAthletes = async () => {
      setLoading(true);
      let query = supabase
        .from("athletes")
        .select("*, profiles(name, avatar)")
        .order("performance_score", { ascending: false });

      if (sportFilter !== "all") {
        query = query.eq("sport", sportFilter);
      }

      const { data } = await query;
      setAthletes((data as unknown as Athlete[]) || []);
      setLoading(false);
    };
    fetchAthletes();
  }, [sportFilter]);

  const filteredAthletes = athletes.filter((a) =>
    !searchQuery.trim() || (a.profiles?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { key: "participants" as const, label: "Participants", icon: User },
    { key: "compare" as const, label: "Compare", icon: BarChart3 },
    { key: "marketplace" as const, label: "Marketplace", icon: ShoppingBag },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">Zone</h1>
          <p className="text-sm text-muted-foreground">Discover talent, compare athletes, explore opportunities</p>
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
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search athletes..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={sportFilter} onValueChange={setSportFilter}>
                <SelectTrigger className="w-36">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  {SPORT_OPTIONS.map((sport) => (
                    <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredAthletes.length === 0 ? (
              <div className="text-center py-20">
                <Target className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-display font-semibold text-foreground mb-1">No athletes found</h3>
                <p className="text-sm text-muted-foreground">Athletes will appear here once profiles are created.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredAthletes.map((athlete, i) => (
                  <motion.div
                    key={athlete.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-card rounded-xl p-4 border border-border shadow-card hover:shadow-elevated transition-shadow cursor-pointer"
                    onClick={() => {
                      if (!compareA) setCompareA(athlete);
                      else if (!compareB) { setCompareB(athlete); setActiveTab("compare"); }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-display font-semibold text-sm text-primary">
                          {(athlete.profiles?.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">{athlete.profiles?.name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{athlete.position || athlete.sport} · {athlete.sport}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-display font-bold text-foreground">{Number(athlete.performance_score).toFixed(0)}</div>
                        <div className="flex items-center gap-1 justify-end">
                          <Zap className="h-3 w-3 text-primary" />
                          <span className="text-[10px] text-muted-foreground">Lvl {athlete.level}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {getLevelName(athlete.level)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{athlete.xp_points} XP</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Compare */}
        {activeTab === "compare" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[compareA, compareB].map((athlete, idx) => (
                <div key={idx} className="bg-card rounded-xl p-5 border border-border shadow-card text-center">
                  {athlete ? (
                    <>
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <span className="font-display font-bold text-primary">
                          {(athlete.profiles?.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-foreground">{athlete.profiles?.name}</h3>
                      <p className="text-xs text-muted-foreground">{athlete.sport} · {athlete.position}</p>
                      <div className="mt-4 space-y-2">
                        {[
                          { label: "Score", value: Number(athlete.performance_score) },
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
                        onClick={() => idx === 0 ? setCompareA(null) : setCompareB(null)}
                        className="mt-3 text-xs text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <div className="py-8">
                      <User className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">Select an athlete from Participants</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!compareA && !compareB && (
              <p className="text-center text-sm text-muted-foreground">
                Go to Participants tab and click two athletes to compare.
              </p>
            )}
          </div>
        )}

        {/* Marketplace */}
        {activeTab === "marketplace" && (
          <div className="text-center py-20">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display font-semibold text-foreground mb-1">Marketplace Coming Soon</h3>
            <p className="text-sm text-muted-foreground">Transfer listings and opportunities will appear here.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ZonePage;
