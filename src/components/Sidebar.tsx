'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  name: string
  href: string
  iconName: string
  current?: boolean
}

const Sidebar = () => {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setExpanded(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navigation: NavItem[] = [
    {
      name: 'Kontrol Paneli',
      href: '/dashboard',
      iconName: 'dashboard',
      current: pathname === '/dashboard'
    },
    {
      name: 'Şirket Evrakları',
      href: '/sirket-evraklari',
      iconName: 'folder_open',
      current: pathname.startsWith('/sirket-evraklari')
    },
    {
      name: 'Yaklaşık Maliyet',
      href: '/yaklasik-maliyet',
      iconName: 'calculate',
      current: pathname.startsWith('/yaklasik-maliyet')
    },
    {
      name: 'İhaleler',
      href: '/ihaleler',
      iconName: 'gavel',
      current: pathname.startsWith('/ihaleler')
    },
    {
      name: 'Kurumlar',
      href: '/kurumlar',
      iconName: 'corporate_fare',
      current: pathname.startsWith('/kurumlar')
    },
    {
      name: 'Simülasyonlar',
      href: '/simulasyonlar',
      iconName: 'monitoring',
      current: pathname.startsWith('/simulasyonlar')
    },
    {
      name: 'Hukuki Süreç',
      href: '/hukuki-surec',
      iconName: 'balance',
      current: pathname.startsWith('/hukuki-surec')
    },
    {
      name: 'Sözleşmeler',
      href: '/sozlesmeler',
      iconName: 'edit_document',
      current: pathname.startsWith('/sozlesmeler')
    },
    {
      name: 'Personel',
      href: '/personel',
      iconName: 'groups',
      current: pathname.startsWith('/personel')
    },
    {
      name: 'Hakediş',
      href: '/hakedis',
      iconName: 'payments',
      current: pathname.startsWith('/hakedis')
    },
    {
      name: 'Raporlar',
      href: '/raporlar',
      iconName: 'analytics',
      current: pathname.startsWith('/raporlar')
    },
    {
      name: 'Ayarlar',
      href: '/ayarlar',
      iconName: 'settings',
      current: pathname.startsWith('/ayarlar')
    }
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="fixed top-4 left-4 z-50 p-2 bg-surface-container-lowest text-primary border border-outline-variant rounded-md hover:bg-surface-container transition-colors duration-150"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-surface-container-lowest border-r border-outline-variant transition-all duration-300 transform ${
          isMobile ? (expanded ? 'translate-x-0' : '-translate-x-full') : ''
        } ${expanded ? 'w-60' : 'w-16'} lg:translate-x-0`}
      >
        {/* Brand/Logo */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-outline-variant">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-base">P</span>
            </div>
            {expanded && (
              <div>
                <span className="text-primary font-bold text-sm tracking-wide block">ProBiddr</span>
                <span className="text-[10px] text-on-surface-variant font-medium block leading-none">4734 İhale Portalı</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              title={!expanded ? item.name : undefined}
              className={`group relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-150 ${
                item.current
                  ? 'bg-secondary-container text-on-secondary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
              }`}
              onClick={() => isMobile && setExpanded(false)}
            >
              <span 
                className={`material-symbols-outlined text-[20px] transition-colors ${
                  item.current ? 'text-on-secondary-container' : 'text-on-surface-variant group-hover:text-primary'
                } ${expanded ? 'mr-3' : ''}`}
                style={item.current ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.iconName}
              </span>
              {!expanded && (
                <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-md border border-outline-variant bg-surface-container-lowest px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.name}
                </span>
              )}
              {expanded && (
                <span className="font-sans text-xs tracking-wider uppercase font-semibold leading-none pt-0.5">
                  {item.name}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Toggle Button for Desktop */}
        {!isMobile && (
          <div className="border-t border-outline-variant p-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center px-2 py-2 text-on-surface-variant rounded-lg hover:bg-surface-container hover:text-primary transition-colors duration-150"
            >
              <span className="material-symbols-outlined">
                {expanded ? 'chevron_left' : 'chevron_right'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {isMobile && expanded && (
        <div 
          className="fixed inset-0 z-30 bg-primary/20 backdrop-blur-sm lg:hidden"
          onClick={() => setExpanded(false)}
        />
      )}
    </>
  )
}

export default Sidebar
