import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAppOrigin } from '@/lib/server/security'
import { isSafeRedirectPath } from '@/lib/validation'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const nextParam = searchParams.get('next') ?? '/dashboard'
    const next = isSafeRedirectPath(nextParam) ? nextParam : '/dashboard'
    const appOrigin = getAppOrigin(request)

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(new URL(next, appOrigin))
        }
    }

    const loginUrl = new URL('/login', appOrigin)
    loginUrl.searchParams.set('error', 'Não foi possível autenticar. Tente novamente.')
    return NextResponse.redirect(loginUrl)
}
