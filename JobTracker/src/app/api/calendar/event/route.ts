import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get('google_access_token')?.value;
    const refreshToken = cookieStore.get('google_refresh_token')?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ error: 'Not authenticated with Google Calendar' }, { status: 401 });
    }

    // If no access token but we have a refresh token, we should refresh it
    if (!accessToken && refreshToken) {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      
      if (clientId && clientSecret) {
        const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
          }),
        });

        const refreshData = await refreshRes.json();
        if (refreshRes.ok && refreshData.access_token) {
          accessToken = refreshData.access_token;
          cookieStore.set('google_access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: refreshData.expires_in,
            path: '/'
          });
        }
      }
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to obtain valid access token' }, { status: 401 });
    }

    const { summary, description, start, end } = await req.json();

    const event = {
      summary,
      description,
      start: { dateTime: start },
      end: { dateTime: end },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Google Calendar Error:', data);
      return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
    }

    return NextResponse.json({ success: true, eventLink: data.htmlLink });
  } catch (err: any) {
    console.error('Event API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
