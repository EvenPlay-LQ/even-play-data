import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rss, X, ExternalLink, Clock, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const RSS_URL = "https://rss.app/feeds/tMBQNojSfAmTz0Uc.xml";
// Use a public CORS proxy so the browser can fetch the XML
const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}`;

interface RssItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  image?: string;
}

function parseRssXml(xml: string): RssItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const items = Array.from(doc.querySelectorAll("item")).slice(0, 10);

  return items.map((item) => {
    const get = (tag: string) => item.querySelector(tag)?.textContent?.trim() ?? "";
    // Try media:content, enclosure, or og:image for images
    const mediaContent = item.querySelector("content")?.getAttribute("url") ?? "";
    const enclosure = item.querySelector("enclosure")?.getAttribute("url") ?? "";
    return {
      title: get("title"),
      description: get("description").replace(/<[^>]+>/g, "").slice(0, 160),
      link: get("link"),
      pubDate: get("pubDate"),
      image: mediaContent || enclosure || "",
    };
  });
}

function timeAgo(dateStr: string): string {
  try {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return "";
  }
}

const RssFeedWidget = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(PROXY_URL);
      if (!res.ok) throw new Error("Network error");
      const json = await res.json();
      const parsed = parseRssXml(json.contents);
      setItems(parsed);
      setLastFetched(Date.now());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-open once and fetch on first open
  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return (
    <>
      {/* Floating Ticker Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl"
      >
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 bg-card/90 backdrop-blur-md border border-primary/30 shadow-elevated rounded-xl px-4 py-3 hover:border-primary/60 transition-all group"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary flex-shrink-0">
            <Rss className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold text-primary mr-1 flex-shrink-0">LIVE FEED</span>
          <div className="flex-1 overflow-hidden text-left">
            {items.length > 0 ? (
              <p className="text-xs text-muted-foreground truncate animate-pulse">
                {items[0]?.title}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Loading local sports news...</p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </button>
      </motion.div>

      {/* Slide-in Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-background border-l border-border z-50 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <Rss className="h-4 w-4 text-primary" />
                  </span>
                  <div>
                    <h2 className="text-sm font-display font-bold text-foreground">Live Feed</h2>
                    <p className="text-[10px] text-muted-foreground">Local sports updates</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchFeed}
                    disabled={loading}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted disabled:opacity-40"
                    title="Refresh feed"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Badge row */}
              <div className="px-5 py-2.5 border-b border-border bg-muted/30 flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] h-4">
                  Community
                </Badge>
                <Badge variant="secondary" className="text-[10px] h-4">
                  Local Sports
                </Badge>
                {lastFetched && (
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    Updated {timeAgo(new Date(lastFetched).toISOString())}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {loading && items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm">Fetching latest stories...</p>
                  </div>
                ) : error && items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                    <Rss className="h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Couldn't load the live feed.</p>
                    <Button size="sm" variant="outline" onClick={fetchFeed}>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {items.map((item, i) => (
                      <motion.a
                        key={i}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex gap-3 px-5 py-4 hover:bg-muted/40 transition-colors group"
                      >
                        {item.image && (
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={item.image}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {item.pubDate && (
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Clock className="h-2.5 w-2.5" />
                                {timeAgo(item.pubDate)}
                              </span>
                            )}
                            <ExternalLink className="h-2.5 w-2.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-border bg-muted/20">
                <a
                  href={RSS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Rss className="h-3 w-3" />
                  View full RSS feed
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default RssFeedWidget;
