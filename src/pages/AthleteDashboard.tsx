import { motion } from "framer-motion";
import { Trophy, TrendingUp, Star, Flame, Shield, Calendar, ChevronRight, Zap } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";

const mockAthlete = {
  name: "Marcus Johnson",
  sport: "Football",
  position: "Striker",
  age: 22,
  institution: "Cape Town Academy",
  level: 5,
  levelName: "Starter",
  xp: 2450,
  xpToNext: 3000,
  performanceScore: 78,
  verifiedMatches: 34,
};

const recentMatches = [
  { id: 1, opponent: "Johannesburg FC", date: "Mar 10", result: "W 3-1", goals: 2, assists: 1, rating: 8.5 },
  { id: 2, opponent: "Durban United", date: "Mar 5", result: "D 1-1", goals: 0, assists: 1, rating: 7.2 },
  { id: 3, opponent: "Pretoria Stars", date: "Feb 28", result: "W 2-0", goals: 1, assists: 0, rating: 7.8 },
];

const achievements = [
  { icon: Trophy, label: "Top Scorer", description: "Season 2025", color: "text-gold" },
  { icon: Flame, label: "5 Match Streak", description: "Current", color: "text-stat-red" },
  { icon: Star, label: "Man of the Match", description: "3 times", color: "text-stat-blue" },
];

const AthleteDashboard = () => {
  const xpPercent = (mockAthlete.xp / mockAthlete.xpToNext) * 100;

  return (
    <DashboardLayout role="athlete">
      <div className="md:ml-16 space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-hero p-6 shadow-elevated"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <span className="font-display font-bold text-2xl text-primary">MJ</span>
            </div>
            <div className="flex-1">
              <h1 className="font-display font-bold text-xl text-primary-foreground">{mockAthlete.name}</h1>
              <p className="text-primary-foreground/60 text-sm">{mockAthlete.position} · {mockAthlete.sport}</p>
              <p className="text-primary-foreground/40 text-xs mt-0.5">{mockAthlete.institution}</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Lvl {mockAthlete.level}</span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-primary-foreground/50 mb-1.5">
              <span>{mockAthlete.levelName}</span>
              <span>{mockAthlete.xp} / {mockAthlete.xpToNext} XP</span>
            </div>
            <div className="h-2 rounded-full bg-primary-foreground/10">
              <div className="h-full rounded-full bg-gradient-energy transition-all" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Performance", value: mockAthlete.performanceScore, icon: TrendingUp, color: "text-primary" },
            { label: "Matches", value: mockAthlete.verifiedMatches, icon: Shield, color: "text-stat-blue" },
            { label: "Goals", value: 18, icon: Trophy, color: "text-gold" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-card rounded-xl p-4 shadow-card border border-border text-center"
            >
              <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-display font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Achievements */}
        <div>
          <h2 className="font-display font-semibold text-foreground mb-3">Achievements</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {achievements.map((a) => (
              <div key={a.label} className="flex-shrink-0 bg-card rounded-xl p-4 border border-border shadow-card min-w-[140px]">
                <a.icon className={`h-6 w-6 mb-2 ${a.color}`} />
                <div className="text-sm font-semibold text-foreground">{a.label}</div>
                <div className="text-xs text-muted-foreground">{a.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Matches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-foreground">Recent Matches</h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              View All <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {recentMatches.map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{match.opponent}</div>
                  <div className="text-xs text-muted-foreground">{match.date} · {match.result}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-display font-bold text-foreground">{match.rating}</div>
                  <div className="text-[10px] text-muted-foreground">Rating</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Analytics Preview */}
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <h2 className="font-display font-semibold text-foreground mb-4">Performance Trend</h2>
          <div className="space-y-3">
            {[
              { label: "Speed", value: 82 },
              { label: "Shooting", value: 75 },
              { label: "Passing", value: 88 },
              { label: "Fitness", value: 70 },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{metric.label}</span>
                  <span className="font-semibold text-foreground">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AthleteDashboard;
