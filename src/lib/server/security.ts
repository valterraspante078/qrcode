import "server-only"

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

function getOriginFromUrl(value: string | null) {
    if (!value) return null

    try {
        const url = new URL(value)
        if (url.protocol !== "http:" && url.protocol !== "https:") return null
        return url.origin
    } catch {
        return null
    }
}

export function getConfiguredSiteOrigin() {
    return getOriginFromUrl(process.env.NEXT_PUBLIC_SITE_URL ?? null)
}

export function getAppOrigin(request?: Request) {
    return getConfiguredSiteOrigin() ?? getOriginFromUrl(request?.url ?? null) ?? "http://localhost:3000"
}

export function isTrustedOriginRequest(request: Request) {
    if (SAFE_METHODS.has(request.method.toUpperCase())) return true

    const allowedOrigins = new Set<string>()
    const requestOrigin = getOriginFromUrl(request.url)
    const appOrigin = getConfiguredSiteOrigin()

    if (requestOrigin) allowedOrigins.add(requestOrigin)
    if (appOrigin) allowedOrigins.add(appOrigin)

    const origin = getOriginFromUrl(request.headers.get("origin"))
    if (origin) return allowedOrigins.has(origin)

    const referer = getOriginFromUrl(request.headers.get("referer"))
    if (referer) return allowedOrigins.has(referer)

    return false
}

export async function readJsonObject(request: Request) {
    try {
        const body = await request.json()
        if (!body || typeof body !== "object" || Array.isArray(body)) return null
        return body as Record<string, unknown>
    } catch {
        return null
    }
}
