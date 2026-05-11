import { motion } from "framer-motion";
import { MarketingLayout } from "@/components/MarketingLayout";
import { SEO } from "@/components/SEO";
import {
  Trophy, Activity, Layers, Wifi,
  ShieldCheck, FilePenLine, CheckCircle2,
  Target, Search, ArrowRight, Eye, TrendingUp,
} from "lucide-react";

const CAPABILITIES = [
  { icon: Layers,    value: "10",   label: "Levels",                 sub: "Rookie → Professional" },
  { icon: Trophy,    value: "9",    label: "Sports Supported",       sub: "and growing" },
  { icon: Activity,  value: "6",    label: "Fitness Tests",          sub: "industry-standard" },
  { icon: Wifi,      value: "100%", label: "Offline-Ready",          sub: "works without signal" },
];

const VERIFY_STEPS = [
  {
    icon: FilePenLine,
    label: "Step 1",
    title: "Log it yourself",
    desc: "Tap log on your dashboard. Add the result, your stats, optional notes. The whole thing takes about a minute.",
  },
  {
    icon: ShieldCheck,
    label: "Step 2",
    title: "Your club confirms it",
    desc: "A coach or admin from a club you're linked with reviews the entry. They approve, edit, or send it back with a note.",
  },
  {
    icon: CheckCircle2,
    label: "Step 3",
    title: "It becomes official",
    desc: "Verified entries get a green tick. They show up to scouts more prominently, and they stay on your record permanently.",
  },
];

const LEVELS = [
  { level: 1,  name: "Rookie",            blurb: "Welcome aboard. Start logging.",                xpToNext: 1200,  highlight: false },
  { level: 2,  name: "Beginner",          blurb: "Building consistency.",                          xpToNext: 1800,  highlight: false },
  { level: 3,  name: "Developing",        blurb: "Stats are starting to mean something.",          xpToNext: 2400,  highlight: false },
  { level: 4,  name: "Competitive",       blurb: "You've been at this a while.",                   xpToNext: 3000,  highlight: false },
  { level: 5,  name: "Starter",           blurb: "Reliable presence on the platform.",             xpToNext: 3600,  highlight: false },
  { level: 6,  name: "Advanced",          blurb: "Numbers tell a clear story.",                    xpToNext: 4200,  highlight: false },
  { level: 7,  name: "Elite",             blurb: "Verified, consistent, visible to scouts.",       xpToNext: 4800,  highlight: false },
  { level: 8,  name: "Provincial",        blurb: "Among the top performers in your region.",       xpToNext: 5400,  highlight: false },
  { level: 9,  name: "National Prospect", blurb: "On every serious scout's list.",                 xpToNext: 6000,  highlight: false },
  { level: 10, name: "Professional",      blurb: "Top of the platform.",                           xpToNext: null,  highlight: true },
];

const FITNESS = [
  { label: "40m Sprint",      value: "4.78", unit: "s",      pct: 78 },
  { label: "VO2 Max",         value: "56",   unit: "ml/kg",  pct: 71 },
  { label: "Bench 1RM",       value: "95",   unit: "kg",     pct: 68 },
  { label: "Vertical Jump",   value: "64",   unit: "cm",     pct: 84 },
  { label: "Illinois Agility",value: "16.2", unit: "s",      pct: 76 },
  { label: "Squat 1RM",       value: "125",  unit: "kg",     pct: 80 },
];

const ZONE_FILTERS = [
  { label: "Sport",       value: "Football" },
  { label: "Position",    value: "Striker" },
  { label: "Min Level",   value: "5 and up" },
  { label: "Min Rating",  value: "7.0+" },
];

const ZONE_RESULTS = [
  { initials: "TM", name: "Thabo M.",   level: 7, levelName: "Elite",      sport: "Football", pos: "Striker", region: "Gauteng",  rating: "7.8", goals: 18 },
  { initials: "NK", name: "Naledi K.",  level: 6, levelName: "Advanced",   sport: "Football", pos: "Striker", region: "W. Cape",  rating: "7.4", goals: 14 },
  { initials: "SD", name: "Sipho D.",   level: 5, levelName: "Starter",    sport: "Football", pos: "Striker", region: "KZN",      rating: "7.1", goals: 11 },
];

const formatNumber = (n: number) => n.toLocaleString();

const Stats = () => {
  return (
    <MarketingLayout>
      <SEO
        title="How the Stats Work | Even Playground"
        description="See exactly what the platform tracks, how verification works, how you climb the levels, and how scouts find you."
      />

      {/* Hero */}
      <section className="py-20 md:py-28 bg-background border-b border-border overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10" />
        <div className="container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6">
              Real stats. <br />
              <span className="text-gradient-energy">Real progress.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              See exactly what the platform tracks, how it gets verified, how you climb the ranks, and how scouts find you.
              No fluff — just the way it actually works.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Platform capability strip */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {CAPABILITIES.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/10 transition-colors">
                  <c.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">{c.value}</div>
                <div className="text-xs font-bold text-foreground uppercase tracking-widest mb-1">{c.label}</div>
                <div className="text-xs text-muted-foreground">{c.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: See your stats — visual examples */}
      <section className="py-24 bg-muted/30 border-t border-border">
        <div className="container">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">See your stats.</h2>
            <p className="text-muted-foreground">
              Three glimpses of what your data actually looks like on the platform — illustrative examples, not real athletes.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Match log preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-2xl border border-border shadow-card p-6 flex flex-col"
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Match log</div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">vs.</div>
                  <div className="font-display font-bold text-foreground text-base leading-tight">Cape Town FC U-19</div>
                  <div className="text-xs text-muted-foreground mt-1">Match Day 12 · 2026</div>
                </div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-stat-green/15 border border-stat-green/30 text-[11px] font-bold text-stat-green">
                  WIN · 3–1
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Goals</div>
                  <div className="font-display font-bold text-2xl text-foreground tabular-nums leading-none">2</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Assists</div>
                  <div className="font-display font-bold text-2xl text-foreground tabular-nums leading-none">1</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Minutes</div>
                  <div className="font-display font-bold text-2xl text-foreground tabular-nums leading-none">82</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Rating</div>
                  <div className="font-display font-bold text-2xl text-foreground tabular-nums leading-none">7.8<span className="text-sm text-muted-foreground font-normal ml-0.5">/10</span></div>
                </div>
              </div>

              <div className="mt-auto inline-flex items-center gap-2 text-xs text-stat-green font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified by Royal Stars Academy
              </div>
            </motion.div>

            {/* Fitness panel preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-card rounded-2xl border border-border shadow-card p-6 flex flex-col"
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Fitness profile</div>
              <div className="font-display font-bold text-foreground text-base mb-4">Latest test results</div>
              <div className="space-y-3 flex-1">
                {FITNESS.map((m, i) => (
                  <div key={m.label} className="flex items-center gap-3 text-xs">
                    <span className="w-28 font-medium text-foreground flex-shrink-0">{m.label}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${m.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.3 + i * 0.07 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    <span className="font-bold text-foreground tabular-nums w-16 text-right flex-shrink-0">
                      {m.value}<span className="text-muted-foreground font-normal text-[10px] ml-0.5">{m.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-border text-xs text-muted-foreground">
                Last test: 2 weeks ago
              </div>
            </motion.div>

            {/* Profile snapshot preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-card rounded-2xl border border-border shadow-card p-6 flex flex-col"
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Profile snapshot</div>

              {/* Avatar + name */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/15 border-2 border-primary/30 flex items-center justify-center font-display font-bold text-primary text-lg shadow-glow flex-shrink-0">
                  TM
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-foreground leading-tight">Thabo Molefe</div>
                  <div className="text-xs text-muted-foreground">Football · Striker · Gauteng, SA</div>
                </div>
              </div>

              {/* Level pill */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary/10 to-gold/10 border border-primary/20 mb-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">Level 7</div>
                  <div className="font-display font-bold text-foreground">Elite</div>
                </div>
                <Trophy className="h-7 w-7 text-gold" />
              </div>

              {/* Stat row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <div className="font-display font-bold text-lg text-foreground tabular-nums">24</div>
                  <div className="text-[10px] text-muted-foreground">Matches</div>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <div className="font-display font-bold text-lg text-foreground tabular-nums">18</div>
                  <div className="text-[10px] text-muted-foreground">Goals</div>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <div className="font-display font-bold text-lg text-foreground tabular-nums">3</div>
                  <div className="text-[10px] text-muted-foreground">Achieved</div>
                </div>
              </div>

              <div className="mt-auto inline-flex items-center gap-2 text-xs text-primary font-semibold">
                <Eye className="h-3.5 w-3.5" /> Visible to scouts
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION: Get verified */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Get verified.</h2>
            <p className="text-muted-foreground">
              Anyone can claim numbers. Even Playground stats earn a green tick the moment your club signs off — that's where they start mattering.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4 relative">
              {/* Connector line on desktop */}
              <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-0.5 bg-border" aria-hidden />
              {VERIFY_STEPS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="relative bg-card rounded-2xl border border-border shadow-card p-6"
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-card border-2 border-primary/30 flex items-center justify-center text-primary z-10 shadow-sm flex-shrink-0">
                      <s.icon className="h-6 w-6" />
                    </div>
                    <div className="pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5">{s.label}</div>
                      <h4 className="font-display font-bold text-foreground text-base leading-tight">{s.title}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Climb through the ranks */}
      <section className="py-24 bg-muted/30 border-t border-border">
        <div className="container">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Climb through the ranks.</h2>
            <p className="text-muted-foreground">
              Ten levels, named tiers, visible progression. The more you log, train, and verify, the more you earn — and the higher you climb.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-card rounded-3xl border border-border shadow-card overflow-hidden">
            {LEVELS.map((l, i) => {
              const isLast = l.level === LEVELS.length;
              return (
                <motion.div
                  key={l.level}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={`relative flex items-center gap-5 p-5 ${
                    !isLast ? "border-b border-border" : ""
                  } ${l.highlight ? "bg-gradient-to-r from-primary/5 via-gold/5 to-transparent" : ""}`}
                >
                  {/* Level badge */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold tabular-nums flex-shrink-0 ${
                    isLast
                      ? "bg-gradient-to-br from-gold to-gold/70 text-foreground shadow-md"
                      : l.highlight
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary"
                  }`}>
                    {l.level}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-foreground leading-tight">{l.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{l.blurb}</div>
                  </div>

                  {l.xpToNext !== null ? (
                    <div className="hidden sm:block text-right flex-shrink-0">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">to next</div>
                      <div className="font-bold text-foreground tabular-nums text-sm">{formatNumber(l.xpToNext)} <span className="font-normal text-muted-foreground">XP</span></div>
                    </div>
                  ) : (
                    <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                      <Trophy className="h-4 w-4 text-gold" />
                      <span className="text-xs font-bold text-gold uppercase tracking-wider">Top</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground mt-6 text-center max-w-2xl mx-auto">
            XP comes from logged matches, recorded fitness tests, earned achievements, and institution verifications.
            The more you do, the faster you climb.
          </p>
        </div>
      </section>

      {/* SECTION: Get found in the Zone */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Get found in the Zone.</h2>
            <p className="text-muted-foreground">
              The Zone is where scouts and institutions search for talent. Filter by sport, position, level, rating — and your verified profile shows up.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-card rounded-3xl border border-border shadow-card overflow-hidden">
            {/* Filter bar */}
            <div className="p-5 border-b border-border bg-muted/20">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1">Filters</div>
                {ZONE_FILTERS.map((f) => (
                  <div key={f.label} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-xs">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className="font-semibold text-foreground">{f.value}</span>
                  </div>
                ))}
                <div className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                  <Search className="h-3 w-3" /> {ZONE_RESULTS.length} matches
                </div>
              </div>
            </div>

            {/* Result rows */}
            <div className="divide-y divide-border">
              {ZONE_RESULTS.map((r, i) => (
                <motion.div
                  key={r.initials}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center font-display font-bold text-primary text-sm flex-shrink-0">
                    {r.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-0.5">
                      <span className="font-display font-semibold text-foreground text-sm">{r.name}</span>
                      <span className="text-xs text-muted-foreground">· {r.region}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-bold text-primary tabular-nums">
                        L{r.level} · {r.levelName}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{r.sport} · {r.pos}</div>
                  </div>
                  <div className="hidden sm:flex items-center gap-5 text-xs">
                    <div className="text-right">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg rating</div>
                      <div className="font-display font-bold text-foreground tabular-nums">{r.rating}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Goals</div>
                      <div className="font-display font-bold text-foreground tabular-nums">{r.goals}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-6 text-center max-w-2xl mx-auto">
            Example results — real Zone search returns athletes from the founding cohort.
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Stats;
