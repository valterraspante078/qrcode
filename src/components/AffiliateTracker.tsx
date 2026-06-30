"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { isUuid } from "@/lib/validation"

export function AffiliateTracker() {
    const searchParams = useSearchParams()

    useEffect(() => {
        const ref = searchParams.get("ref")
        if (ref && isUuid(ref)) {
            const maxAge = 60 * 24 * 60 * 60
            const secure = window.location.protocol === "https:" ? ";Secure" : ""
            document.cookie = `qrc_affiliate_ref=${encodeURIComponent(ref)};Max-Age=${maxAge};Path=/;SameSite=Lax${secure}`
        }
    }, [searchParams])

    return null
}
