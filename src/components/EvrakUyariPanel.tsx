'use client'

import React from 'react'

interface DocumentItem {
  id: string
  ad: string
  tip: string
  sonGecerlilikTarihi: Date
  durum: string
}

interface EvrakUyariPanelProps {
  documents: DocumentItem[]
  title?: string
}

const EvrakUyariPanel: React.FC<EvrakUyariPanelProps> = ({ documents, title = 'Şirket Evrakları' }) => {
  // Calculate days until expiration
  const getDaysUntilExpiration = (sonGecerlilikTarihi: Date) => {
    const now = new Date()
    const diffTime = sonGecerlilikTarihi.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get warning level and styling
  const getWarningLevel = (days: number) => {
    if (days <= 30) return { level: 'KRITIK', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
    if (days <= 60) return { level: 'YÜKSEK', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' }
    if (days <= 90) return { level: 'ORTA', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' }
    return { level: 'DÜŞÜK', color: 'text-on-surface-variant', bgColor: 'bg-surface-container-low', borderColor: 'border-outline-variant' }
  }

  // Filter expired documents
  const expiredDocuments = documents.filter(doc => getDaysUntilExpiration(doc.sonGecerlilikTarihi) < 0)
  const warningDocuments = documents.filter(doc => getDaysUntilExpiration(doc.sonGecerlilikTarihi) >= 0 && getDaysUntilExpiration(doc.sonGecerlilikTarihi) <= 90)

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-semibold text-on-surface">
            {title}
          </h3>
          <div className="flex items-center space-x-2">
            {expiredDocuments.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {expiredDocuments.length} Süresi Geçmiş
              </span>
            )}
            {warningDocuments.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {warningDocuments.length} Yaklaşan
              </span>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 0l3-3m-3 3h6m-6 0l6 6" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-900">Süresi Geçmiş</p>
                <p className="text-2xl font-bold text-red-600">{expiredDocuments.length}</p>
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
                <p className="text-sm font-medium text-orange-900">30 Günden Az</p>
                <p className="text-2xl font-bold text-orange-600">
                  {documents.filter(doc => getDaysUntilExpiration(doc.sonGecerlilikTarihi) > 0 && getDaysUntilExpiration(doc.sonGecerlilikTarihi) <= 30).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0 0l3-3m-3 3h6m-6 0l6 6" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-900">60 Günden Az</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {documents.filter(doc => getDaysUntilExpiration(doc.sonGecerlilikTarihi) > 30 && getDaysUntilExpiration(doc.sonGecerlilikTarihi) <= 60).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2m0 0l7-7 7 7M5 10v2a3 3 0 003-3h14a3 3 0 003-3v-2m-6 4l2-2m0 0l7-7 7 7M5 10v2a3 3 0 003-3h14a3 3 0 003-3v-2" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-on-surface">90 Güne Kadar</p>
                <p className="text-2xl font-bold text-on-surface-variant">
                  {documents.filter(doc => getDaysUntilExpiration(doc.sonGecerlilikTarihi) > 60 && getDaysUntilExpiration(doc.sonGecerlilikTarihi) <= 90).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed List */}
        <div className="overflow-x-auto border border-outline-variant rounded-lg">
          <table className="min-w-full divide-y divide-outline-variant">
            <thead className="bg-surface-container-low">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Evrak Adı
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Tip
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Son Geçerlilik
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Kalan Gün
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface-container-lowest divide-y divide-outline-variant">
              {[...expiredDocuments, ...warningDocuments].map((doc) => {
                const daysUntilExpiration = getDaysUntilExpiration(doc.sonGecerlilikTarihi)
                const warningLevel = getWarningLevel(daysUntilExpiration)
                
                return (
                  <tr key={doc.id} className={warningLevel.bgColor}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-on-surface">
                      {doc.ad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                      {doc.tip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                      {doc.sonGecerlilikTarihi.toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${warningLevel.bgColor} ${warningLevel.color}`}>
                        {daysUntilExpiration < 0 ? 'Süresi Geçmiş' : `${Math.abs(daysUntilExpiration)} gün`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${warningLevel.bgColor} ${warningLevel.color}`}>
                        {doc.durum}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* No Documents Message */}
        {documents.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 0h6m2 0H7a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-2m0 0V8a2 2 0 002 2h10a2 2 0 002-2v6a2 2 0 002-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-on-surface">Kayıtlı evrak bulunamadı</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              Henüz hiçbir şirket evrağı yüklenmemiş.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EvrakUyariPanel
