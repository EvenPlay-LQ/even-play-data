import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve('c:/Users/pumza/Documents/evenplayground/even-play-data/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from("athlete_invites").select(`
    id,
    profiles!invited_by (
      institutions (id, institution_name)
    )
  `).limit(1);
  console.log(JSON.stringify({data, error}, null, 2));
}

test();
