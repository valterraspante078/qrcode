export const QR_EXPIRATION_DAYS = 14

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
    return typeof value === "string" && UUID_RE.test(value)
}

export function normalizeQrName(value: unknown, fallback = "QR Público") {
    if (typeof value !== "string") return fallback

    const normalized = value.trim().replace(/\s+/g, " ")
    if (!normalized) return fallback

    return normalized.slice(0, 100)
}

export function normalizeOptionalText(value: unknown, maxLength: number) {
    if (value === undefined || value === null) return undefined
    if (typeof value !== "string") return null

    return value.trim().replace(/\s+/g, " ").slice(0, maxLength)
}

export function parseHttpUrl(value: unknown, maxLength = 2048) {
    if (typeof value !== "string") return null

    const trimmed = value.trim()
    if (!trimmed || trimmed.length > maxLength) return null

    try {
        const url = new URL(trimmed)
        if (url.protocol !== "http:" && url.protocol !== "https:") return null
        return url.toString()
    } catch {
        return null
    }
}

export function getQrExpirationDate(days = QR_EXPIRATION_DAYS) {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + days)
    return expiresAt.toISOString()
}

export function parseOptionalIsoDate(value: unknown) {
    if (value === null) return null
    if (typeof value !== "string") return undefined

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return undefined

    return date.toISOString()
}

export function isSafeRedirectPath(value: unknown) {
    if (typeof value !== "string") return false
    if (!value.startsWith("/") || value.startsWith("//")) return false
    if (value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) return false

    return true
}
