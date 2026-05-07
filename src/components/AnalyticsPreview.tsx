import { useEffect, useRef, useState } from "react";
import { motion, animate, useInView } from "framer-motion";
import { ArrowUp, BarChart3, Shield, Trophy, TrendingUp } from "lucide-react";

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
    const ctrl = animate(0, to, { duration, delay, ease: "easeOut", onUpdate: (v) => setDisplay(format(v)) });
    return () => ctrl.stop();
  }, [inView, to, duration, delay, format]);
  return <span ref={ref}>{display}</span>;
};

const RATINGS = [6.5, 7.0, 6.8, 7.4, 7.8, 7.2, 8.1, 7.6, 8.5, 8.0];
const HIGHLIGHT_INDEX = 8; // the 8.5

const STATS = [
  { icon: Shield,     value: 24,  format: (n: number) => Math.round(n).toString(),       label: "Matches",    color: "text-stat-blue",  trend: "+3" },
  { icon: TrendingUp, value: 71,  format: (n: number) => `${Math.round(n)}%`,            label: "Win Rate",   color: "text-stat-green", trend: "+8%" },
  { icon: Trophy,     value: 18,  format: (n: number) => Math.round(n).toString(),       label: "Goals",      color: "text-gold",       trend: "+5" },
  { icon: BarChart3,  value: 7.4, format: (n: number) => n.toFixed(1),                   label: "Avg Rating", color: "text-primary",    trend: "+0.6" },
];

const PIE = { wins: 17, draws: 4, losses: 3 }; // 24 total — matches the Matches stat

/** Build SVG path for a smooth line through normalized points. */
const buildLinePath = (values: number[], width: number, height: number, padX: number, padY: number) => {
  const minY = 5;
  const maxY = 10;
  const xs = values.map((_, i) => padX + (i * (width - 2 * padX)) / (values.length - 1));
  const ys = values.map((v) => height - padY - ((v - minY) / (maxY - minY)) * (height - 2 * padY));
  return { xs, ys, path: xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(" ") };
};

const buildAreaPath = (xs: number[], ys: number[], height: number, padY: number) => {
  const top = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(" ");
  return `${top} L ${xs[xs.length - 1].toFixed(1)} ${height - padY} L ${xs[0].toFixed(1)} ${height - padY} Z`;
};

const AnalyticsPreview = () => {
  const W = 360;
  const H = 130;
  const PX = 16;
  const PY = 14;
  const { xs, ys, path } = buildLinePath(RATINGS, W, H, PX, PY);
  const areaPath = buildAreaPath(xs, ys, H, PY);

  // Pie geometry — full circumference 2πr = 188.5 for r=30
  const total = PIE.wins + PIE.draws + PIE.losses;
  const r = 30;
  const C = 2 * Math.PI * r;
  const winsLen = (PIE.wins / total) * C;
  const drawsLen = (PIE.draws / total) * C;
  const lossesLen = (PIE.losses / total) * C;

  return (
    <div className="relative">
      <div className="bg-gradient-hero rounded-3xl p-1.5 shadow-2xl -rotate-1">
        <div className="bg-card rounded-[1.4rem] p-5 sm:p-6 flex flex-col gap-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Analytics</div>
              <h4 className="font-display font-bold text-foreground text-base leading-tight">Match Performance</h4>
            </div>
            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
              Last 10
            </div>
          </div>

          {/* Line chart — rating over last 10 matches */}
          <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
              {/* Gridlines */}
              {[6, 7, 8, 9].map((g) => {
                const y = H - PY - ((g - 5) / 5) * (H - 2 * PY);
                return (
                  <g key={g}>
                    <line x1={PX} y1={y} x2={W - PX} y2={y} strokeDasharray="2 3" className="stroke-border" strokeWidth="0.5" />
                    <text x={PX - 4} y={y + 3} className="fill-muted-foreground" fontSize="8" textAnchor="end">{g}</text>
                  </g>
                );
              })}
              {/* Area fill */}
              <motion.path
                d={areaPath}
                className="fill-primary/15"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 1.1 }}
              />
              {/* Animated line */}
              <motion.path
                d={path}
                className="stroke-primary fill-none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, ease: "easeInOut" }}
              />
              {/* Data points */}
              {xs.map((x, i) => (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={ys[i]}
                  r={i === HIGHLIGHT_INDEX ? 3.5 : 2}
                  className={i === HIGHLIGHT_INDEX ? "fill-gold stroke-card" : "fill-primary stroke-card"}
                  strokeWidth="1"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 1.4 + i * 0.05 }}
                />
              ))}
              {/* Highlight tooltip on best match */}
              <motion.g
                initial={{ opacity: 0, y: -4 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 2.0 }}
              >
                <rect x={xs[HIGHLIGHT_INDEX] - 14} y={ys[HIGHLIGHT_INDEX] - 22} width="28" height="14" rx="3" className="fill-gold" />
                <text x={xs[HIGHLIGHT_INDEX]} y={ys[HIGHLIGHT_INDEX] - 12} className="fill-foreground" fontSize="9" fontWeight="700" textAnchor="middle">8.5</text>
              </motion.g>
            </svg>
          </div>

          {/* Bottom row: KPI tiles + pie */}
          <div className="grid grid-cols-3 gap-3">
            {/* KPI tiles 2×2 */}
            <div className="col-span-2 grid grid-cols-2 gap-2">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                  className="bg-muted/30 rounded-lg p-2 border border-border/50"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon className={`h-3 w-3 ${s.color}`} />
                    <span className="text-[9px] text-muted-foreground">{s.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-bold text-base text-foreground tabular-nums leading-none">
                      <CountUp to={s.value} format={s.format} delay={0.5 + i * 0.08} />
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-stat-green">
                      <ArrowUp className="h-2 w-2" />{s.trend}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Win/Loss pie */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-muted/30 rounded-lg p-2 border border-border/50 flex flex-col items-center justify-center"
            >
              <svg viewBox="0 0 80 80" className="w-16 h-16 -rotate-90">
                <circle cx="40" cy="40" r={r} className="fill-none stroke-muted" strokeWidth="14" />
                <motion.circle
                  cx="40" cy="40" r={r}
                  className="fill-none stroke-stat-green"
                  strokeWidth="14"
                  strokeDasharray={`${winsLen} ${C}`}
                  strokeDashoffset="0"
                  initial={{ strokeDasharray: `0 ${C}` }}
                  whileInView={{ strokeDasharray: `${winsLen} ${C}` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.7 }}
                />
                <motion.circle
                  cx="40" cy="40" r={r}
                  className="fill-none stroke-gold"
                  strokeWidth="14"
                  strokeDasharray={`${drawsLen} ${C}`}
                  strokeDashoffset={-winsLen}
                  initial={{ strokeDasharray: `0 ${C}` }}
                  whileInView={{ strokeDasharray: `${drawsLen} ${C}` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 1.0 }}
                />
                <motion.circle
                  cx="40" cy="40" r={r}
                  className="fill-none stroke-destructive"
                  strokeWidth="14"
                  strokeDasharray={`${lossesLen} ${C}`}
                  strokeDashoffset={-(winsLen + drawsLen)}
                  initial={{ strokeDasharray: `0 ${C}` }}
                  whileInView={{ strokeDasharray: `${lossesLen} ${C}` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 1.3 }}
                />
              </svg>
              <div className="flex items-center gap-1.5 mt-1.5 text-[9px] font-semibold">
                <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-stat-green" />{PIE.wins}W</span>
                <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-gold" />{PIE.draws}D</span>
                <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-destructive" />{PIE.losses}L</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-6 -left-6 w-24 h-24 bg-gold/10 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
};

export default AnalyticsPreview;
