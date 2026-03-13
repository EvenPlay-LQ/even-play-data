import {
  Trophy, BarChart3, Shield, Users, Newspaper, Target,
  Star, Zap,
} from "lucide-react";

/** Hero stats bar */
export const LANDING_STATS = [
  { value: "1,000+", label: "Athletes", icon: Users },
  { value: "200+", label: "Scouts", icon: Target },
  { value: "50+", label: "Stories", icon: Newspaper },
  { value: "15+", label: "Sports", icon: Trophy },
];

/** "Why Join" persona cards */
export const WHY_JOIN_CARDS = [
  {
    icon: Zap,
    title: "Athletes",
    description:
      "Track your performance, earn XP, level up from Rookie to National Prospect. Get discovered by scouts worldwide.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Star,
    title: "Fans",
    description:
      "Follow your favorite athletes, join community groups, access exclusive highlights and live match updates.",
    color: "bg-gold/10 text-gold",
  },
  {
    icon: BarChart3,
    title: "Coaches",
    description:
      "Access verified analytics, compare talent side-by-side, manage team rosters and track progression.",
    color: "bg-stat-blue/10 text-stat-blue",
  },
  {
    icon: Shield,
    title: "Officials",
    description:
      "Verify match results, maintain data integrity, and build trust in grassroots sports data pipelines.",
    color: "bg-stat-orange/10 text-stat-orange",
  },
];

/** "See What's Inside" feature sections */
export const FEATURE_SECTIONS = [
  {
    icon: Newspaper,
    title: "Buzz",
    description:
      "Live sports news, transfer stories, youth highlights, and community updates in one feed.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Join groups, watch replays, shop official merch, and climb the fan leaderboard.",
  },
  {
    icon: Target,
    title: "Zone",
    description:
      "Discover talent, compare athletes side-by-side with verified stats and radar charts.",
  },
];

/** Footer link columns */
export const FOOTER_LINKS = {
  quickLinks: ["Buzz", "Community", "Zone", "About"],
  forAthletes: ["Track Performance", "Upload Highlights", "Get Verified", "Find Teams"],
  support: ["Help Center", "Privacy Policy", "Terms of Service", "Contact Us"],
};
