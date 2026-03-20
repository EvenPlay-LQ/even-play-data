import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

/**
 * Hook providing master-admin-only operations.
 * All mutating actions are automatically audit-logged.
 */
export const useMasterAdmin = () => {
  const { user, isMasterAdmin } = useAuth();

  /* ───── helpers ───── */

  const auditAction = useCallback(
    async (action: string, targetUserId?: string, targetEntity?: string, targetEntityId?: string, details?: Record<string, unknown>) => {
      if (!user) return;
      await supabase.from("admin_audit_logs" as any).insert([{
        actor_id: user.id,
        action,
        target_user_id: targetUserId ?? null,
        target_entity: targetEntity ?? null,
        target_entity_id: targetEntityId ?? null,
        details: details ?? {},
      }]);
    },
    [user]
  );

  /* ───── user management ───── */

  /** Fetch all platform users with profile + roles */
  const getAllUsers = useCallback(async (search?: string) => {
    let query = supabase
      .from("profiles")
      .select("*, user_roles(role), athletes(id, sport, institution_id), institutions(id, institution_name)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (search?.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }
    const { data, error } = await query;
    return { data: data ?? [], error };
  }, []);

  /** Fetch detailed info for a single user */
  const getUserDetail = useCallback(async (userId: string) => {
    const [profileRes, rolesRes, athleteRes, instRes, auditRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("user_roles").select("*").eq("user_id", userId),
      supabase.from("athletes").select("*, institutions(institution_name)").eq("profile_id", userId).maybeSingle(),
      supabase.from("institutions").select("*").eq("profile_id", userId).maybeSingle(),
      supabase.from("audit_logs").select("*").eq("performed_by", userId).order("created_at", { ascending: false }).limit(30),
    ]);
    return {
      profile: profileRes.data,
      roles: (rolesRes.data ?? []).map((r: any) => r.role),
      athlete: athleteRes.data,
      institution: instRes.data,
      recentAuditLogs: auditRes.data ?? [],
    };
  }, []);

  /** Update a user's role */
  const updateUserRole = useCallback(
    async (userId: string, newRole: string) => {
      if (!isMasterAdmin) return { error: new Error("Unauthorized") };
      if (newRole === "master_admin") return { error: new Error("Cannot assign master_admin role via UI") };

      // Update profile user_type
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ user_type: newRole } as any)
        .eq("id", userId);
      if (profileErr) return { error: profileErr };

      // Update user_roles — delete existing non-master_admin roles, insert new
      await supabase.from("user_roles").delete().eq("user_id", userId).neq("role", "master_admin" as any);
      const { error: roleErr } = await supabase.from("user_roles").insert([{ user_id: userId, role: newRole } as any]);

      await auditAction("role_change", userId, "user_roles", undefined, { new_role: newRole });
      return { error: roleErr };
    },
    [isMasterAdmin, auditAction]
  );

  /** Delete a user profile (cascades via FK) */
  const deleteUser = useCallback(
    async (userId: string) => {
      if (!isMasterAdmin) return { error: new Error("Unauthorized") };
      await auditAction("user_delete", userId, "profiles");
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      return { error };
    },
    [isMasterAdmin, auditAction]
  );

  /* ───── diagnostics ───── */

  /** Fetch admin audit log entries */
  const getAuditLog = useCallback(async (limit = 50) => {
    const { data, error } = await supabase
      .from("admin_audit_logs" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return { data: data ?? [], error };
  }, []);

  /** Get platform-wide counts for the admin overview */
  const getPlatformStats = useCallback(async () => {
    const [profiles, athletes, institutions, posts, matches] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("athletes").select("id", { count: "exact", head: true }),
      supabase.from("institutions").select("id", { count: "exact", head: true }),
      supabase.from("posts").select("id", { count: "exact", head: true }),
      supabase.from("matches").select("id", { count: "exact", head: true }),
    ]);
    return {
      totalUsers: profiles.count ?? 0,
      totalAthletes: athletes.count ?? 0,
      totalInstitutions: institutions.count ?? 0,
      totalPosts: posts.count ?? 0,
      totalMatches: matches.count ?? 0,
    };
  }, []);

  return {
    isMasterAdmin,
    auditAction,
    getAllUsers,
    getUserDetail,
    updateUserRole,
    deleteUser,
    getAuditLog,
    getPlatformStats,
  };
};
