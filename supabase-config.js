const SUPABASE_URL = "https://mkquvtrzxjefjvcjyjoa.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_mHCn287RBRVyBLv-fh4taQ_0OSP43p5 ";
window.supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);