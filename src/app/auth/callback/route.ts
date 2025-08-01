import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/upload';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log('Auth callback received:', { 
    code: !!code, 
    next, 
    origin, 
    error, 
    errorDescription,
    fullUrl: request.url 
  });

  // If there's an OAuth error, redirect to error page
  if (error) {
    console.error('OAuth error received:', { error, errorDescription });
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error}&description=${errorDescription}`);
  }

  if (code) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      console.log('Exchanging code for session...');
      
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      console.log('Exchange result:', { 
        hasData: !!data, 
        hasSession: !!data?.session, 
        hasUser: !!data?.user,
        error: exchangeError 
      });
      
      if (exchangeError) {
        console.error('Auth exchange error:', exchangeError);
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=exchange_failed&description=${exchangeError.message}`);
      }
      
      if (data?.session) {
        console.log('Auth successful, redirecting to:', `${origin}${next}`);
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        console.error('No session received after successful exchange');
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_session`);
      }
    } catch (error) {
      console.error('Unexpected error in auth callback:', error);
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected&description=${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // No code provided
  console.log('No auth code provided, redirecting to error page');
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`);
} 