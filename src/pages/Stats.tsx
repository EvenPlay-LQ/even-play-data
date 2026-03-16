import { motion } from "framer-motion";
import { MarketingLayout } from "@/components/MarketingLayout";
import { SEO } from "@/components/SEO";
import { LANDING_STATS } from "@/config/landing";
import { 
  BarChart3, TrendingUp, Users, Globe, Trophy, 
  Target, ShieldCheck, MapIcon, AreaChart
} from "lucide-react";

const Stats = () => {
  return (
    <MarketingLayout>
      <SEO 
        title="Stats & Insights | Even Playground"
        description="Explore the data-driven growth and verified performance metrics of the Even Playground community."
      />

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-background border-b border-border overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10" />
        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6">
              Data That Tells <br />
              <span className="text-gradient-energy">The Real Story</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We're building the world's most trusted sports data ecosystem. 
              Track growth, verified milestones, and global performance trends.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Global Impact Summary */}
      <section className="py-24 bg-card">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {LANDING_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/10 transition-colors shadow-sm">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Growth Insights */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
               {/* Visual interpretation of a growth chart */}
               <div className="aspect-[4/3] bg-muted/20 rounded-3xl border border-border p-8 flex flex-col shadow-elevated">
                  <div className="flex justify-between items-center mb-8">
                     <div>
                        <h4 className="font-bold text-foreground">User Growth Retention</h4>
                        <p className="text-xs text-muted-foreground">Monthly Active Athletes</p>
                     </div>
                     <div className="flex gap-1">
                        <div className="w-8 h-2 bg-primary rounded-full" />
                        <div className="w-8 h-2 bg-muted rounded-full" />
                     </div>
                  </div>
                  <div className="flex-1 flex items-end gap-3 px-2">
                     {[40, 65, 45, 80, 55, 90, 75, 100].map((h, i) => (
                       <motion.div 
                        key={i} 
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 1 }}
                        className="flex-1 bg-gradient-to-t from-primary/40 to-primary rounded-t-lg relative group"
                       >
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                             +{h}% growth
                          </div>
                       </motion.div>
                     ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-border flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                     <span>Oct</span>
                     <span>Nov</span>
                     <span>Dec</span>
                     <span>Jan</span>
                     <span>Feb</span>
                     <span>Mar</span>
                  </div>
               </div>
               <div className="absolute -top-6 -right-6 w-24 h-24 bg-gold/10 rounded-full blur-2xl" />
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-energy/10 mb-6 font-bold text-xs uppercase tracking-widest text-primary">
                 <TrendingUp className="h-3.5 w-3.5" /> Growth Analytics
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Unprecedented Momentum</h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Even Playground is rapidly expanding its footprint across Africa. 
                Our community is growing not just in numbers, but in the depth of data 
                verified every single day.
              </p>
              
              <div className="space-y-6">
                 {[
                   { icon: AreaChart, title: "85% Verification Rate", desc: "Most logged activities are verified by registered institutions within 48 hours." },
                   { icon: ShieldCheck, title: "Data Integrity Focus", desc: "Leveraging distributed ledger patterns to ensure match data is immutable and fair." },
                   { icon: MapIcon, title: "12+ Operating Regions", desc: "Expanding rapidly to provide opportunities for talent in every corner." }
                 ].map((item, idx) => (
                   <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-card border border-border">
                      <div className="p-2 bg-primary/10 rounded-lg h-fit">
                         <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                         <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                         <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Metric Cards */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
             <div className="p-8 rounded-3xl bg-card border border-border shadow-sm text-center">
                <Trophy className="h-10 w-10 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-2">4,200+</h3>
                <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
             </div>
             <div className="p-8 rounded-3xl bg-card border border-border shadow-sm text-center">
                <Target className="h-10 w-10 text-gold mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-2">150+</h3>
                <p className="text-sm text-muted-foreground">Scout Opportunities</p>
             </div>
             <div className="p-8 rounded-3xl bg-card border border-border shadow-sm text-center">
                <Globe className="h-10 w-10 text-stat-blue mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-2">24h</h3>
                <p className="text-sm text-muted-foreground">Real-time Data Updates</p>
             </div>
          </div>
        </div>
      </section>

    </MarketingLayout>
  );
};

export default Stats;
