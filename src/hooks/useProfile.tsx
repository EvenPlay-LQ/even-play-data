import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Profile {
  id: string;
  name: string;
  avatar: string | null;
  bio: string;
  favorite_sport: string;
  user_type: "athlete" | "institution" | "fan" | "master_admin";
  reputation: number;
  setup_complete: boolean;
  popia_consent: boolean;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user, isMasterAdmin } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      const profileRes = await supabase.from("profiles").select("*").eq("id", user.id).single();

      if (profileRes.data) {
        const p = profileRes.data as unknown as Profile;
        setProfile(p);
        const derivedRoles: string[] = [p.user_type];
        if (isMasterAdmin && !derivedRoles.includes("master_admin")) {
          derivedRoles.push("master_admin");
        }
        setRoles(derivedRoles);
      } else {
        setProfile(null);
        setRoles(isMasterAdmin ? ["master_admin"] : []);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, isMasterAdmin]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("Not authenticated") };
    const { error } = await supabase.from("profiles").update(updates as Record<string, unknown>).eq("id", user.id);
    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }
    return { error };
  };

  const hasRole = (role: string) => roles.includes(role) || (role !== "master_admin" && isMasterAdmin);
  const primaryRole = isMasterAdmin ? "master_admin" : roles[0] || (profile?.user_type) || "fan";
  const setupComplete = isMasterAdmin || (profile?.setup_complete === true);

  const getDashboardPath = () => {
    if (isMasterAdmin) return "/admin";
    if (!profile) return "/setup";
    if (!profile.setup_complete) return "/setup";

    switch (profile.user_type) {
      case "athlete": return "/dashboard/athlete";
      case "institution": return "/dashboard/institution";
      case "fan": return "/dashboard/parent";
      default: return "/setup";
    }
  };

  return { profile, roles, primaryRole, hasRole, isMasterAdmin, loading, updateProfile, getDashboardPath, setupComplete };
};
