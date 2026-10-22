'use strict';

const { url, anonKey } = window.SUPABASE_CONFIG || {};
const { createClient } = window.supabase || {};
const loginPanel = document.querySelector('#login-panel');
const dashboardPanel = document.querySelector('#dashboard-panel');
const loginStatus = document.querySelector('#login-status');
const dashboardStatus = document.querySelector('#dashboard-status');
const loginForm = document.querySelector('#login-form');
const emailInput = document.querySelector('#admin-email');
const visitorRows = document.querySelector('#visitor-rows');
const visitorCount = document.querySelector('#visitor-count');

if (!url || !anonKey || !createClient) {
  loginStatus.textContent = 'Admin sign-in is unavailable. Please reload this page later.';
} else {
  const client = createClient(url, anonKey, { auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true } });

  async function loadVisitors() {
    dashboardStatus.textContent = 'Loading visitor records…';
    const [{ count, error: countError }, { data, error }] = await Promise.all([
      client.from('visitor_visits').select('*', { count: 'exact', head: true }),
      client.from('visitor_visits').select('ip,visit_date,recorded_at').order('recorded_at', { ascending: false }).limit(100)
    ]);
    if (countError || error) {
      dashboardStatus.textContent = 'Could not load visitor records. Check the admin access policy in Supabase.';
      visitorRows.innerHTML = '<tr><td colspan="3">Access denied or data unavailable.</td></tr>';
      return;
    }
    visitorCount.textContent = String(count ?? 0);
    if (!data?.length) {
      visitorRows.innerHTML = '<tr><td colspan="3">No visitors have accepted analytics yet.</td></tr>';
    } else {
      visitorRows.replaceChildren(...data.map(record => {
        const row = document.createElement('tr');
        [record.ip, record.visit_date, new Date(record.recorded_at).toLocaleString()].forEach(value => {
          const cell = document.createElement('td');
          cell.textContent = value;
          row.append(cell);
        });
        return row;
      }));
    }
    dashboardStatus.textContent = `Showing the latest ${data.length} records.`;
  }

  async function showSession(session) {
    const email = session?.user?.email?.toLowerCase();
    if (!session || !email) {
      dashboardPanel.hidden = true;
      loginPanel.hidden = false;
      return;
    }
    dashboardPanel.hidden = false;
    loginPanel.hidden = true;
    document.querySelector('#signed-in-email').textContent = email;
    await loadVisitors();
  }

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    if (!email) return;
    const button = loginForm.querySelector('button[type="submit"]');
    button.disabled = true;
    loginStatus.textContent = 'Sending sign-in link…';
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${window.location.pathname}` }
    });
    loginStatus.textContent = error ? 'Could not send a link. Check your email and Supabase Auth email settings.' : 'If this email can sign in, a one-time link has been sent. Open it on this device.';
    button.disabled = false;
  });

  document.querySelector('#sign-out').addEventListener('click', async () => {
    await client.auth.signOut();
    dashboardStatus.textContent = '';
  });
  document.querySelector('#refresh-visitors').addEventListener('click', loadVisitors);
  client.auth.onAuthStateChange((_event, session) => { void showSession(session); });
  client.auth.getSession().then(({ data }) => showSession(data.session));
}
