'use client'

import React from 'react'

interface SozlesmeItem {
  id: string
  ihaleNo: string
  ad: string
  bitisTarihi: Date
  sozlesmeTarihi: Date
  durum: string
  sozlesmeBedeli?: number
  odemeDurumu?: string
  sonOdemeTarihi?: Date
}

interface SozlesmeUyariPanelProps {
  sozlesmeler: SozlesmeItem[]
  title?: string
}

const SozlesmeUyariPanel: React.FC<SozlesmeUyariPanelProps> = ({ 
  sozlesmeler, 
  title = 'Sözleşme Uyarıları' 
}) => {
  // Calculate days until payment deadline
  const getDaysUntilPayment = (sonOdemeTarihi: Date) => {
    const now = new Date()
    const diffTime = sonOdemeTarihi.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get warning level and styling
  const getPaymentWarningLevel = (days: number) => {
    if (days <= 7) return { level: 'KRITIK', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
    if (days <= 15) return { level: 'YÜKSEK', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' }
    if (days <= 30) return { level: 'ORTA', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' }
    return { level: 'DÜŞÜK', color: 'text-on-surface-variant', bgColor: 'bg-surface-container-low', borderColor: 'border-outline-variant' }
  }

  // Get contract status level
  const getContractStatusLevel = (durum: string, sozlesmeTarihi: Date) => {
    const now = new Date()
    const daysSinceContract = Math.ceil((now.getTime() - sozlesmeTarihi.getTime()) / (1000 * 60 * 60 * 24))
    
    if (durum === 'İPTAL') return { level: 'İPTAL', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
    if (durum === 'TAMAMLANDI') return { level: 'TAMAMLANDI', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
    if (daysSinceContract <= 30) return { level: 'YENİ', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' }
    return { level: 'DEVAM', color: 'text-on-surface-variant', bgColor: 'bg-surface-container-low', borderColor: 'border-outline-variant' }
  }

  // Filter contracts by warning level
  const criticalPayments = sozlesmeler.filter(s => 
    s.sonOdemeTarihi && getDaysUntilPayment(s.sonOdemeTarihi) <= 7
  )
  const urgentPayments = sozlesmeler.filter(s => 
    s.sonOdemeTarihi && getDaysUntilPayment(s.sonOdemeTarihi) > 7 && getDaysUntilPayment(s.sonOdemeTarihi) <= 15
  )
  const warningPayments = sozlesmeler.filter(s => 
    s.sonOdemeTarihi && getDaysUntilPayment(s.sonOdemeTarihi) > 15 && getDaysUntilPayment(s.sonOdemeTarihi) <= 30
  )
  const overduePayments = sozlesmeler.filter(s => 
    s.sonOdemeTarihi && getDaysUntilPayment(s.sonOdemeTarihi) < 0
  )

  // Filter contracts by status
  const cancelledContracts = sozlesmeler.filter(s => s.durum === 'İPTAL')
  const completedContracts = sozlesmeler.filter(s => s.durum === 'TAMAMLANDI')
  const newContracts = sozlesmeler.filter(s => {
    const statusLevel = getContractStatusLevel(s.durum, s.sozlesmeTarihi)
    return statusLevel.level === 'YENİ'
  })

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {title}
          </h3>
          <div className="flex items-center space-x-2">
            {overduePayments.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {overduePayments.length} Geciken Ödeme
              </span>
            )}
            {criticalPayments.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {criticalPayments.length} Krizik Ödeme
              </span>
            )}
          </div>
        </div>

        {/* Payment Warning Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0 0l3-3m-3 3h6m-6 0l6 6" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-900">Geciken Ödeme</p>
                <p className="text-2xl font-bold text-red-600">{overduePayments.length}</p>
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
                <p className="text-2xl font-bold text-orange-600">{criticalPayments.length}</p>
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
                <p className="text-sm font-medium text-yellow-900">15 Günden Az</p>
                <p className="text-2xl font-bold text-yellow-600">{urgentPayments.length}</p>
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
                <p className="text-sm font-medium text-gray-900">30 Güne Kadar</p>
                <p className="text-2xl font-bold text-gray-600">{warningPayments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-900">İptal</p>
                <p className="text-2xl font-bold text-red-600">{cancelledContracts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0l3-3m-3 3h6m-6 0l6 6" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Yeni</p>
                <p className="text-2xl font-bold text-blue-600">{newContracts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2m0 0l7-7 7 7M5 10v2a3 3 0 003-3h14a3 3 0 003-3v-2m-6 4l2-2m0 0l7-7 7 7M5 10v2a3 3 0 003-3h14a3 3 0 003-3v-2" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Tamamlandı</p>
                <p className="text-2xl font-bold text-green-600">{completedContracts.length}</p>
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
                <p className="text-sm font-medium text-gray-900">Devam Eden</p>
                <p className="text-2xl font-bold text-gray-600">
                  {sozlesmeler.length - cancelledContracts.length - completedContracts.length - newContracts.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed List */}
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-surface-container-low">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İhale No
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adı
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sözleşme Tarihi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Ödeme
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kalan Gün
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ödeme Durumu
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sözleşme Durumu
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sozlesmeler.map((sozlesme) => {
                const daysUntilPayment = sozlesme.sonOdemeTarihi ? getDaysUntilPayment(sozlesme.sonOdemeTarihi) : null
                const paymentWarningLevel = daysUntilPayment !== null ? getPaymentWarningLevel(daysUntilPayment) : null
                const contractStatusLevel = getContractStatusLevel(sozlesme.durum, sozlesme.sozlesmeTarihi)
                
                return (
                  <tr key={sozlesme.id} className={paymentWarningLevel?.bgColor}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sozlesme.ihaleNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sozlesme.ad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sozlesme.sozlesmeTarihi.toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sozlesme.sonOdemeTarihi?.toLocaleDateString('tr-TR') || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {daysUntilPayment !== null && paymentWarningLevel ? (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentWarningLevel.bgColor} ${paymentWarningLevel.color}`}>
                          {daysUntilPayment < 0 ? 'Geciken' : `${Math.abs(daysUntilPayment)} gün`}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-surface-container-low text-on-surface-variant">
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-surface-container-low text-on-surface-variant`}>
                        {sozlesme.odemeDurumu || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${contractStatusLevel.bgColor} ${contractStatusLevel.color}`}>
                        {sozlesme.durum}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* No Contracts Message */}
        {sozlesmeler.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 0h6m2 0H7a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-2m0 0V8a2 2 0 002 2h10a2 2 0 002-2v6a2 2 0 002-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sözleşme Bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              Henüz hiçbir sözleşme bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SozlesmeUyariPanel
