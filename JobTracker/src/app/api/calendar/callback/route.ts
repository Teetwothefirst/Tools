import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/dashboard?calendar_error=' + error, req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard?calendar_error=no_code', req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${url.protocol}//${url.host}/api/calendar/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/dashboard?calendar_error=missing_config', req.url));
  }

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Failed to exchange token:', data);
      return NextResponse.redirect(new URL('/dashboard?calendar_error=exchange_failed', req.url));
    }

    // We store the access token and refresh token in an HTTP-only cookie.
    // In a production app, it might be better to store it securely in the database tied to the user.
    // For this demonstration and simplicity, we'll use cookies.
    const cookieStore = await cookies();
    cookieStore.set('google_access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: data.expires_in,
      path: '/'
    });

    if (data.refresh_token) {
      cookieStore.set('google_refresh_token', data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/'
      });
    }

    return NextResponse.redirect(new URL('/dashboard?calendar_connected=true', req.url));
  } catch (err) {
    console.error('Error during calendar callback:', err);
    return NextResponse.redirect(new URL('/dashboard?calendar_error=internal_error', req.url));
  }
}
