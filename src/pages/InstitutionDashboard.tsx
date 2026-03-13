import { motion } from "framer-motion";
import { Users, AlertTriangle, CheckCircle, Clock, TrendingUp, Calendar, ChevronRight, BarChart3, Shield } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";

const institutionData = {
  name: "Cape Town Academy",
  type: "Academy",
  totalAthletes: 156,
  activeAthletes: 142,
  pendingVerifications: 12,
  incompleteProfiles: 8,
  expiringMedicals: 3,
};

const topAthletes = [
  { name: "Marcus Johnson", sport: "Football", position: "Striker", score: 78, level: 5 },
  { name: "Amara Okafor", sport: "Football", position: "Midfielder", score: 82, level: 6 },
  { name: "Sarah Chen", sport: "Athletics", position: "Sprinter", score: 91, level: 8 },
  { name: "David Nkosi", sport: "Rugby", position: "Fly-half", score: 74, level: 4 },
];

const upcomingMatches = [
  { id: 1, teams: "CT Academy vs Johannesburg FC", date: "Mar 15", competition: "Youth League", status: "Scheduled" },
  { id: 2, teams: "CT Academy vs Durban Stars", date: "Mar 22", competition: "Youth League", status: "Scheduled" },
];

const InstitutionDashboard = () => {
  return (
    <DashboardLayout role="institution">
      <div className="md:ml-16 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-display font-bold text-foreground">{institutionData.name}</h1>
          <p className="text-sm text-muted-foreground">{institutionData.type} Dashboard</p>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Athletes", value: institutionData.totalAthletes, icon: Users, color: "text-primary" },
            { label: "Active", value: institutionData.activeAthletes, icon: CheckCircle, color: "text-stat-green" },
            { label: "Pending Verifications", value: institutionData.pendingVerifications, icon: Clock, color: "text-stat-orange" },
            { label: "Alerts", value: institutionData.incompleteProfiles + institutionData.expiringMedicals, icon: AlertTriangle, color: "text-stat-red" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl p-4 border border-border shadow-card"
            >
              <stat.icon className={`h-5 w-5 mb-2 ${stat.color}`} />
              <div className="text-2xl font-display font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Task Alerts */}
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <h2 className="font-display font-semibold text-foreground mb-3">Task Alerts</h2>
          <div className="space-y-2">
            {[
              { icon: Clock, label: `${institutionData.pendingVerifications} pending verifications`, color: "text-stat-orange", bg: "bg-stat-orange/10" },
              { icon: AlertTriangle, label: `${institutionData.incompleteProfiles} incomplete profiles`, color: "text-stat-red", bg: "bg-stat-red/10" },
              { icon: Shield, label: `${institutionData.expiringMedicals} expiring medicals`, color: "text-gold", bg: "bg-gold/10" },
            ].map((alert) => (
              <div key={alert.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`w-8 h-8 rounded-lg ${alert.bg} flex items-center justify-center`}>
                  <alert.icon className={`h-4 w-4 ${alert.color}`} />
                </div>
                <span className="text-sm text-foreground flex-1">{alert.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* Top Athletes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-foreground">Top Athletes</h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              View All <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {topAthletes.map((athlete, i) => (
              <motion.div
                key={athlete.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-display font-semibold text-sm text-primary">
                    {athlete.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{athlete.name}</div>
                  <div className="text-xs text-muted-foreground">{athlete.position} · {athlete.sport}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-display font-bold text-foreground">{athlete.score}</div>
                  <div className="text-[10px] text-muted-foreground">Lvl {athlete.level}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Upcoming Matches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-foreground">Upcoming Matches</h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              Manage <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {upcomingMatches.map((match) => (
              <div key={match.id} className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{match.teams}</div>
                  <div className="text-xs text-muted-foreground">{match.date} · {match.competition}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{match.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <h2 className="font-display font-semibold text-foreground mb-4">Team Averages</h2>
          <div className="space-y-3">
            {[
              { label: "Overall Performance", value: 76 },
              { label: "Fitness Level", value: 82 },
              { label: "Verification Rate", value: 91 },
              { label: "Profile Completion", value: 88 },
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
    </DashboardLayout>
  );
};

export default InstitutionDashboard;
