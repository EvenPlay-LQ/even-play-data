-- 1. ALTER TABLE profiles ADD COLUMNS
ALTER TABLE profiles ADD COLUMN popia_consent boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN popia_consent_date timestamptz;
ALTER TABLE profiles ADD COLUMN popia_consent_version text DEFAULT '1.0';
ALTER TABLE profiles ADD COLUMN secondary_roles text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free','community','player_profile','school','club'));
ALTER TABLE profiles ADD COLUMN subscription_active boolean DEFAULT false;

-- 2. ALTER TABLE athletes ADD COLUMNS
ALTER TABLE athletes ADD COLUMN squad text;
ALTER TABLE athletes ADD COLUMN position_abbreviation text;
ALTER TABLE athletes ADD COLUMN nationality text;
ALTER TABLE athletes ADD COLUMN date_of_birth date;
ALTER TABLE athletes ADD COLUMN height_cm numeric(5,1);
ALTER TABLE athletes ADD COLUMN weight_kg numeric(5,1);
ALTER TABLE athletes ADD COLUMN mysafa_id text;
ALTER TABLE athletes ADD COLUMN fifa_id text;
ALTER TABLE athletes ADD COLUMN playing_style text;
ALTER TABLE athletes ADD COLUMN profile_slug text UNIQUE;

-- 3. ALTER TABLE institutions ADD COLUMNS
ALTER TABLE institutions ADD COLUMN institution_type text CHECK (institution_type IN ('school','club','federation','academy'));
ALTER TABLE institutions ADD COLUMN sport_codes text[] DEFAULT '{}';
ALTER TABLE institutions ADD COLUMN safa_affiliation_number text;
ALTER TABLE institutions ADD COLUMN sasa_registration_number text;
ALTER TABLE institutions ADD COLUMN province text;
ALTER TABLE institutions ADD COLUMN website_url text;
ALTER TABLE institutions ADD COLUMN contact_phone text;

-- 4. CREATE TABLE parents
CREATE TABLE parents (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
   contact_phone text,
   relationship_to_child text DEFAULT 'parent',
   created_at timestamptz DEFAULT now()
);

-- 5. CREATE TABLE parent_athlete_links
CREATE TABLE parent_athlete_links (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   parent_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
   athlete_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
   verified boolean DEFAULT false,
   verification_code text,
   linked_at timestamptz,
   created_at timestamptz DEFAULT now(),
   UNIQUE(parent_user_id, athlete_user_id)
);

-- 6. Row Level Security Policies
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own parent profile" ON parents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own parent profile" ON parents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own parent profile" ON parents FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE parent_athlete_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view links they created" ON parent_athlete_links FOR SELECT USING (auth.uid() = parent_user_id);
CREATE POLICY "Parents can insert their links" ON parent_athlete_links FOR INSERT WITH CHECK (auth.uid() = parent_user_id);
CREATE POLICY "Parents can update their links" ON parent_athlete_links FOR UPDATE USING (auth.uid() = parent_user_id);

-- Allow athletes to see pending parent links pointing to them
CREATE POLICY "Athletes can view links pointing to them" ON parent_athlete_links FOR SELECT USING (auth.uid() = athlete_user_id);
CREATE POLICY "Athletes can update links pointing to them (to verify)" ON parent_athlete_links FOR UPDATE USING (auth.uid() = athlete_user_id);

-- 7. Indexes
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX idx_profiles_subscription_active ON profiles(subscription_active);
