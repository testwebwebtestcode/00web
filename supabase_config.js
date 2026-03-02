/* =========================================================
   Supabase Config (ROOT)
   - Put this file next to index.html
   - Replace URL + ANON KEY from:
     Supabase Dashboard -> Project Settings -> API
========================================================= */

window.SUPABASE_URL = "https://pwpriirdjhfaxtcjxmee.supabase.co";
window.SUPABASE_ANON_KEY = "sb_publishable_d43HFAfSUZJdI2yXPxPzlA_cPyXChFe";

window.supabaseClient = supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);