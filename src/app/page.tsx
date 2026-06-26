'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Home, Target, Trophy, Store, CalendarDays, ListChecks, LogOut, Plus, Minus,
  Star, Trash2, Edit3, X, Check, Gift, ChevronLeft, ChevronRight, TrendingUp,
  Menu, User, UserPlus, Eye, EyeOff, Award, Zap, Settings, ShoppingBag
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────
interface Kid { id: string; name: string; avatarEmoji: string; totalPoints: number }
interface Chore { id: string; name: string; icon: string; points: number; sortOrder: number }
interface ChoreLog {
  id: string; kidId: string; choreId: string; points: number; date: string;
  chore?: { name: string; icon: string }; kid?: { name: string; avatarEmoji: string }
}
interface StoreItem { id: string; name: string; description: string; pointCost: number; icon: string; isActive: boolean }
interface ListItem { id: string; name: string; description: string; completed: boolean; completedAt: string | null; sortOrder: number }
interface CalEvent { id: string; name: string; description: string; startDate: string; endDate: string; allDay: boolean }

type Tab = 'dashboard' | 'goals' | 'points' | 'store' | 'calendar' | 'lists' | 'settings'

// ─── Auth Forms ──────────────────────────────────────────────────
function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        const res = await signIn('credentials', { email, password, redirect: false })
        if (res?.error) {
          toast.error('Invalid email or password')
        }
      } else {
        const signupRes = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        })
        const data = await signupRes.json()
        if (signupRes.ok) {
          const res = await signIn('credentials', { email, password, redirect: false })
          if (res?.error) toast.error('Login failed after signup')
        } else {
          toast.error(data.error || 'Signup failed')
        }
      }
    } catch {
      toast.error('Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0f0a1a] via-[#1a1029] to-[#2d1f45]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🥋</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Dada Dojo
          </h1>
          <p className="text-muted-foreground mt-2">Daily Goal Tracker for Kids</p>
        </div>
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="name">Family Name</Label>
                  <Input
                    id="name"
                    placeholder="The Smith Family"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-secondary/50 mt-1"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-secondary/50 mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="bg-secondary/50 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-primary hover:underline font-medium"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ─── Semi-circle Gauge ───────────────────────────────────────────
function GaugeChart({ value, max, label, color = 'from-green-400 to-purple-500' }: {
  value: number; max: number; label: string; color?: string
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-20 overflow-hidden">
        <div className="absolute inset-0 rounded-t-full bg-secondary/50" />
        <div
          className={`absolute bottom-0 left-0 right-0 rounded-t-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ height: `${pct}%` }}
        />
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className="text-2xl font-bold">{value}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1 text-center">{label}</p>
    </div>
  )
}

// ─── Main App ────────────────────────────────────────────────────
export default function Home() {
  const { data: session, status } = useSession()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [mobileNav, setMobileNav] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  // ─── PWA Install Prompt ─────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstallBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') toast.success('Dada Dojo installed!')
    setInstallPrompt(null)
    setShowInstallBanner(false)
  }

  // ─── Data State ─────────────────────────────────────────────
  const [kids, setKids] = useState<Kid[]>([])
  const [selectedKidId, setSelectedKidId] = useState<string>('')
  const [chores, setChores] = useState<Chore[]>([])
  const [choreCheckState, setChoreCheckState] = useState<Record<string, boolean>>({})
  const [activityLog, setActivityLog] = useState<ChoreLog[]>([])
  const [storeItems, setStoreItems] = useState<StoreItem[]>([])
  const [listItems, setListItems] = useState<ListItem[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalEvent[]>([])
  const [calMonth, setCalMonth] = useState(new Date())

  // ─── Dialog State ───────────────────────────────────────────
  const [dlg, setDlg] = useState<{ open: boolean; type: string; data?: any }>({ open: false, type: '' })

  // ─── Fetch Helpers (must be before any conditional returns) ─
  const fetchKids = useCallback(async () => {
    const r = await fetch('/api/kids')
    if (r.ok) {
      const d = await r.json()
      setKids(d)
      if (d.length > 0 && !selectedKidId) setSelectedKidId(d[0].id)
    }
  }, [selectedKidId])

  const fetchChores = useCallback(async () => {
    const r = await fetch('/api/chores')
    if (r.ok) setChores(await r.json())
  }, [])

  const fetchCheckState = useCallback(async () => {
    if (!selectedKidId) return
    const r = await fetch(`/api/points?kidId=${selectedKidId}&days=1`)
    if (r.ok) {
      const logs: ChoreLog[] = await r.json()
      const state: Record<string, boolean> = {}
      logs.forEach(l => { state[l.choreId] = true })
      setChoreCheckState(state)
    }
  }, [selectedKidId])

  const fetchActivity = useCallback(async () => {
    if (!selectedKidId) return
    const r = await fetch(`/api/points?kidId=${selectedKidId}&days=7`)
    if (r.ok) setActivityLog(await r.json())
  }, [selectedKidId])

  const fetchStore = useCallback(async () => {
    const r = await fetch('/api/store')
    if (r.ok) setStoreItems(await r.json())
  }, [])

  const fetchLists = useCallback(async () => {
    const r = await fetch('/api/lists')
    if (r.ok) setListItems(await r.json())
  }, [])

  const fetchCalendar = useCallback(async () => {
    const r = await fetch('/api/calendar')
    if (r.ok) setCalendarEvents(await r.json())
  }, [])

  useEffect(() => { fetchKids(); fetchChores(); fetchStore(); fetchLists(); fetchCalendar() }, [])
  useEffect(() => { fetchCheckState(); fetchActivity() }, [selectedKidId, fetchCheckState, fetchActivity])

  // ─── Early returns after all hooks ──────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-4xl animate-bounce">🥋</div>
      </div>
    )
  }

  if (!session) return <AuthForm />

  const userId = (session.user as { id: string })?.id
  const selectedKid = kids.find(k => k.id === selectedKidId)

  // ─── Quick Point Adjust ─────────────────────────────────────
  const adjustPoints = async (amount: number, reason: string) => {
    if (!selectedKidId) return
    await fetch('/api/points', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kidId: selectedKidId, amount, reason }),
    })
    toast.success(`${amount > 0 ? '+' : ''}${amount} points`)
    fetchKids()
  }

  // ─── Toggle Chore ───────────────────────────────────────────
  const toggleChore = async (choreId: string, checked: boolean) => {
    if (!selectedKidId) return
    const r = await fetch('/api/chores', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: choreId, completed: checked, kidId: selectedKidId }),
    })
    if (r.ok) {
      const data = await r.json()
      if (data.action === 'checked') {
        setChoreCheckState(s => ({ ...s, [choreId]: true }))
        toast.success('Goal completed! +points')
        fetchKids()
      } else if (data.action === 'unchecked') {
        setChoreCheckState(s => ({ ...s, [choreId]: false }))
        toast.info('Goal unchecked')
        fetchKids()
      }
    }
  }

  // ─── Purchase Item ──────────────────────────────────────────
  const purchaseItem = async (storeItemId: string) => {
    if (!selectedKidId) return
    const r = await fetch('/api/store/purchase', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kidId: selectedKidId, storeItemId }),
    })
    const data = await r.json()
    if (r.ok) {
      toast.success('Purchase successful!')
      fetchKids()
    } else {
      toast.error(data.error || 'Purchase failed')
    }
  }

  // ─── Week points for chart ──────────────────────────────────
  const getWeeklyPoints = () => {
    const days: { day: string; pts: number }[] = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const dayStr = d.toISOString().split('T')[0]
      const dayPts = activityLog
        .filter(l => l.date.startsWith(dayStr))
        .reduce((sum, l) => sum + l.points, 0)
      days.push({ day: dayNames[d.getDay()], pts: dayPts })
    }
    return days
  }

  const weekData = getWeeklyPoints()
  const weekTotal = weekData.reduce((s, d) => s + d.pts, 0)
  const maxChart = Math.max(...weekData.map(d => d.pts), 1)

  // ─── Calendar helpers ───────────────────────────────────────
  const calYear = calMonth.getFullYear()
  const calMon = calMonth.getMonth()
  const calDaysInMonth = new Date(calYear, calMon + 1, 0).getDate()
  const calFirstDay = new Date(calYear, calMon, 1).getDay()
  const calEventsForMonth = calendarEvents.filter(e => {
    const d = new Date(e.startDate)
    return d.getMonth() === calMon && d.getFullYear() === calYear
  })
  const calEventDates = new Set(calEventsForMonth.map(e => new Date(e.startDate).getDate()))

  // ─── Nav Items ──────────────────────────────────────────────
  const navItems: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { id: 'goals', icon: <Target size={20} />, label: 'Daily Goals' },
    { id: 'points', icon: <Trophy size={20} />, label: 'Points' },
    { id: 'store', icon: <Store size={20} />, label: 'Store' },
    { id: 'calendar', icon: <CalendarDays size={20} />, label: 'Calendar' },
    { id: 'lists', icon: <ListChecks size={20} />, label: 'Lists' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
  ]

  // ─── Kid Selector ───────────────────────────────────────────
  const KidSelector = () => (
    <div className="flex gap-2 flex-wrap">
      {kids.map(k => (
        <button
          key={k.id}
          onClick={() => setSelectedKidId(k.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            k.id === selectedKidId
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="text-xl">{k.avatarEmoji}</span>
          <span className="font-medium">{k.name}</span>
          <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary text-xs">
            {k.totalPoints} pts
          </Badge>
        </button>
      ))}
      <button
        onClick={() => setDlg({ open: true, type: 'addKid' })}
        className="flex items-center gap-1 px-4 py-2 rounded-xl border border-dashed border-border hover:border-primary hover:text-primary text-muted-foreground transition-all"
      >
        <Plus size={18} /> <span className="text-sm">Add Kid</span>
      </button>
    </div>
  )

  // ─── RENDER ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-background">
      {/* PWA Install Banner */}
      {showInstallBanner && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-card border border-primary/30 rounded-xl p-4 shadow-lg shadow-primary/10"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">🥋</div>
            <div className="flex-1">
              <p className="font-medium text-sm">Install Dada Dojo</p>
              <p className="text-xs text-muted-foreground">Add to home screen for the best experience</p>
            </div>
            <Button size="sm" onClick={handleInstall} className="bg-primary hover:bg-primary/90 shrink-0">
              Install
            </Button>
            <button onClick={() => setShowInstallBanner(false)} className="text-muted-foreground hover:text-foreground p-1">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card/50 p-4 shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
          <span className="text-3xl">🥋</span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Dada Dojo
          </h1>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                tab === item.id
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border pt-4 mt-4">
          <div className="text-sm text-muted-foreground truncate px-2">
            {session.user?.name}
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive transition-all mt-2"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Nav Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥋</span>
          <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Dada Dojo</span>
        </div>
        <button onClick={() => setMobileNav(!mobileNav)} className="text-foreground p-1">
          {mobileNav ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileNav && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25 }}
            className="md:hidden fixed top-0 left-0 bottom-0 w-64 z-50 bg-card border-r border-border p-4"
          >
            <div className="flex items-center gap-3 mb-6 px-2">
              <span className="text-2xl">🥋</span>
              <span className="font-bold text-lg">Dada Dojo</span>
            </div>
            <nav className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setTab(item.id); setMobileNav(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                    tab === item.id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive mt-6"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 md:p-6 p-4 pt-16 md:pt-6 overflow-y-auto min-h-screen">
        {kids.length === 0 && tab !== 'settings' ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="text-6xl mb-4">🥋</div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Dada Dojo!</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start by adding your first kid. Each child gets their own points, goals, and rewards.
            </p>
            <Button onClick={() => setDlg({ open: true, type: 'addKid' })} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2" size={18} /> Add Your First Kid
            </Button>
          </div>
        ) : (
          <>
            <KidSelector />

            <div className="mt-6">
              {/* ─── DASHBOARD ──────────────────────────────────── */}
              {tab === 'dashboard' && selectedKid && (
                <div className="space-y-6">
                  {/* Welcome & Points */}
                  <Card className="bg-gradient-to-br from-purple-900/40 to-card border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-bold">
                            Hello {selectedKid.name}! {selectedKid.avatarEmoji}
                          </h2>
                          <p className="text-muted-foreground text-sm mt-1">
                            Keep up the great work and earn more points!
                          </p>
                        </div>
                        <div className="text-center sm:text-right">
                          <div className="flex items-center gap-2 justify-center sm:justify-end">
                            <Star className="text-yellow-400" size={24} />
                            <span className="text-3xl font-bold">{selectedKid.totalPoints}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Total Points</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">Quick Points</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Quick +1', amount: 1, icon: <Plus size={16} />, color: 'bg-green-600/20 text-green-400 hover:bg-green-600/30' },
                          { label: 'Quick +5', amount: 5, icon: <Zap size={16} />, color: 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' },
                          { label: 'Quick -1', amount: -1, icon: <Minus size={16} />, color: 'bg-red-600/20 text-red-400 hover:bg-red-600/30' },
                          { label: 'Custom', amount: 0, icon: <Edit3 size={16} />, color: 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30' },
                        ].map(btn => (
                          <Button
                            key={btn.label}
                            variant="outline"
                            className={`${btn.color} border-0 h-auto py-3 flex flex-col items-center gap-1`}
                            onClick={() => btn.amount !== 0
                              ? adjustPoints(btn.amount, btn.label)
                              : setDlg({ open: true, type: 'customPoints' })
                            }
                          >
                            {btn.icon}
                            <span className="text-xs font-medium">{btn.label}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Today's Goals Summary */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Today&apos;s Progress</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setTab('goals')} className="text-primary text-xs">
                          View All →
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {chores.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No goals set up yet. Go to Daily Goals to add some!</p>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-3">
                            <Progress
                              value={chores.length > 0 ? (Object.values(choreCheckState).filter(Boolean).length / chores.length) * 100 : 0}
                              className="h-3 flex-1"
                            />
                            <span className="text-sm text-muted-foreground font-medium">
                              {Object.values(choreCheckState).filter(Boolean).length}/{chores.length}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {chores.slice(0, 5).map(chore => (
                              <div key={chore.id} className="flex items-center justify-between py-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{chore.icon}</span>
                                  <span className="text-sm">{chore.name}</span>
                                </div>
                                {choreCheckState[chore.id]
                                  ? <Badge variant="secondary" className="bg-green-600/20 text-green-400">+{chore.points} pts</Badge>
                                  : <Badge variant="outline" className="text-muted-foreground">{chore.points} pts</Badge>
                                }
                              </div>
                            ))}
                            {chores.length > 5 && (
                              <p className="text-xs text-muted-foreground">+{chores.length - 5} more goals</p>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Recent Activity</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setTab('points')} className="text-primary text-xs">
                          View All →
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {activityLog.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No activity yet. Complete some goals to see them here!</p>
                      ) : (
                        <ScrollArea className="max-h-64">
                          <div className="space-y-2">
                            {activityLog.slice(0, 10).map(log => (
                              <div key={log.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{log.chore?.icon}</span>
                                  <div>
                                    <p className="text-sm">{log.chore?.name || 'Unknown'}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(log.date).toLocaleDateString()} at {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                                <Badge className="bg-green-600/20 text-green-400">+{log.points}</Badge>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ─── DAILY GOALS ────────────────────────────────── */}
              {tab === 'goals' && selectedKid && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">Daily Goals</h2>
                      <p className="text-sm text-muted-foreground">
                        Toggle goals for {selectedKid.name} to award points
                      </p>
                    </div>
                    <Button onClick={() => setDlg({ open: true, type: 'addChore' })} className="bg-primary hover:bg-primary/90">
                      <Plus className="mr-1" size={16} /> Add Goal
                    </Button>
                  </div>

                  {chores.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Target className="mx-auto mb-3 text-muted-foreground" size={40} />
                        <h3 className="text-lg font-medium mb-1">No goals yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">Create your first daily goal to start tracking!</p>
                        <Button onClick={() => setDlg({ open: true, type: 'addChore' })} className="bg-primary hover:bg-primary/90">
                          <Plus className="mr-1" size={16} /> Add Goal
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {chores.map(chore => (
                        <Card key={chore.id} className="bg-card/80 hover:bg-card transition-colors">
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xl w-8 text-center">{chore.icon}</span>
                              <div>
                                <p className="font-medium">{chore.name}</p>
                                <p className="text-xs text-muted-foreground">+{chore.points} points</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={choreCheckState[chore.id] || false}
                                onCheckedChange={checked => toggleChore(chore.id, checked)}
                              />
                              <button
                                onClick={() => setDlg({ open: true, type: 'editChore', data: chore })}
                                className="text-muted-foreground hover:text-foreground p-1"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={async () => {
                                  await fetch(`/api/chores?id=${chore.id}`, { method: 'DELETE' })
                                  toast.success('Goal removed')
                                  fetchChores()
                                }}
                                className="text-muted-foreground hover:text-destructive p-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── POINTS ─────────────────────────────────────── */}
              {tab === 'points' && selectedKid && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold">Points Dashboard</h2>
                    <p className="text-sm text-muted-foreground">Track {selectedKid.name}&apos;s progress</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-6 text-center">
                        <GaugeChart value={weekTotal} max={Math.max(weekTotal * 2, 10)} label="This Week" />
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-900/40 to-card border-primary/20">
                      <CardContent className="p-6 text-center flex flex-col items-center justify-center">
                        <Star className="text-yellow-400 mb-2" size={32} />
                        <span className="text-4xl font-bold">{selectedKid.totalPoints}</span>
                        <p className="text-xs text-muted-foreground mt-1">Total Points Bank</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6 text-center">
                        <TrendingUp className="text-green-400 mb-2 mx-auto" size={32} />
                        <span className="text-4xl font-bold">{weekData.filter(d => d.pts > 0).length}</span>
                        <p className="text-xs text-muted-foreground mt-1">Active Days This Week</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Weekly Chart */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Weekly Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-2 h-40">
                        {weekData.map((d, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-xs font-medium text-primary">{d.pts > 0 ? d.pts : ''}</span>
                            <div className="w-full bg-secondary/50 rounded-t-md relative" style={{ height: '100%' }}>
                              <div
                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-md transition-all duration-500"
                                style={{ height: `${maxChart > 0 ? (d.pts / maxChart) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{d.day}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity Log */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Activity Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activityLog.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-8 text-center">No activity this week</p>
                      ) : (
                        <ScrollArea className="max-h-96">
                          <div className="space-y-2">
                            {activityLog.map(log => (
                              <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{log.chore?.icon}</span>
                                  <div>
                                    <p className="text-sm font-medium">{log.chore?.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                                      {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                                <Badge className="bg-green-600/20 text-green-400">+{log.points}</Badge>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ─── STORE ──────────────────────────────────────── */}
              {tab === 'store' && selectedKid && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">Prize Store</h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedKid.name} has <span className="text-primary font-bold">{selectedKid.totalPoints}</span> points to spend
                      </p>
                    </div>
                    <Button onClick={() => setDlg({ open: true, type: 'addStoreItem' })} className="bg-primary hover:bg-primary/90">
                      <Plus className="mr-1" size={16} /> Add Prize
                    </Button>
                  </div>

                  {storeItems.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Gift className="mx-auto mb-3 text-muted-foreground" size={40} />
                        <h3 className="text-lg font-medium mb-1">No prizes yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">Add rewards your kids can earn with points!</p>
                        <Button onClick={() => setDlg({ open: true, type: 'addStoreItem' })} className="bg-primary hover:bg-primary/90">
                          <Plus className="mr-1" size={16} /> Add Prize
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {storeItems.filter(i => i.isActive).map(item => (
                        <Card key={item.id} className="bg-card/80 hover:bg-card transition-all hover:border-primary/30 group">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <span className="text-3xl">{item.icon}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setDlg({ open: true, type: 'editStoreItem', data: item })}
                                  className="p-1 text-muted-foreground hover:text-foreground"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={async () => {
                                    await fetch(`/api/store?id=${item.id}`, { method: 'DELETE' })
                                    toast.success('Prize removed')
                                    fetchStore()
                                  }}
                                  className="p-1 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <h3 className="font-medium text-sm mb-1">{item.name}</h3>
                            {item.description && <p className="text-xs text-muted-foreground mb-3">{item.description}</p>}
                            <div className="flex items-center justify-between mt-auto">
                              <Badge className="bg-primary/20 text-primary">
                                <Star size={12} className="mr-1" />{item.pointCost} pts
                              </Badge>
                              <Button
                                size="sm"
                                disabled={selectedKid.totalPoints < item.pointCost}
                                onClick={() => purchaseItem(item.id)}
                                className={
                                  selectedKid.totalPoints >= item.pointCost
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-secondary text-muted-foreground'
                                }
                              >
                                <ShoppingBag size={14} className="mr-1" />
                                {selectedKid.totalPoints >= item.pointCost ? 'Buy' : 'Not Enough'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── CALENDAR ───────────────────────────────────── */}
              {tab === 'calendar' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Calendar</h2>
                    <Button onClick={() => setDlg({ open: true, type: 'addEvent' })} className="bg-primary hover:bg-primary/90">
                      <Plus className="mr-1" size={16} /> Add Event
                    </Button>
                  </div>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setCalMonth(new Date(calYear, calMon - 1))} className="p-2 rounded-lg hover:bg-secondary">
                          <ChevronLeft size={20} />
                        </button>
                        <h3 className="text-lg font-bold">
                          {calMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </h3>
                        <button onClick={() => setCalMonth(new Date(calYear, calMon + 1))} className="p-2 rounded-lg hover:bg-secondary">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                          <div key={d} className="text-xs text-muted-foreground py-2 font-medium">{d}</div>
                        ))}
                        {Array.from({ length: calFirstDay }).map((_, i) => (
                          <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: calDaysInMonth }).map((_, i) => {
                          const day = i + 1
                          const hasEvent = calEventDates.has(day)
                          const isToday = day === new Date().getDate() && calMon === new Date().getMonth() && calYear === new Date().getFullYear()
                          return (
                            <div
                              key={day}
                              className={`relative py-2 rounded-lg text-sm cursor-pointer transition-all
                                ${isToday ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-secondary'}
                              `}
                            >
                              {day}
                              {hasEvent && (
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-pink-400" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Events List */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {calendarEvents.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-4 text-center">No events yet</p>
                      ) : (
                        <ScrollArea className="max-h-64">
                          <div className="space-y-2">
                            {calendarEvents
                              .filter(e => new Date(e.startDate) >= new Date(new Date().toDateString()))
                              .map(event => (
                                <div key={event.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                                  <div>
                                    <p className="text-sm font-medium">{event.name}</p>
                                    {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
                                    <p className="text-xs text-primary mt-0.5">
                                      {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                      {event.allDay ? ' (All Day)' : ` at ${new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                    </p>
                                  </div>
                                  <button
                                    onClick={async () => {
                                      await fetch(`/api/calendar?id=${event.id}`, { method: 'DELETE' })
                                      toast.success('Event removed')
                                      fetchCalendar()
                                    }}
                                    className="text-muted-foreground hover:text-destructive p-1"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ─── LISTS ──────────────────────────────────────── */}
              {tab === 'lists' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">My Lists</h2>
                      <p className="text-sm text-muted-foreground">Track activities, projects, and ideas</p>
                    </div>
                  </div>

                  <Card>
                    <CardContent className="p-4">
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault()
                          const form = e.target as HTMLFormElement
                          const name = (form.elements.namedItem('listName') as HTMLInputElement).value.trim()
                          if (!name) return
                          await fetch('/api/lists', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name }),
                          })
                          form.reset()
                          fetchLists()
                        }}
                        className="flex gap-2"
                      >
                        <Input name="listName" placeholder="Add a new item..." className="bg-secondary/50" />
                        <Button type="submit" className="bg-primary hover:bg-primary/90 shrink-0">
                          <Plus size={16} />
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Active Items */}
                  {listItems.filter(i => !i.completed).length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <ListChecks size={16} /> Active
                          <Badge variant="secondary" className="ml-auto">{listItems.filter(i => !i.completed).length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {listItems.filter(i => !i.completed).map(item => (
                            <div key={item.id} className="flex items-center gap-3 py-2 group">
                              <Checkbox
                                checked={false}
                                onCheckedChange={async (checked) => {
                                  await fetch('/api/lists', {
                                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: item.id, name: item.name, completed: !!checked }),
                                  })
                                  fetchLists()
                                }}
                              />
                              <span className="flex-1 text-sm">{item.name}</span>
                              <button
                                onClick={async () => {
                                  await fetch(`/api/lists?id=${item.id}`, { method: 'DELETE' })
                                  fetchLists()
                                }}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Completed Items */}
                  {listItems.filter(i => i.completed).length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Check size={16} className="text-green-400" /> Completed
                          <Badge variant="secondary" className="ml-auto">{listItems.filter(i => i.completed).length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {listItems.filter(i => i.completed).map(item => (
                            <div key={item.id} className="flex items-center gap-3 py-2 text-muted-foreground">
                              <Checkbox checked={true}
                                onCheckedChange={async (checked) => {
                                  await fetch('/api/lists', {
                                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: item.id, name: item.name, completed: !!checked }),
                                  })
                                  fetchLists()
                                }}
                              />
                              <span className="flex-1 text-sm line-through">{item.name}</span>
                              {item.completedAt && (
                                <span className="text-xs">
                                  {new Date(item.completedAt).toLocaleDateString()}
                                </span>
                              )}
                              <button
                                onClick={async () => {
                                  await fetch(`/api/lists?id=${item.id}`, { method: 'DELETE' })
                                  fetchLists()
                                }}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* ─── SETTINGS ───────────────────────────────────── */}
              {tab === 'settings' && (
                <div className="space-y-6 max-w-lg">
                  <h2 className="text-xl font-bold">Settings</h2>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User size={16} /> Account
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between py-1">
                        <span className="text-sm text-muted-foreground">Name</span>
                        <span className="text-sm font-medium">{session.user?.name}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between py-1">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="text-sm font-medium">{session.user?.email}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <UserPlus size={16} /> Manage Kids
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {kids.map(kid => (
                        <div key={kid.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{kid.avatarEmoji}</span>
                            <div>
                              <p className="font-medium">{kid.name}</p>
                              <p className="text-xs text-muted-foreground">{kid.totalPoints} total points</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={async () => {
                              await fetch(`/api/kids?id=${kid.id}`, { method: 'DELETE' })
                              toast.success(`${kid.name} removed`)
                              if (selectedKidId === kid.id) setSelectedKidId(kids.find(k => k.id !== kid.id)?.id || '')
                              fetchKids()
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full mt-2 border-dashed"
                        onClick={() => setDlg({ open: true, type: 'addKid' })}
                      >
                        <Plus className="mr-2" size={16} /> Add Another Kid
                      </Button>
                    </CardContent>
                  </Card>

                  <Button
                    variant="outline"
                    className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2" size={16} /> Sign Out
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ─── DIALOGS ────────────────────────────────────────────── */}
      <Dialog open={dlg.open} onOpenChange={o => setDlg({ ...dlg, open: o })}>
        <DialogContent className="bg-card border-border">
          {/* Add Kid */}
          {dlg.type === 'addKid' && (
            <>
              <DialogHeader>
                <DialogTitle>Add a Kid</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const f = e.target as HTMLFormElement
                  const name = (f.elements.namedItem('kidName') as HTMLInputElement).value.trim()
                  const emoji = (f.elements.namedItem('kidEmoji') as HTMLInputElement).value.trim()
                  if (!name) return
                  await fetch('/api/kids', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, avatarEmoji: emoji || '🥋' }),
                  })
                  toast.success(`${name} added!`)
                  setDlg({ open: false, type: '' })
                  fetchKids()
                }}
                className="space-y-4"
              >
                <div>
                  <Label>Name</Label>
                  <Input name="kidName" placeholder="Your kid's name" className="bg-secondary/50 mt-1" required />
                </div>
                <div>
                  <Label>Avatar Emoji</Label>
                  <div className="flex gap-2 mt-1">
                    {['🥋', '🌟', '🦸', '🐉', '🚀', '🎮', '🎨', '⚽', '🧩', '🎸'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        name="kidEmoji"
                        value={emoji}
                        className="text-2xl p-1 rounded hover:bg-secondary transition-colors"
                        onClick={() => {
                          const input = document.querySelector('input[name="kidEmoji"]') as HTMLInputElement
                          if (input) input.value = emoji
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                    <Input name="kidEmoji" placeholder="or type..." className="bg-secondary/50 w-24" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setDlg({ open: false, type: '' })}>Cancel</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">Add Kid</Button>
                </DialogFooter>
              </form>
            </>
          )}

          {/* Add/Edit Chore */}
          {(dlg.type === 'addChore' || dlg.type === 'editChore') && (
            <>
              <DialogHeader>
                <DialogTitle>{dlg.type === 'editChore' ? 'Edit Goal' : 'Add Goal'}</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const f = e.target as HTMLFormElement
                  const name = (f.elements.namedItem('choreName') as HTMLInputElement).value.trim()
                  const icon = (f.elements.namedItem('choreIcon') as HTMLInputElement).value.trim()
                  const points = parseInt((f.elements.namedItem('chorePoints') as HTMLInputElement).value)
                  if (!name) return
                  if (dlg.type === 'editChore') {
                    await fetch('/api/chores', {
                      method: 'PUT', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: dlg.data.id, name, icon: icon || '✅', points }),
                    })
                    toast.success('Goal updated')
                  } else {
                    await fetch('/api/chores', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, icon: icon || '✅', points }),
                    })
                    toast.success('Goal added!')
                  }
                  setDlg({ open: false, type: '' })
                  fetchChores()
                }}
                className="space-y-4"
              >
                <div>
                  <Label>Goal Name</Label>
                  <Input name="choreName" defaultValue={dlg.data?.name || ''} placeholder="e.g., Brush Teeth" className="bg-secondary/50 mt-1" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Icon</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {['✅', '🪥', '🧹', '📖', '🍎', '🛁', '🎯', '💪', '🧠', '🎮', '🎵', '🏃'].map(icon => (
                        <button
                          key={icon}
                          type="button"
                          className="text-xl p-1 rounded hover:bg-secondary transition-colors"
                          onClick={() => {
                            const input = document.querySelector('input[name="choreIcon"]') as HTMLInputElement
                            if (input) input.value = icon
                          }}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    <Input name="choreIcon" defaultValue={dlg.data?.icon || '✅'} placeholder="or type..." className="bg-secondary/50 mt-1" />
                  </div>
                  <div>
                    <Label>Points</Label>
                    <Input name="chorePoints" type="number" min="1" defaultValue={dlg.data?.points || 1} className="bg-secondary/50 mt-1" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setDlg({ open: false, type: '' })}>Cancel</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">{dlg.type === 'editChore' ? 'Save' : 'Add Goal'}</Button>
                </DialogFooter>
              </form>
            </>
          )}

          {/* Add/Edit Store Item */}
          {(dlg.type === 'addStoreItem' || dlg.type === 'editStoreItem') && (
            <>
              <DialogHeader>
                <DialogTitle>{dlg.type === 'editStoreItem' ? 'Edit Prize' : 'Add Prize'}</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const f = e.target as HTMLFormElement
                  const name = (f.elements.namedItem('storeName') as HTMLInputElement).value.trim()
                  const desc = (f.elements.namedItem('storeDesc') as HTMLInputElement).value.trim()
                  const cost = parseInt((f.elements.namedItem('storeCost') as HTMLInputElement).value)
                  const icon = (f.elements.namedItem('storeIcon') as HTMLInputElement).value.trim()
                  if (!name || isNaN(cost)) return
                  if (dlg.type === 'editStoreItem') {
                    await fetch('/api/store', {
                      method: 'PUT', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: dlg.data.id, name, description: desc, pointCost: cost, icon: icon || '🎁' }),
                    })
                    toast.success('Prize updated')
                  } else {
                    await fetch('/api/store', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, description: desc, pointCost: cost, icon: icon || '🎁' }),
                    })
                    toast.success('Prize added!')
                  }
                  setDlg({ open: false, type: '' })
                  fetchStore()
                }}
                className="space-y-4"
              >
                <div>
                  <Label>Prize Name</Label>
                  <Input name="storeName" defaultValue={dlg.data?.name || ''} placeholder="e.g., Extra Screen Time" className="bg-secondary/50 mt-1" required />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Input name="storeDesc" defaultValue={dlg.data?.description || ''} placeholder="Brief description" className="bg-secondary/50 mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Point Cost</Label>
                    <Input name="storeCost" type="number" min="1" defaultValue={dlg.data?.pointCost || 10} className="bg-secondary/50 mt-1" required />
                  </div>
                  <div>
                    <Label>Icon</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {['🎁', '🎮', '🍫', '🎬', '🏃', '📚', '🎪', '🍦', '🎨', '🌟', '🎸', '🛍️'].map(icon => (
                        <button
                          key={icon}
                          type="button"
                          className="text-xl p-1 rounded hover:bg-secondary transition-colors"
                          onClick={() => {
                            const input = document.querySelector('input[name="storeIcon"]') as HTMLInputElement
                            if (input) input.value = icon
                          }}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    <Input name="storeIcon" defaultValue={dlg.data?.icon || '🎁'} placeholder="or type..." className="bg-secondary/50 mt-1" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setDlg({ open: false, type: '' })}>Cancel</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">{dlg.type === 'editStoreItem' ? 'Save' : 'Add Prize'}</Button>
                </DialogFooter>
              </form>
            </>
          )}

          {/* Custom Points */}
          {dlg.type === 'customPoints' && (
            <>
              <DialogHeader>
                <DialogTitle>Adjust Points</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const f = e.target as HTMLFormElement
                  const amount = parseInt((f.elements.namedItem('ptsAmount') as HTMLInputElement).value)
                  const reason = (f.elements.namedItem('ptsReason') as HTMLInputElement).value.trim()
                  if (isNaN(amount)) return
                  await adjustPoints(amount, reason || 'Manual adjustment')
                  setDlg({ open: false, type: '' })
                }}
                className="space-y-4"
              >
                <div>
                  <Label>Amount (positive or negative)</Label>
                  <Input name="ptsAmount" type="number" placeholder="e.g., 5 or -3" className="bg-secondary/50 mt-1" required />
                </div>
                <div>
                  <Label>Reason (optional)</Label>
                  <Input name="ptsReason" placeholder="e.g., Great job at school!" className="bg-secondary/50 mt-1" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setDlg({ open: false, type: '' })}>Cancel</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">Apply</Button>
                </DialogFooter>
              </form>
            </>
          )}

          {/* Add Event */}
          {dlg.type === 'addEvent' && (
            <>
              <DialogHeader>
                <DialogTitle>Add Event</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const f = e.target as HTMLFormElement
                  const name = (f.elements.namedItem('evtName') as HTMLInputElement).value.trim()
                  const desc = (f.elements.namedItem('evtDesc') as HTMLInputElement).value.trim()
                  const startDate = (f.elements.namedItem('evtStart') as HTMLInputElement).value
                  const endDate = (f.elements.namedItem('evtEnd') as HTMLInputElement).value
                  const allDay = (f.elements.namedItem('evtAllDay') as HTMLInputElement).checked
                  if (!name || !startDate || !endDate) return
                  await fetch('/api/calendar', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description: desc, startDate, endDate, allDay }),
                  })
                  toast.success('Event added!')
                  setDlg({ open: false, type: '' })
                  fetchCalendar()
                }}
                className="space-y-4"
              >
                <div>
                  <Label>Event Name</Label>
                  <Input name="evtName" placeholder="e.g., Family Game Night" className="bg-secondary/50 mt-1" required />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Input name="evtDesc" placeholder="Details..." className="bg-secondary/50 mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input name="evtStart" type="datetime-local" className="bg-secondary/50 mt-1" required />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input name="evtEnd" type="datetime-local" className="bg-secondary/50 mt-1" required />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="evtAllDay" name="evtAllDay" className="rounded" defaultChecked />
                  <Label htmlFor="evtAllDay">All Day Event</Label>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setDlg({ open: false, type: '' })}>Cancel</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">Add Event</Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile overlay */}
      {mobileNav && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileNav(false)} />
      )}
    </div>
  )
}