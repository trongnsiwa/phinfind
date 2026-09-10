import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') || '/';

  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const baseUrl = forwardedHost && !isLocalEnv ? `https://${forwardedHost}` : origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const targetPath = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/';
      return NextResponse.redirect(`${baseUrl}${targetPath}`);
    }
  }

  return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`);
}
