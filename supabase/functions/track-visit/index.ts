const SITE_ORIGIN = 'https://sahilburande.github.io';

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin') ?? '';
  if (origin !== SITE_ORIGIN) return new Response('Forbidden', { status: 403 });

  const cors = corsHeaders(origin);
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });

  // Supabase supplies this forwarding header at its API gateway.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || request.headers.get('x-real-ip')?.trim();
  if (!ip) return new Response('Visitor IP unavailable', { status: 400, headers: cors });

  const projectUrl = Deno.env.get('SUPABASE_URL');
  const secretKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!projectUrl || !secretKey) return new Response('Analytics is not configured', { status: 503, headers: cors });

  const visitDate = new Date().toISOString().slice(0, 10);
  const endpoint = `${projectUrl}/rest/v1/visitor_visits?on_conflict=ip,visit_date`;
  const result = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=ignore-duplicates,return=minimal'
    },
    body: JSON.stringify({ ip, visit_date: visitDate })
  });

  if (!result.ok) {
    console.error('Visitor record insert failed:', result.status);
    return new Response('Could not record visit', { status: 502, headers: cors });
  }
  return new Response(null, { status: 204, headers: cors });
});
