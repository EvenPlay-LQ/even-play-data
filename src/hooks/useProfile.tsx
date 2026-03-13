import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Profile {
  id: string;
  name: string;
  avatar: string | null;
  bio: string;
  favorite_sport: string;
  user_type: "athlete" | "institution" | "fan";
  reputation: number;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  role: "athlete" | "institution" | "coach" | "referee" | "scout" | "fan";
}

export const useProfile = () => {
  const { user } = useAuth();
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
      const [profileRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);

      if (profileRes.data) setProfile(profileRes.data as unknown as Profile);
      if (rolesRes.data) setRoles((rolesRes.data as unknown as UserRole[]).map((r) => r.role));
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("Not authenticated") };
    const { error } = await supabase.from("profiles").update(updates as Record<string, unknown>).eq("id", user.id);
    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }
    return { error };
  };

  const hasRole = (role: string) => roles.includes(role);
  const primaryRole = roles[0] || "fan";

  return { profile, roles, primaryRole, hasRole, loading, updateProfile };
};
