"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts"
import { BarChart3, QrCode, Smartphone, Globe, ArrowUpRight, Clock, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, subDays, startOfDay, isWithinInterval } from "date-fns"

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true)
    const [scans, setScans] = useState<any[]>([])
    const [stats, setStats] = useState<any>({
        total: 0,
        today: 0,
        last7Days: 0,
        growth: 0
    })
    const [dailyData, setDailyData] = useState<any[]>([])
    const [deviceData, setDeviceData] = useState<any[]>([])
    const [topQrs, setTopQrs] = useState<any[]>([])

    const supabase = createClient()

    useEffect(() => {
        const supabase = createClient()
        if (!supabase) {
            setLoading(false)
            return
        }

        async function fetchStats() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch scans joined with qr_codes to filter by user_id
            const { data: scanData, error } = await supabase
                .from("scans")
                .select(`
                    *,
                    qr_codes!inner(name, user_id)
                `)
                .eq("qr_codes.user_id", user.id)
                .order("created_at", { ascending: false })

            if (error) {
                console.error("Error fetching scans:", error)
                setLoading(false)
                return
            }

            processAnalytics(scanData)
            setScans(scanData)
            setLoading(false)
        }

        fetchStats()
    }, [])

    const processAnalytics = (data: any[]) => {
        const now = new Date()
        const today = startOfDay(now)
        const sevenDaysAgo = subDays(today, 7)
        const thirtyDaysAgo = subDays(today, 30)

        // 1. Basic Stats
        const total = data.length
        const todayScans = data.filter(s => new Date(s.created_at) >= today).length
        const last7DaysScans = data.filter(s => new Date(s.created_at) >= sevenDaysAgo).length

        // Growth (Last 7 days vs previous 7 days)
        const prev7To14Scans = data.filter(s => {
            const d = new Date(s.created_at)
            return d >= subDays(sevenDaysAgo, 7) && d < sevenDaysAgo
        }).length
        const growth = prev7To14Scans === 0 ? 100 : Math.round(((last7DaysScans - prev7To14Scans) / prev7To14Scans) * 100)

        setStats({ total, today: todayScans, last7Days: last7DaysScans, growth })

        // 2. Daily Chart (Last 14 days)
        const daily: any = {}
        for (let i = 13; i >= 0; i--) {
            const dateStr = format(subDays(now, i), "dd/MM")
            daily[dateStr] = 0
        }
        data.forEach(s => {
            const dateStr = format(new Date(s.created_at), "dd/MM")
            if (daily[dateStr] !== undefined) {
                daily[dateStr]++
            }
        })
        setDailyData(Object.keys(daily).map(k => ({ date: k, count: daily[k] })))

        // 3. Device Distribution
        const devices: any = { Mobile: 0, Desktop: 0, Other: 0 }
        data.forEach(s => {
            const ua = s.user_agent?.toLowerCase() || ""
            if (ua.includes("mobi") || ua.includes("android") || ua.includes("iphone")) devices.Mobile++
            else if (ua.includes("windows") || ua.includes("macintosh") || ua.includes("linux")) devices.Desktop++
            else devices.Other++
        })
        setDeviceData([
            { name: "Mobile", value: devices.Mobile, color: "#3B82F6" },
            { name: "Desktop", value: devices.Desktop, color: "#60A5FA" },
            { name: "Outros", value: devices.Other, color: "#93C5FD" }
        ])

        // 4. Top QRs
        const qrCounts: any = {}
        data.forEach(s => {
            const name = s.qr_codes?.name || "Sem Nome"
            qrCounts[name] = (qrCounts[name] || 0) + 1
        })
        const sortedQrs = Object.keys(qrCounts)
            .map(k => ({ name: k, count: qrCounts[k] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        setTopQrs(sortedQrs)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse font-bold uppercase tracking-widest text-xs">Sincronizando Dados do Império...</p>
            </div>
        )
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Geral de Scans"
                    value={stats.total.toLocaleString()}
                    icon={<Globe />}
                    change={`${stats.growth}%`}
                    positive={stats.growth >= 0}
                />
                <StatCard
                    title="Scans Hoje"
                    value={stats.today}
                    icon={<Clock />}
                    color="text-green-400"
                />
                <StatCard
                    title="Últimos 7 Dias"
                    value={stats.last7Days}
                    icon={<BarChart3 />}
                />
                <StatCard
                    title="QR Mais Popular"
                    value={topQrs[0]?.name || "--"}
                    icon={<QrCode />}
                    color="text-yellow-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Scan Chart */}
                <div className="lg:col-span-2 glass rounded-[2rem] border-white/5 p-8 space-y-6 flex flex-col">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold italic uppercase tracking-tight">Evolução de Acessos</h3>
                        <div className="text-[10px] font-black uppercase text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/5">Últimos 14 Dias</div>
                    </div>

                    <div className="flex-1 min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', borderRadius: '16px', border: '1px solid #ffffff10', color: '#fff' }}
                                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Device Distribution */}
                <div className="glass rounded-[2rem] border-white/5 p-8 space-y-6 flex flex-col">
                    <h3 className="text-xl font-bold italic uppercase tracking-tight">Dispositivos</h3>
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', borderRadius: '16px', border: '1px solid #ffffff10', color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-3 gap-4 w-full mt-4">
                            {deviceData.map((d) => (
                                <div key={d.name} className="text-center">
                                    <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">{d.name}</div>
                                    <div className="text-sm font-bold" style={{ color: d.color }}>{d.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top QR Codes */}
                <div className="glass rounded-[2rem] border-white/5 p-8 space-y-6">
                    <h3 className="text-xl font-bold italic uppercase tracking-tight flex items-center gap-2">
                        Top Códigos
                        <ArrowUpRight className="w-4 h-4 text-blue-500" />
                    </h3>
                    <div className="space-y-4">
                        {topQrs.map((qr, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        {i + 1}
                                    </div>
                                    <div className="font-bold text-sm uppercase tracking-tight">{qr.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-white">{qr.count}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-black">Scans</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass rounded-[2rem] border-white/5 p-8 space-y-6">
                    <h3 className="text-xl font-bold italic uppercase tracking-tight flex items-center gap-2">
                        Atividade em Tempo Real
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                        {scans.slice(0, 10).map((scan, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-all rounded-xl">
                                <div className="p-2 rounded-lg bg-white/5 text-muted-foreground">
                                    {scan.user_agent?.toLowerCase().includes("mobi") ? <Smartphone className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-sm font-bold truncate uppercase tracking-tight text-blue-100">{scan.qr_codes?.name || "Sem Nome"}</p>
                                        <span className="text-[10px] text-muted-foreground font-black whitespace-nowrap">{format(new Date(scan.created_at), "HH:mm")}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 font-medium">
                                            <MapPin className="w-3 h-3" />
                                            {scan.ip_address}
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                        <div className="text-[10px] text-muted-foreground/60 font-medium truncate">
                                            Via: {scan.referer || "Direto"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, change, positive, color }: any) {
    return (
        <div className="p-6 rounded-3xl bg-card/50 backdrop-blur-xl border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-xl">
            <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h4 className={cn("text-3xl font-bold tracking-tighter", color ? color : "text-white")}>{value}</h4>
                    {change && (
                        <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                            positive ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"
                        )}>
                            {change}
                        </span>
                    )}
                </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 text-muted-foreground group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-all">
                {icon}
            </div>
        </div>
    )
}
