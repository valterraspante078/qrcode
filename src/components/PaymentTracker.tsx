"use client"

import { useEffect, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

export function PaymentTracker() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const tracked = useRef(false)

    useEffect(() => {
        const success = searchParams.get("success")

        if (success === "true" && !tracked.current) {
            tracked.current = true
            
            // Trigger Google Ads conversion for payment (Purchase/Subscribe)
            if (typeof window !== "undefined" && typeof window.gtag === "function") {
                window.gtag("event", "conversion", {
                    "send_to": "AW-18124091400/purchase",
                    "value": 1.0,
                    "currency": "BRL"
                })
            }

            // Remove the success query param so it doesn't track again on refresh
            const newSearchParams = new URLSearchParams(searchParams.toString())
            newSearchParams.delete("success")
            const newUrl = newSearchParams.toString() ? `${pathname}?${newSearchParams.toString()}` : pathname
            
            router.replace(newUrl, { scroll: false })
        }
    }, [searchParams, router, pathname])

    return null
}
