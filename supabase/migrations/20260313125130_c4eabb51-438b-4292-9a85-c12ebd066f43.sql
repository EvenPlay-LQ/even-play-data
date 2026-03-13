
-- =====================================================
-- Even Playground: Complete Database Schema
-- =====================================================

-- 1. App Role Enum
CREATE TYPE public.app_role AS ENUM ('athlete', 'institution', 'coach', 'referee', 'scout', 'fan');

-- 2. User Type Enum
CREATE TYPE public.user_type AS ENUM ('athlete', 'institution', 'fan');

-- 3. Verification Status Enum
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');

-- 4. Match Status Enum
CREATE TYPE public.match_status AS ENUM ('scheduled', 'live', 'completed', 'cancelled');

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  avatar TEXT,
  bio TEXT DEFAULT '',
  favorite_sport TEXT DEFAULT '',
  user_type public.user_type NOT NULL DEFAULT 'fan',
  reputation INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Institutions
CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution_name TEXT NOT NULL,
  institution_type TEXT NOT NULL DEFAULT 'school',
  registration_number TEXT,
  country TEXT DEFAULT '',
  province TEXT DEFAULT '',
  physical_address TEXT DEFAULT '',
  website TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  primary_contact_name TEXT DEFAULT '',
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Athletes
CREATE TABLE public.athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport TEXT NOT NULL DEFAULT '',
  position TEXT DEFAULT '',
  date_of_birth DATE,
  level INTEGER NOT NULL DEFAULT 1,
  xp_points INTEGER NOT NULL DEFAULT 0,
  performance_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  country TEXT DEFAULT '',
  province TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Teams
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  sport TEXT NOT NULL DEFAULT '',
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  season TEXT DEFAULT '',
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Team Members
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  jersey_number INTEGER,
  position TEXT DEFAULT '',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (team_id, athlete_id)
);

-- Matches
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  away_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  competition TEXT DEFAULT '',
  location TEXT DEFAULT '',
  match_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  status public.match_status NOT NULL DEFAULT 'scheduled',
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Match Stats
CREATE TABLE public.match_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  goals INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  minutes_played INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3,1) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, athlete_id)
);

-- Achievements
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT 'trophy',
  date_earned TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Verifications
CREATE TABLE public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  status public.verification_status NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  digital_signature TEXT,
  documents TEXT[] DEFAULT '{}',
  verification_date TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Posts (Buzz feed)
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comments
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Likes
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

-- Community Groups
CREATE TABLE public.community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT,
  sport TEXT DEFAULT '',
  member_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Merchandise
CREATE TABLE public.merchandise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT DEFAULT 'apparel',
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- has_role: Security definer function for RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- get_user_type: Get user type from profiles without recursion
CREATE OR REPLACE FUNCTION public.get_user_type(_user_id UUID)
RETURNS public.user_type
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_type FROM public.profiles WHERE id = _user_id
$$;

-- handle_new_user: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::public.user_type, 'fan')
  );

  -- Also create user_role based on user_type
  IF NEW.raw_user_meta_data->>'user_type' = 'athlete' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'athlete');
  ELSIF NEW.raw_user_meta_data->>'user_type' = 'institution' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'institution');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'fan');
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER athletes_updated_at BEFORE UPDATE ON public.athletes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- User Roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'));

-- Institutions
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read institutions" ON public.institutions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners can manage institutions" ON public.institutions FOR ALL TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- Athletes
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read athletes" ON public.athletes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners can manage own athlete" ON public.athletes FOR ALL TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- Teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read teams" ON public.teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Institution owners manage teams" ON public.teams FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.institutions WHERE id = teams.institution_id AND profile_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.institutions WHERE id = teams.institution_id AND profile_id = auth.uid()));

-- Team Members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read team members" ON public.team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Institution owners manage members" ON public.team_members FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.teams t JOIN public.institutions i ON i.id = t.institution_id
    WHERE t.id = team_members.team_id AND i.profile_id = auth.uid()
  ));

-- Matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read matches" ON public.matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Institution owners manage matches" ON public.matches FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.teams t JOIN public.institutions i ON i.id = t.institution_id
    WHERE (t.id = matches.home_team_id OR t.id = matches.away_team_id) AND i.profile_id = auth.uid()
  ));

-- Match Stats
ALTER TABLE public.match_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read match stats" ON public.match_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Institution owners manage stats" ON public.match_stats FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.matches m
    JOIN public.teams t ON (t.id = m.home_team_id OR t.id = m.away_team_id)
    JOIN public.institutions i ON i.id = t.institution_id
    WHERE m.id = match_stats.match_id AND i.profile_id = auth.uid()
  ));

-- Achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read achievements" ON public.achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Athletes manage own achievements" ON public.achievements FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.athletes WHERE id = achievements.athlete_id AND profile_id = auth.uid()));

-- Verifications
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read verifications" ON public.verifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Institution users manage verifications" ON public.verifications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'institution'));

-- Posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read posts" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors can update own posts" ON public.posts FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors can delete own posts" ON public.posts FOR DELETE TO authenticated USING (author_id = auth.uid());

-- Comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read comments" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors can delete own comments" ON public.comments FOR DELETE TO authenticated USING (author_id = auth.uid());

-- Likes
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read likes" ON public.likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can toggle own likes" ON public.likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can remove own likes" ON public.likes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Community Groups
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read groups" ON public.community_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create groups" ON public.community_groups FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- Merchandise
ALTER TABLE public.merchandise ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read merchandise" ON public.merchandise FOR SELECT TO authenticated USING (true);

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institution users can read audit logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'institution'));
