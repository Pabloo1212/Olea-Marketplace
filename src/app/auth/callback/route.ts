import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

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
            // Check if there is signup data from the OAuth flow
            const cookieStore = cookies();
            const signupDataCookie = cookieStore.get('oauth_signup_data');
            let signupData = null;
            
            if (signupDataCookie?.value) {
              try {
                signupData = JSON.parse(decodeURIComponent(signupDataCookie.value));
              } catch (e) {
                console.error('Failed to parse oauth_signup_data', e);
              }
            }

            const role = signupData?.role || user.user_metadata?.role || 'customer';

            await supabase.from('profiles').insert({
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.full_name || user.user_metadata?.name || '',
              role: role,
              avatar_url: user.user_metadata?.avatar_url || null,
              ...(signupData?.company_name ? { company_name: signupData.company_name } : {}),
              ...(signupData?.country ? { country: signupData.country } : {}),
            });
          }
        }
      } catch (profileError) {
        // Non-blocking — profile creation failure shouldn't block auth
        console.error('Profile auto-creation failed:', profileError);
      }

      const response = NextResponse.redirect(`${origin}${next}`);
      response.cookies.delete('oauth_signup_data');
      return response;
    }
  }

  // Auth error – redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
