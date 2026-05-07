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
    details: [
      "Create a verified profile to showcase your stats and achievements.",
      "Earn XP and level up from Rookie to National Prospect.",
      "Get discovered by scouts using our verified performance data pipeline.",
      "Apply for trials, academies, and clubs directly through the platform."
    ]
  },
  {
    icon: Star,
    title: "Fans",
    description:
      "Follow your favorite athletes, join community groups, access exclusive highlights and live match updates.",
    color: "bg-gold/10 text-gold",
    details: [
      "Follow rising stars and track their journey to the top.",
      "Join community groups and connect with other passionate fans.",
      "Access exclusive highlights, interviews, and live match updates.",
      "Climb the fan leaderboard through active engagement."
    ]
  },
  {
    icon: BarChart3,
    title: "Coaches",
    description:
      "Access verified analytics, compare talent side-by-side, manage team rosters and track progression.",
    color: "bg-stat-blue/10 text-stat-blue",
    details: [
      "Build and manage your team rosters efficiently.",
      "Access detailed analytics and compare players side-by-side.",
      "Track the progression of your athletes over time.",
      "Discover new talent using our verified data pipelines."
    ]
  },
  {
    icon: Shield,
    title: "Officials",
    description:
      "Verify match results, maintain data integrity, and build trust in grassroots sports data pipelines.",
    color: "bg-stat-orange/10 text-stat-orange",
    details: [
      "Verify match results and player statistics securely.",
      "Maintain the integrity of grassroots sports data.",
      "Build trust within the community by acting as a verified source.",
      "Get recognized for contributing verified data to the ecosystem."
    ]
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

/** Footer link columns — every entry must point at a real route, never "#". */
export const FOOTER_LINKS = {
  explore: [
    { label: "Why Join", href: "/why-join" },
    { label: "Features", href: "/features" },
    { label: "Stats", href: "/stats" },
    { label: "Buzz", href: "/buzz" },
    { label: "Community", href: "/community" },
    { label: "Zone", href: "/zone" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Become a Sponsor", href: "/sponsors" },
    { label: "Contact Us", href: "/contact" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Contact Us", href: "/contact" },
  ],
};
