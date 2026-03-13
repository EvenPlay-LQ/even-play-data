
SET session_replication_role = 'replica';

-- Demo Profiles
INSERT INTO public.profiles (id, name, avatar, user_type, favorite_sport, bio, reputation) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Marcus Johnson', '', 'athlete', 'Football', 'Striker at Cape Town Academy. Dreaming big.', 120),
  ('22222222-2222-2222-2222-222222222222', 'Amara Okafor', '', 'athlete', 'Football', 'Creative midfielder with vision.', 95),
  ('33333333-3333-3333-3333-333333333333', 'Sarah Chen', '', 'athlete', 'Athletics', 'Sprinter chasing records.', 180),
  ('44444444-4444-4444-4444-444444444444', 'David Nkosi', '', 'athlete', 'Rugby', 'Fly-half. Rugby is life.', 65),
  ('55555555-5555-5555-5555-555555555555', 'Cape Town Academy', '', 'institution', 'Football', 'Premier youth development academy in the Western Cape.', 250)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'athlete'),
  ('22222222-2222-2222-2222-222222222222', 'athlete'),
  ('33333333-3333-3333-3333-333333333333', 'athlete'),
  ('44444444-4444-4444-4444-444444444444', 'athlete'),
  ('55555555-5555-5555-5555-555555555555', 'institution')
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.institutions (id, profile_id, institution_name, institution_type, country, province, contact_email, website) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'Cape Town Academy', 'academy', 'South Africa', 'Western Cape', 'info@ctacademy.co.za', 'https://ctacademy.co.za')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.athletes (id, profile_id, sport, position, institution_id, level, xp_points, performance_score, country, province) VALUES
  ('aa111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Football', 'Striker', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, 2450, 78, 'South Africa', 'Western Cape'),
  ('aa222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Football', 'Midfielder', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 6, 3100, 82, 'Nigeria', 'Lagos'),
  ('aa333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Athletics', 'Sprinter', NULL, 8, 5200, 91, 'South Africa', 'Gauteng'),
  ('aa444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Rugby', 'Fly-half', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, 1800, 74, 'South Africa', 'KwaZulu-Natal')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.teams (id, institution_id, team_name, sport, season) VALUES
  ('bb111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CT Academy First XI', 'Football', '2025'),
  ('bb222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CT Academy Rugby XV', 'Rugby', '2025')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.team_members (team_id, athlete_id, jersey_number, position) VALUES
  ('bb111111-1111-1111-1111-111111111111', 'aa111111-1111-1111-1111-111111111111', 9, 'Striker'),
  ('bb111111-1111-1111-1111-111111111111', 'aa222222-2222-2222-2222-222222222222', 10, 'Midfielder'),
  ('bb222222-2222-2222-2222-222222222222', 'aa444444-4444-4444-4444-444444444444', 10, 'Fly-half');

INSERT INTO public.matches (id, home_team_id, away_team_id, match_date, status, home_score, away_score, competition, location) VALUES
  ('cc111111-1111-1111-1111-111111111111', 'bb111111-1111-1111-1111-111111111111', 'bb222222-2222-2222-2222-222222222222', '2025-03-10T15:00:00Z', 'completed', 3, 1, 'Youth League', 'Cape Town Stadium'),
  ('cc222222-2222-2222-2222-222222222222', 'bb111111-1111-1111-1111-111111111111', 'bb222222-2222-2222-2222-222222222222', '2025-03-05T14:00:00Z', 'completed', 1, 1, 'Youth League', 'Newlands'),
  ('cc333333-3333-3333-3333-333333333333', 'bb111111-1111-1111-1111-111111111111', 'bb222222-2222-2222-2222-222222222222', '2025-02-28T16:00:00Z', 'completed', 2, 0, 'Friendly', 'Green Point'),
  ('cc444444-4444-4444-4444-444444444444', 'bb111111-1111-1111-1111-111111111111', 'bb222222-2222-2222-2222-222222222222', '2025-03-22T15:00:00Z', 'scheduled', NULL, NULL, 'Youth League', 'Cape Town Stadium');

INSERT INTO public.match_stats (match_id, athlete_id, goals, assists, minutes_played, rating) VALUES
  ('cc111111-1111-1111-1111-111111111111', 'aa111111-1111-1111-1111-111111111111', 2, 1, 90, 8.5),
  ('cc111111-1111-1111-1111-111111111111', 'aa222222-2222-2222-2222-222222222222', 1, 2, 90, 8.0),
  ('cc222222-2222-2222-2222-222222222222', 'aa111111-1111-1111-1111-111111111111', 0, 1, 85, 7.2),
  ('cc222222-2222-2222-2222-222222222222', 'aa222222-2222-2222-2222-222222222222', 1, 0, 90, 7.5),
  ('cc333333-3333-3333-3333-333333333333', 'aa111111-1111-1111-1111-111111111111', 1, 0, 90, 7.8),
  ('cc333333-3333-3333-3333-333333333333', 'aa222222-2222-2222-2222-222222222222', 0, 1, 75, 7.0);

INSERT INTO public.achievements (athlete_id, title, description, icon) VALUES
  ('aa111111-1111-1111-1111-111111111111', 'Top Scorer', 'Season 2025 leading scorer', 'trophy'),
  ('aa111111-1111-1111-1111-111111111111', '5 Match Streak', 'Won 5 consecutive matches', 'flame'),
  ('aa111111-1111-1111-1111-111111111111', 'Man of the Match', 'Awarded 3 times', 'star'),
  ('aa222222-2222-2222-2222-222222222222', 'Playmaker', '10+ assists this season', 'zap'),
  ('aa333333-3333-3333-3333-333333333333', 'Record Breaker', 'Provincial 100m record', 'trophy'),
  ('aa444444-4444-4444-4444-444444444444', 'Debut Star', 'Outstanding first match', 'star');

INSERT INTO public.posts (author_id, title, content, category, views) VALUES
  ('11111111-1111-1111-1111-111111111111', 'CT Academy dominates Youth League opener', 'Cape Town Academy kicked off their 2025 Youth League campaign with a commanding 3-1 victory.', 'local', 342),
  ('22222222-2222-2222-2222-222222222222', 'Youth development: The future of SA football', 'Investing in grassroots programs is key to building a world-class national team.', 'youth', 567),
  ('33333333-3333-3333-3333-333333333333', 'New provincial record at Western Cape Championships', 'Sarah Chen blazed through the 100m in a record-breaking time.', 'local', 891),
  ('55555555-5555-5555-5555-555555555555', 'Transfer window: Top prospects to watch', 'Several promising athletes have caught the eye of top-tier institutions.', 'transfers', 1203),
  ('11111111-1111-1111-1111-111111111111', 'Match Day Preview: CT Academy vs Durban Stars', 'All eyes on the upcoming clash.', 'local', 234),
  ('44444444-4444-4444-4444-444444444444', 'Rugby season preview: What to expect in 2025', 'A comprehensive look at the upcoming rugby season.', 'youth', 456),
  ('22222222-2222-2222-2222-222222222222', 'International scouts visiting SA academies', 'Multiple international scouts have confirmed visits.', 'international', 789),
  ('33333333-3333-3333-3333-333333333333', 'Training tips: How to improve your sprint time', 'Professional sprinter shares training secrets.', 'youth', 345);

INSERT INTO public.community_groups (name, description, sport, member_count, created_by) VALUES
  ('Football Fanatics SA', 'The home for South African football fans', 'Football', 1250, '11111111-1111-1111-1111-111111111111'),
  ('Rugby Republic', 'Everything rugby in South Africa', 'Rugby', 890, '44444444-4444-4444-4444-444444444444'),
  ('Track & Field Stars', 'Athletics community for aspiring champions', 'Athletics', 430, '33333333-3333-3333-3333-333333333333');

INSERT INTO public.merchandise (name, description, category, price, in_stock) VALUES
  ('EP Classic Tee', 'Premium cotton t-shirt with Even Playground logo', 'apparel', 299.99, true),
  ('Performance Cap', 'Breathable sports cap with EP branding', 'accessories', 149.99, true),
  ('Training Hoodie', 'Warm-up hoodie for game day', 'apparel', 549.99, true),
  ('EP Water Bottle', 'Stainless steel 750ml sports bottle', 'accessories', 199.99, true);

INSERT INTO public.verifications (entity_type, entity_id, status, notes) VALUES
  ('athlete', 'aa111111-1111-1111-1111-111111111111', 'verified', 'Identity and age verified'),
  ('athlete', 'aa222222-2222-2222-2222-222222222222', 'pending', 'Awaiting document review'),
  ('athlete', 'aa444444-4444-4444-4444-444444444444', 'pending', 'Birth certificate required');

SET session_replication_role = 'origin';
