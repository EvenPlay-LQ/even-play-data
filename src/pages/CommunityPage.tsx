import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Play, Star, ShoppingBag, Crown, ChevronRight, Video } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { handleQueryError } from "@/lib/queryHelpers";
import { Skeleton } from "@/components/ui/skeleton";

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  sport: string;
  member_count: number;
  image_url: string | null;
}

interface MerchItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
}

const CommunityPage = () => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [merch, setMerch] = useState<MerchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [groupsRes, merchRes] = await Promise.all([
        supabase.from("community_groups").select("*").order("member_count", { ascending: false }).limit(6),
        supabase.from("merchandise").select("*").eq("in_stock", true).limit(4),
      ]);
      if (groupsRes.error) handleQueryError(groupsRes.error);
      if (merchRes.error) handleQueryError(merchRes.error);
      setGroups((groupsRes.data as unknown as CommunityGroup[]) || []);
      setMerch((merchRes.data as unknown as MerchItem[]) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const comingSoon = (feature: string) => {
    toast({ title: "Coming Soon", description: `${feature} is coming in a future update.` });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-8 max-w-4xl">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  const actionCards = [
    { icon: Users, title: "Join Community Groups", desc: "Find your tribe", gradient: "from-primary/10 to-primary/5", action: () => {
      document.getElementById("groups-section")?.scrollIntoView({ behavior: "smooth" });
    }},
    { icon: Play, title: "Watch Live & Replays", desc: "Catch the action", gradient: "from-stat-blue/10 to-stat-blue/5", action: () => comingSoon("Live & Replays") },
    { icon: Star, title: "Rate A Ref!", desc: "Share your opinion", gradient: "from-gold/10 to-gold/5", action: () => comingSoon("Rate A Ref") },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">Community</h1>
          <p className="text-sm text-muted-foreground">Groups, highlights, and merch</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actionCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl bg-gradient-to-br ${card.gradient} p-6 border border-border cursor-pointer hover:shadow-elevated transition-shadow`}
              onClick={card.action}
            >
              <card.icon className="h-8 w-8 text-foreground mb-3" />
              <h3 className="font-display font-semibold text-foreground">{card.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Top Fan Leaderboard */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Crown className="h-5 w-5 text-gold" /> Top Fans
            </h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1" onClick={() => comingSoon("Full leaderboard")}>
              View All <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="text-center py-8 text-muted-foreground text-sm">
            Leaderboard data coming soon — earn reputation by engaging!
          </div>
        </div>

        {/* Video of the Week */}
        <div className="rounded-2xl bg-gradient-hero p-6 shadow-elevated">
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-5 w-5 text-primary" />
            <h2 className="font-display font-semibold text-primary-foreground">Video of the Week</h2>
          </div>
          <div className="aspect-video rounded-xl bg-navy/50 flex items-center justify-center border border-primary/10">
            <div className="text-center">
              <Play className="h-12 w-12 text-primary-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-primary-foreground/40">Highlight videos coming soon</p>
            </div>
          </div>
        </div>

        {/* Community Groups */}
        <div id="groups-section">
          {groups.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-foreground mb-4">Community Groups</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {groups.map((group) => (
                  <div key={group.id} className="bg-card rounded-xl p-4 border border-border shadow-card">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1">{group.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{group.member_count} members · {group.sport || "Sports"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Official Merch */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gold" /> Official Merch
            </h2>
          </div>
          {merch.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {merch.map((item) => (
                <div key={item.id} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-primary font-bold mt-1">R{item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-card rounded-xl border border-border text-sm text-muted-foreground">
              Merch store launching soon!
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CommunityPage;
