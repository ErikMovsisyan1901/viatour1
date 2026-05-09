// ═══════════════════════════════════════════════════════════════
//  Via Tour — Supabase Client
//  Shared by all pages. Include this script before any page script.
//  <script src="supabase.js"></script>
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL  = 'https://ctdngmrzkheydzvifjlf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZG5nbXJ6a2hleWR6dmlmamxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTg2MDEsImV4cCI6MjA5MzgzNDYwMX0.Ra06vzx0FRaWoWhLafd7mQApK_Dom4vUqon0QL2BZJ8';

// Load Supabase from CDN and expose as window.sb
(function () {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  script.onload = () => {
    window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    // Fire a custom event so pages know Supabase is ready
    document.dispatchEvent(new Event('supabase:ready'));
  };
  document.head.appendChild(script);
})();

// ── AUTH HELPERS ─────────────────────────────────────────────────

/** Returns the current logged-in user, or null */
async function getCurrentUser() {
  if (!window.sb) return null;
  const { data: { user } } = await window.sb.auth.getUser();
  return user;
}

/** Returns the profile row (includes role) for the current user */
async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await window.sb
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return data;
}

/** Returns true if the current user is an admin or superadmin */
async function isAdmin() {
  const profile = await getCurrentProfile();
  return profile && ['admin', 'superadmin'].includes(profile.role);
}

/** Returns true if the current user is a superadmin */
async function isSuperAdmin() {
  const profile = await getCurrentProfile();
  return profile?.role === 'superadmin';
}

/** Sign out and redirect to home */
async function signOut() {
  await window.sb.auth.signOut();
  window.location.href = 'index.html';
}

// ── HEADER AUTH STATE ────────────────────────────────────────────
// Automatically updates Sign In / Sign Up buttons in the header
// to show the user's name and a Sign Out button when logged in.
document.addEventListener('supabase:ready', async () => {
  const user    = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;

  const signinBtn  = document.querySelector('.btn-signin');
  const signupBtn  = document.querySelector('.btn-signup');

  if (user && signinBtn && signupBtn) {
    const name = profile?.full_name || user.email.split('@')[0];
    signinBtn.textContent = name;
    signinBtn.onclick = () => window.location.href = profile?.role !== 'user' ? 'admin.html' : '#';
    signupBtn.textContent = 'Sign Out';
    signupBtn.style.background = '#c0392b';
    signupBtn.onclick = signOut;
  } else if (signinBtn) {
    signinBtn.onclick = () => window.location.href = 'signin.html';
    if (signupBtn) signupBtn.onclick = () => window.location.href = 'signin.html?tab=signup';
  }
});
