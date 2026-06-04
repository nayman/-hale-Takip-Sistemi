import Link from "next/link"
import { redirect } from "next/navigation"

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await props.searchParams

  if (resolvedParams && ('versiyon' in resolvedParams || 'version' in resolvedParams)) {
    const modules = [
      {
        title: "Raporlama & Analiz Paneli",
        description: "İhale hacmi, kazanma oranları trendleri ve rakip analizleri.",
        href: "/dashboard/analiz",
        icon: "analytics",
        color: "text-blue-600 bg-blue-50 border-blue-100",
      },
      {
        title: "İhaleler ve Süreçler",
        description: "Aktif ihaleler, komisyon atamaları ve durum takipleri.",
        href: "/ihaleler",
        icon: "assignment",
        color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      },
      {
        title: "Maliyet & Teklif Simülasyonu",
        description: "Dinamik maliyet girdileriyle kârlılık projeksiyonu.",
        href: "/simulasyonlar",
        icon: "model_training",
        color: "text-purple-600 bg-purple-50 border-purple-100",
      },
      {
        title: "Yaklaşık Maliyet & Teklifler",
        description: "Detaylı teklif hazırlama, revizyon geçmişi ve versiyonlama.",
        href: "/yaklasik-maliyet",
        icon: "price_change",
        color: "text-amber-600 bg-amber-50 border-amber-100",
      },
      {
        title: "Sözleşme Yönetimi",
        description: "Fikri mülkiyet, teslim hakları ve ortak girişim takipleri.",
        href: "/sozlesmeler",
        icon: "gavel",
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      },
      {
        title: "Banka & Teminat Limitleri",
        description: "Teminat mektupları, komisyon maliyetleri ve limit yönetimi.",
        href: "/ayarlar/bankalar",
        icon: "account_balance",
        color: "text-rose-600 bg-rose-50 border-rose-100",
      },
      {
        title: "10. Madde Evrak Şablonları",
        description: "Kamu İhale Kanunu Madde 10 kapsamındaki evrak şablonları.",
        href: "/ayarlar/onmadde-sablon",
        icon: "folder_special",
        color: "text-teal-600 bg-teal-50 border-teal-100",
      },
    ]

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-gutter">
        {/* Head Link to Google Fonts for Material Symbols */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />

        <div className="max-w-4xl w-full space-y-8">
          {/* Main Branding Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Sprint 2 - UI Manifesto & CSV Entegrasyonu
            </div>
            <h1 className="font-display text-4xl font-extrabold text-primary tracking-tight">
              ProBiddr
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-lg mx-auto">
              Gelişmiş İhale ve Operasyon Yönetim Sistemi. Tüm süreçlerinizi ve mevzuat adımlarınızı tek bir merkezden yönetin.
            </p>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, idx) => (
              <Link
                key={idx}
                href={mod.href}
                className="group block p-6 bg-surface-container-lowest border border-outline-variant rounded-2xl hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl border flex items-center justify-center ${mod.color}`}>
                    <span className="material-symbols-outlined text-[24px]">{mod.icon}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer Status info */}
          <div className="flex justify-between items-center text-[10px] text-on-surface-variant border-t border-outline-variant pt-6">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Veritabanı: Aktif (PostgreSQL / Seeded)</span>
            </div>
            <div className="font-mono">v2.0.0-sprint2</div>
          </div>
        </div>
      </div>
    )
  }

  redirect("/dashboard")
}
