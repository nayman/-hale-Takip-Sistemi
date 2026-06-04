'use client'

import React from 'react'

interface YaklasikMaliyetItem {
  id: string
  ihaleNo: string
  ad: string
  sonTeklifTarihi: Date
  durum: string
  butce?: number
  mevcutTeklif?: number
}

interface YaklasikMaliyetUyariPanelProps {
  maliyetler: YaklasikMaliyetItem[]
  title?: string
}

const YaklasikMaliyetUyariPanel: React.FC<YaklasikMaliyetUyariPanelProps> = ({ 
  maliyetler, 
  title = 'Yaklaşık Maliyet Son Teklif Tarihleri' 
}) => {
  // Calculate days until deadline
  const getDaysUntilDeadline = (sonTeklifTarihi: Date) => {
    const now = new Date()
    const diffTime = sonTeklifTarihi.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get warning level and styling
  const getWarningLevel = (days: number) => {
    if (days <= 3) return { level: 'KRITIK', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
    if (days <= 7) return { level: 'YÜKSEK', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' }
    if (days <= 14) return { level: 'ORTA', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' }
    return { level: 'DÜŞÜK', color: 'text-on-surface-variant', bgColor: 'bg-surface-container-low', borderColor: 'border-outline-variant' }
  }

  // Calculate completion percentage
  const getCompletionPercentage = (mevcutTeklif: number, butce: number) => {
    if (!butce || !mevcutTeklif) return 0
    return Math.round((mevcutTeklif / butce) * 100)
  }

  // Filter urgent items (7 days or less)
  const urgentItems = maliyetler.filter(maliyet => getDaysUntilDeadline(maliyet.sonTeklifTarihi) <= 7)
  const warningItems = maliyetler.filter(maliyet => getDaysUntilDeadline(maliyet.sonTeklifTarihi) > 7 && getDaysUntilDeadline(maliyet.sonTeklifTarihi) <= 14)
  const normalItems = maliyetler.filter(maliyet => getDaysUntilDeadline(maliyet.sonTeklifTarihi) > 14)

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {title}
          </h3>
          <div className="flex items-center space-x-2">
            {urgentItems.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {urgentItems.length} Acil
              </span>
            )}
            {warningItems.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {warningItems.length} Yaklaşan
              </span>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 0l3-3m-3 3h6m-6 0l6 6" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-900">3 Günden Az</p>
                <p className="text-2xl font-bold text-red-600">{urgentItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0 0l3-3m-3 3h6m-6 0l6 6" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-900">7 Günden Az</p>
                <p className="text-2xl font-bold text-orange-600">{warningItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2m0 0l7-7 7 7M5 10v2a3 3 0 003-3h14a3 3 0 003-3v-2m-6 4l2-2m0 0l7-7 7 7M5 10v2a3 3 0 003-3h14a3 3 0 003-3v-2" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">14 Günden Fazla</p>
                <p className="text-2xl font-bold text-gray-600">{normalItems.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed List */}
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-outline-variant">
            <thead className="bg-surface-container-low">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İhale No
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adı
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Teklif
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kalan Gün
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamamlanma
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-outline-variant">
              {[...urgentItems, ...warningItems, ...normalItems].map((maliyet) => {
                const daysUntilDeadline = getDaysUntilDeadline(maliyet.sonTeklifTarihi)
                const warningLevel = getWarningLevel(daysUntilDeadline)
                const completionPercentage = getCompletionPercentage(maliyet.mevcutTeklif || 0, maliyet.butce || 0)
                
                return (
                  <tr key={maliyet.id} className={warningLevel.bgColor}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {maliyet.ihaleNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {maliyet.ad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {maliyet.sonTeklifTarihi.toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${warningLevel.bgColor} ${warningLevel.color}`}>
                        {daysUntilDeadline < 0 ? 'Süresi Geçmiş' : `${Math.abs(daysUntilDeadline)} gün`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-surface-container rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${completionPercentage >= 100 ? 'bg-green-500' : completionPercentage >= 75 ? 'bg-blue-500' : completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">{completionPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${warningLevel.bgColor} ${warningLevel.color}`}>
                        {maliyet.durum}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* No Items Message */}
        {maliyetler.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 0h6m2 0H7a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-2m0 0V8a2 2 0 002 2h10a2 2 0 002-2v6a2 2 0 002-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Yaklaşık Maliyet Bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              Henüz hiçbir yaklaşık maliyet kaydı bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default YaklasikMaliyetUyariPanel
