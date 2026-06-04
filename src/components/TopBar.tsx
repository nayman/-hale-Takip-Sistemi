'use client'

import React, { useEffect, useRef, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type NotificationItem = {
  id: string
  title: string
  message: string
  type: string
  data: any
  isRead: boolean
  createdAt: string
}

const TopBar = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const notificationsRef = useRef<HTMLDivElement | null>(null)
  const user = session?.user

  useEffect(() => {
    const refreshUnreadCount = async () => {
      if (!session) return
      try {
        const res = await fetch('/api/notifications?countOnly=1')
        if (!res.ok) return
        const data = await res.json()
        setUnreadCount(typeof data?.unreadCount === 'number' ? data.unreadCount : 0)
      } catch {}
    }
    refreshUnreadCount()
  }, [session])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifications(false)
        setShowUserMenu(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false)
      }
    }
    if (!showNotifications) return
    window.addEventListener('mousedown', onMouseDown)
    return () => window.removeEventListener('mousedown', onMouseDown)
  }, [showNotifications])

  const refreshUnreadCount = async () => {
    if (!session) return
    try {
      const res = await fetch('/api/notifications?countOnly=1')
      if (!res.ok) return
      const data = await res.json()
      setUnreadCount(typeof data?.unreadCount === 'number' ? data.unreadCount : 0)
    } catch {}
  }

  const loadNotifications = async () => {
    if (!session) return
    setNotificationsLoading(true)
    try {
      const res = await fetch('/api/notifications?limit=20')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(Array.isArray(data) ? data : [])
    } finally {
      setNotificationsLoading(false)
    }
  }

  const toggleNotifications = async () => {
    const next = !showNotifications
    setShowNotifications(next)
    if (next) {
      setShowUserMenu(false)
      await loadNotifications()
      await refreshUnreadCount()
    }
  }

  const markOneRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) return
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      await refreshUnreadCount()
    } catch {}
  }

  const markAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      if (!res.ok) return
      setNotifications([])
      await refreshUnreadCount()
    } catch {}
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/auth/signin')
  }

  return (
    <header className="flex justify-between items-center w-full px-6 h-16 sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
      {/* Left Side: Brand name */}
      <div className="flex items-center gap-stack-md">
        <Link href="/dashboard" className="font-headline-sm text-headline-sm font-bold text-primary md:hidden">
          ProBiddr
        </Link>
      </div>

      {/* Right Side: Search, Notification, Settings, User Menu */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            className="pl-10 pr-4 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-1 focus:ring-primary w-64 transition-all"
            placeholder="Sistemde ara..."
            type="text"
          />
        </div>

        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={toggleNotifications}
            className="relative p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors cursor-pointer"
            aria-label="Bildirimler"
            aria-expanded={showNotifications}
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 flex items-center justify-center bg-error text-on-error text-[10px] font-bold rounded-full">
                {unreadCount > 9 ? '9+' : String(unreadCount)}
              </span>
            ) : null}
          </button>

          {showNotifications ? (
            <div className="absolute right-0 mt-2 w-[360px] max-w-[90vw] rounded-lg shadow-[0_4px_12px_rgba(30,41,59,0.05)] bg-surface-container-lowest ring-1 ring-outline-variant z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
                <div className="text-sm font-bold text-primary">Bildirimler</div>
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-semibold text-on-surface-variant hover:text-primary"
                >
                  Tümünü okundu yap
                </button>
              </div>

              <div className="max-h-[380px] overflow-auto">
                {notificationsLoading ? (
                  <div className="px-4 py-3 text-sm text-on-surface-variant">Yükleniyor...</div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-on-surface-variant">Okunmamış bildirim yok.</div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => markOneRead(n.id)}
                      className="w-full text-left px-4 py-3 hover:bg-surface-container transition-colors border-b border-outline-variant/60 last:border-b-0"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-on-surface truncate">{n.title}</div>
                          <div className="text-xs text-on-surface-variant mt-1 max-h-8 overflow-hidden text-ellipsis">
                            {n.message}
                          </div>
                        </div>
                        <div className="text-[10px] text-on-surface-variant whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleString('tr-TR')}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        <Link href="/ayarlar" className="material-symbols-outlined p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors cursor-pointer text-[22px]">
          settings
        </Link>

        {/* User Profile */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu)
                setShowNotifications(false)
              }}
              className="w-8 h-8 rounded-full bg-primary-fixed overflow-hidden border border-outline-variant flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {user.image ? (
                <img src={user.image} alt="Profil Resmi" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-primary">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </button>

            {showUserMenu && (
              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-[0_4px_12px_rgba(30,41,59,0.05)] bg-surface-container-lowest ring-1 ring-outline-variant focus:outline-none z-50 p-1">
                <div className="px-4 py-3 border-b border-outline-variant">
                  <p className="text-sm font-bold text-primary truncate leading-tight">
                    {user.name || 'Kullanıcı'}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">
                    {user.email || ''}
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-secondary-container text-on-secondary-container rounded-full">
                    {(user as any).rol || 'OPERASYON'}
                  </span>
                </div>
                <div className="py-1">
                  <Link
                    href="/ayarlar"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container rounded-md transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                    Profil Ayarları
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      handleSignOut()
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error-container rounded-md transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Çıkış Yap
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex space-x-2">
            <Link
              href="/auth/signin"
              className="text-on-surface-variant hover:text-primary px-3 py-1.5 rounded-lg text-sm font-medium"
            >
              Giriş Yap
            </Link>
            <Link
              href="/auth/signup"
              className="bg-primary text-white hover:opacity-90 px-4 py-1.5 rounded-lg text-sm font-medium transition-opacity"
            >
              Kayıt Ol
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default TopBar
