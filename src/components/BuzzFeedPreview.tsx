import { motion } from "framer-motion";
import { Eye, Search } from "lucide-react";

const TABS = [
  { label: "All", active: true },
  { label: "Transfers" },
  { label: "Youth" },
  { label: "Local" },
  { label: "International" },
  { label: "Live Feed", live: true },
];

const FEATURED = {
  category: "Youth",
  title: "Soweto Striker Bags Hat-trick in U-19 Final",
  excerpt: "16-year-old Lebo Mahlangu lifted the Gauteng Cup with a stunning second-half treble.",
  views: "1,284",
  ago: "2h ago",
};

const ITEMS = [
  { category: "Transfers",   title: "Cape Town FC Sign 16-year-old Phenomenon",   ago: "8h ago",  views: "642" },
  { category: "Local",       title: "Mamelodi Sundowns Open Trials Nationwide",    ago: "1d ago",  views: "917" },
];

const BuzzFeedPreview = () => {
  return (
    <div className="relative">
      {/* Tablet bezel */}
      <div className="bg-foreground/90 rounded-[2rem] p-2 shadow-2xl rotate-1">
        <div className="bg-background rounded-[1.6rem] p-5 sm:p-6 flex flex-col gap-4 max-h-[460px] overflow-hidden">

          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/60">
            <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground/80">Search posts...</span>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-hidden">
            {TABS.map((t) => (
              <div
                key={t.label}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                  t.active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {t.live && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stat-orange opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-stat-orange" />
                  </span>
                )}
                {t.label}
              </div>
            ))}
          </div>

          {/* Featured post */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-xl bg-gradient-hero p-4 shadow-elevated relative overflow-hidden"
          >
            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-gold/20 border border-gold/40 mb-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-gold">{FEATURED.category}</span>
            </div>
            <h5 className="font-display font-bold text-primary-foreground text-sm leading-tight mb-1.5 line-clamp-2">
              {FEATURED.title}
            </h5>
            <p className="text-[11px] text-primary-foreground/70 line-clamp-1 mb-2">{FEATURED.excerpt}</p>
            <div className="flex items-center gap-3 text-[10px] text-primary-foreground/60">
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3 w-3" /> {FEATURED.views}
              </span>
              <span>·</span>
              <span>{FEATURED.ago}</span>
            </div>
          </motion.div>

          {/* List items */}
          <div className="space-y-2">
            {ITEMS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="flex gap-3 p-2.5 bg-card rounded-lg border border-border/50"
              >
                <div className="w-12 h-12 rounded-md bg-gradient-to-br from-primary/30 to-gold/20 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-muted mb-1">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">{item.category}</span>
                  </div>
                  <div className="font-display font-semibold text-foreground text-[11px] leading-tight line-clamp-2 mb-1">{item.title}</div>
                  <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                    <span className="inline-flex items-center gap-0.5">
                      <Eye className="h-2.5 w-2.5" /> {item.views}
                    </span>
                    <span>·</span>
                    <span>{item.ago}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-6 -left-6 w-24 h-24 bg-gold/10 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
};

export default BuzzFeedPreview;
