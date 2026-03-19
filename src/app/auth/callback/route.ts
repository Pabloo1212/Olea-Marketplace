import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Ensure profile exists for OAuth users (first login with Google)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          if (!existingProfile) {
            await supabase.from('profiles').insert({
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.full_name || user.user_metadata?.name || '',
              role: user.user_metadata?.role || 'customer',
              avatar_url: user.user_metadata?.avatar_url || null,
            });
          }
        }
      } catch (profileError) {
        // Non-blocking — profile creation failure shouldn't block auth
        console.error('Profile auto-creation failed:', profileError);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error – redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
