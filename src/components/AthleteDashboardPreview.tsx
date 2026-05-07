import { useEffect, useRef, useState } from "react";
import { motion, animate, useInView } from "framer-motion";
import {
  Zap, Trophy, TrendingUp, Shield, BarChart3, Flame, ShieldCheck, Eye, ArrowUp,
} from "lucide-react";

export type PillarId = "verified" | "discovery" | "gamification";

interface Props {
  activePillar: PillarId;
}

/** Animated number counter that fires when scrolled into view. */
const CountUp = ({
  to, format, delay = 0, duration = 1.2,
}: {
  to: number;
  format: (n: number) => string;
  delay?: number;
  duration?: number;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(format(0));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(format(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration, delay, format]);

  return <span ref={ref}>{display}</span>;
};

const STATS = [
  { icon: Shield,      value: 24, format: (n: number) => Math.round(n).toString(),       label: "Matches",   color: "text-stat-blue",  trend: "+3 this mo" },
  { icon: TrendingUp,  value: 71, format: (n: number) => `${Math.round(n)}%`,            label: "Win Rate",  color: "text-stat-green", trend: "+8%" },
  { icon: Trophy,      value: 18, format: (n: number) => Math.round(n).toString(),       label: "Goals",     color: "text-gold",       trend: "+5 this mo" },
  { icon: BarChart3,   value: 82, format: (n: number) => Math.round(n).toString(),       label: "Score",     color: "text-primary",    trend: "+4" },
] as const;

const FITNESS = [
  { label: "40m Sprint",    value: "4.78", unit: "s",      pct: 78 },
  { label: "VO2 Max",       value: "56",   unit: "ml/kg",  pct: 71 },
  { label: "Vertical Jump", value: "64",   unit: "cm",     pct: 84 },
];

const ACHIEVEMENTS = [
  { id: "trophy",   icon: Trophy,      color: "bg-gold/15 text-gold border-gold/30",                       title: "Hat-trick" },
  { id: "verified", icon: ShieldCheck, color: "bg-primary/15 text-primary border-primary/30",              title: "Verified" },
  { id: "streak",   icon: Flame,       color: "bg-stat-orange/15 text-stat-orange border-stat-orange/30",  title: "Streak" },
];

/** Visual emphasis classes for the active pillar's region. */
const highlightWhen = (active: boolean) =>
  active
    ? "ring-2 ring-primary/60 shadow-[0_0_24px_-4px_hsl(var(--primary)/0.4)]"
    : "ring-2 ring-transparent";

const AthleteDashboardPreview = ({ activePillar }: Props) => {
  const isVerified = activePillar === "verified";
  const isDiscovery = activePillar === "discovery";
  const isGamification = activePillar === "gamification";

  return (
    <div className="relative">
      <motion.div
        className="bg-gradient-hero rounded-3xl p-1.5 shadow-2xl rotate-1"
        animate={{ scale: isDiscovery ? 1.02 : 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className={`bg-card rounded-[1.4rem] p-5 sm:p-6 flex flex-col gap-5 transition-all duration-500 ${
          isDiscovery ? "ring-2 ring-primary/50 shadow-[0_0_40px_-8px_hsl(var(--primary)/0.4)]" : "ring-2 ring-transparent"
        }`}>

          {/* Discovery overlay — only when that pillar is active */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: isDiscovery ? 1 : 0, y: isDiscovery ? 0 : -8 }}
            transition={{ duration: 0.3 }}
            className="absolute -top-3 left-6 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-primary-foreground shadow-md text-[10px] font-bold uppercase tracking-wider z-10 pointer-events-none"
          >
            <Eye className="h-3 w-3" />
            <span>Discoverable</span>
          </motion.div>

          {/* Hero — avatar + name + level pill */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center font-display font-bold text-primary shadow-glow flex-shrink-0">
              TM
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-foreground text-base leading-tight truncate">Thabo Molefe</div>
              <div className="text-xs text-muted-foreground truncate">Football · Athletics · South Africa</div>
            </div>
            <motion.div
              animate={{ scale: isGamification ? 1.08 : 1 }}
              transition={{ duration: 0.3 }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 flex-shrink-0 transition-shadow ${
                isGamification ? "shadow-glow" : ""
              }`}
            >
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold text-primary">LVL 7</span>
            </motion.div>
          </div>

          {/* XP bar — highlighted on gamification */}
          <div className={`-mx-2 px-2 py-1 rounded-md transition-all duration-300 ${highlightWhen(isGamification)}`}>
            <div className="flex justify-between text-[10px] mb-1.5">
              <span className="font-bold uppercase tracking-wider text-primary">Elite</span>
              <span className="font-semibold text-muted-foreground">
                <CountUp to={4200} format={(n) => Math.round(n).toLocaleString()} delay={0.2} /> / 4,800 XP
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "87.5%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                className="h-full rounded-full bg-gradient-energy"
              />
            </div>
          </div>

          {/* Performance snapshot — 4 real stats, with trend chips */}
          <div className="grid grid-cols-4 gap-2">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                className="bg-muted/30 rounded-lg p-2 text-center border border-border/50"
              >
                <s.icon className={`h-3.5 w-3.5 mx-auto mb-1 ${s.color}`} />
                <div className="font-display font-bold text-sm text-foreground leading-none tabular-nums">
                  <CountUp to={s.value} format={s.format} delay={0.4 + i * 0.08} />
                </div>
                <div className="text-[9px] text-muted-foreground mt-1">{s.label}</div>
                <div className="mt-1 inline-flex items-center gap-0.5 text-[8px] font-bold text-stat-green">
                  <ArrowUp className="h-2 w-2" />
                  {s.trend}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Fitness tests */}
          <div className="space-y-2 p-3 bg-muted/20 rounded-lg border border-border/50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fitness Tests</div>
            {FITNESS.map((m, idx) => (
              <div key={m.label} className="flex items-center gap-2 text-[11px]">
                <span className="w-20 font-medium text-foreground flex-shrink-0">{m.label}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${m.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 + idx * 0.1 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
                <span className="font-bold text-foreground tabular-nums flex-shrink-0">
                  {m.value}<span className="text-muted-foreground font-normal ml-0.5">{m.unit}</span>
                </span>
              </div>
            ))}
          </div>

          {/* Achievement strip — sequential scale-in, "Verified" highlights on pillar 1 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Earned</span>
            {ACHIEVEMENTS.map((b, i) => {
              const isThisVerified = b.id === "verified" && isVerified;
              const isThisAny = isGamification;
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.7 + i * 0.12, type: "spring", stiffness: 260, damping: 18 }}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${b.color} transition-all duration-300 ${
                    isThisVerified ? "scale-110 shadow-[0_0_18px_-4px_hsl(var(--primary)/0.6)]" : ""
                  } ${isThisAny && !isThisVerified ? "shadow-md" : ""}`}
                >
                  <b.icon className="h-3 w-3" />
                  <span className="text-[10px] font-semibold">{b.title}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-6 -left-6 w-24 h-24 bg-gold/10 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
};

export default AthleteDashboardPreview;
