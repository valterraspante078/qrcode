"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export function AffiliateTracker() {
    const searchParams = useSearchParams()

    useEffect(() => {
        const ref = searchParams.get("ref")
        if (ref) {
            // Set affiliate cookie mapping for 60 days
            const date = new Date()
            date.setTime(date.getTime() + (60 * 24 * 60 * 60 * 1000))
            const expires = "expires=" + date.toUTCString()
            // Setting path=/ means it will be available across the whole domain
            document.cookie = "qrc_affiliate_ref=" + ref + ";" + expires + ";path=/"
        }
    }, [searchParams])

    return null
}
