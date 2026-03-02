/* =========================================================
   Supabase Config (ROOT)
   - Put this file next to index.html
   - Replace URL + ANON KEY from:
     Supabase Dashboard -> Project Settings -> API
========================================================= */

window.SUPABASE_URL = "https://pwpriirdjhfaxtcjxmee.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cHJpaXJkamhmYXh0Y2p4bWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDUyMDgsImV4cCI6MjA4NTI4MTIwOH0.M2btwcTtWyTNgY2kCgiUEhv7yXIcEN7rWuLkzzDC8Pk";

window.sb = supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);