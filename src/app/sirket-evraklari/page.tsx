'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import EvrakUyariPanel from '@/components/EvrakUyariPanel'

interface SirketEvrak {
  id: string
  ad: string
  tip: string
  kategori: string
  aciklama?: string
  dosyaYolu: string
  dosyaAdi: string
  dosyaBoyutu: number
  dosyaTipi: string
  sonGecerlilikTarihi?: string | Date
  yayinTarihi?: string | Date
  iptalTarihi?: string | Date
  versiyon: number
  durum: string
  createdAt: string | Date
  updatedAt: string | Date
  yukleyenUserId: string
  tenantId: string
  yukleyenUser?: {
    id: string
    name: string
    email: string
  }
}

const SirketEvraklari = () => {
  const { data: session } = useSession()
  const [evraklar, setEvraklar] = useState<SirketEvrak[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvrak, setEditingEvrak] = useState<SirketEvrak | null>(null)
  const [formData, setFormData] = useState({
    ad: '',
    tip: 'KIMLIK',
    kategori: 'PERSONEL',
    aciklama: '',
    sonGecerlilikTarihi: ''
  })

  const toDate = (value: unknown) => {
    if (!value) return null
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
    if (typeof value === 'string') {
      const d = new Date(value)
      return Number.isNaN(d.getTime()) ? null : d
    }
    return null
  }

  const formatDate = (value: unknown) => {
    const d = toDate(value)
    return d ? d.toLocaleDateString('tr-TR') : '-'
  }

  const toDateInputValue = (value: unknown) => {
    const d = toDate(value)
    if (!d) return ''
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 10)
  }

  // Fetch evraklar from API
  useEffect(() => {
    let cancelled = false
    const fetchEvraklar = async () => {
      try {
        const response = await fetch('/api/sirket-evraklari?limit=50', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Evraklar yüklenemedi')
        }

        const data = await response.json()
        if (!cancelled) setEvraklar(data.evraklar || [])
      } catch (error) {
        console.error('Evraklar yüklenirken hata:', error)
        if (!cancelled) setEvraklar([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (!session) {
      const t = setTimeout(() => {
        if (!cancelled) setLoading(false)
      }, 0)
      return () => {
        cancelled = true
        clearTimeout(t)
      }
    }

    const t = setTimeout(() => {
      void fetchEvraklar()
    }, 0)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [session])

  const handleSubmit = async () => {
    if (!formData.ad.trim()) {
      alert('Evrak adı zorunludur')
      return
    }
    
    try {
      const submitData = {
        ...formData,
        sonGecerlilikTarihi: formData.sonGecerlilikTarihi ? new Date(formData.sonGecerlilikTarihi).toISOString() : undefined
      }

      const url = editingEvrak ? '/api/sirket-evraklari' : '/api/sirket-evraklari'
      const method = editingEvrak ? 'PUT' : 'POST'
      const body = editingEvrak ? { ...submitData, id: editingEvrak.id } : submitData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('Evrak kaydedilemedi')
      }

      // Reset form
      setFormData({
        ad: '',
        tip: 'KIMLIK',
        kategori: 'PERSONEL',
        aciklama: '',
        sonGecerlilikTarihi: ''
      })
      setEditingEvrak(null)
      setShowForm(false)

      // Refresh list
      const fetchResponse = await fetch('/api/sirket-evraklari?limit=50')
      const data = await fetchResponse.json()
      setEvraklar(data.evraklar || [])
    } catch (error) {
      console.error('Evrak kaydedilirken hata:', error)
    }
  }

  const handleEdit = (evrak: SirketEvrak) => {
    setEditingEvrak(evrak)
    setFormData({
      ad: evrak.ad,
      tip: evrak.tip,
      kategori: evrak.kategori,
      aciklama: evrak.aciklama || '',
      sonGecerlilikTarihi: toDateInputValue(evrak.sonGecerlilikTarihi)
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu evrağı silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/sirket-evraklari?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Evrak silinemedi')
      }

      // Refresh list
      const fetchResponse = await fetch('/api/sirket-evraklari?limit=50')
      const data = await fetchResponse.json()
      setEvraklar(data.evraklar || [])
    } catch (error) {
      console.error('Evrak silinirken hata:', error)
    }
  }

  const getTipLabel = (tip: string) => {
    const labels: Record<string, string> = {
      'KIMLIK': 'Kimlik',
      'VERGI': 'Vergi',
      'SIGORTA': 'Sigorta',
      'RUHSAT': 'Ruhsat',
      'SERTIFIKA': 'Sertifika',
      'SOZLESME': 'Sözleşme',
      'DIGER': 'Diğer'
    }
    return labels[tip] || tip
  }

  const getKategoriLabel = (kategori: string) => {
    const labels: Record<string, string> = {
      'PERSONEL': 'Personel',
      'MALI': 'Mali',
      'HUKUKI': 'Hukuki',
      'TEKNIK': 'Teknik',
      'IDARI': 'İdari'
    }
    return labels[kategori] || kategori
  }

  const getDurumColor = (durum: string) => {
    switch (durum) {
      case 'AKTIF': return 'bg-secondary-fixed text-on-secondary-fixed border-outline-variant'
      case 'PASIF': return 'bg-surface-container-low text-on-surface-variant border-outline-variant'
      case 'IPTAL': return 'bg-error-container text-on-error-container border-outline-variant'
      default: return 'bg-surface-container-low text-on-surface-variant border-outline-variant'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-on-surface-variant">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        {/* TopBar */}
        <TopBar />

          {/* Main content */}
          <main className="flex-1 p-gutter overflow-y-auto">
            <div className="space-y-stack-lg">
              <div className="max-w-none w-full">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-on-surface">
                    Şirket Evrakları
                  </h1>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary text-on-primary px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                  >
                    Yeni Evrak Ekle
                  </button>
                </div>

                {/* Warning Panel */}
                <EvrakUyariPanel documents={evraklar.map(evrak => ({
                  id: evrak.id,
                  ad: evrak.ad,
                  tip: evrak.tip,
                  sonGecerlilikTarihi: toDate(evrak.sonGecerlilikTarihi) || new Date(),
                  durum: evrak.durum
                }))} />

                {/* Form Modal */}
                {showForm && (
                  <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                      <div className="fixed inset-0 bg-black/50" onClick={() => setShowForm(false)}></div>
                      <div className="relative bg-surface-container-lowest border border-outline-variant shadow-sm rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-on-surface mb-4">
                          {editingEvrak ? 'Evrak Düzenle' : 'Yeni Evrak'}
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-on-surface-variant">
                              Evrak Adı
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.ad}
                              onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                              className="mt-1 block w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-on-surface-variant">
                              Tip
                            </label>
                            <select
                              value={formData.tip}
                              onChange={(e) => setFormData({ ...formData, tip: e.target.value })}
                              className="mt-1 block w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            >
                              <option value="KIMLIK">Kimlik</option>
                              <option value="VERGI">Vergi</option>
                              <option value="SIGORTA">Sigorta</option>
                              <option value="RUHSAT">Ruhsat</option>
                              <option value="SERTIFIKA">Sertifika</option>
                              <option value="SOZLESME">Sözleşme</option>
                              <option value="DIGER">Diğer</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-on-surface-variant">
                              Kategori
                            </label>
                            <select
                              value={formData.kategori}
                              onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                              className="mt-1 block w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            >
                              <option value="PERSONEL">Personel</option>
                              <option value="MALI">Mali</option>
                              <option value="HUKUKI">Hukuki</option>
                              <option value="TEKNIK">Teknik</option>
                              <option value="IDARI">İdari</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-on-surface-variant">
                              Açıklama
                            </label>
                            <textarea
                              value={formData.aciklama}
                              onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                              rows={3}
                              className="mt-1 block w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-on-surface-variant">
                              Son Geçerlilik Tarihi
                            </label>
                            <input
                              type="date"
                              value={formData.sonGecerlilikTarihi}
                              onChange={(e) => setFormData({ ...formData, sonGecerlilikTarihi: e.target.value })}
                              className="mt-1 block w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                          </div>

                          <div className="flex justify-end space-x-3 pt-4">
                            <button
                              type="button"
                              onClick={() => setShowForm(false)}
                              className="bg-surface-container-lowest border border-outline-variant text-on-surface px-4 py-2 rounded-md hover:bg-surface-container transition-colors"
                            >
                              İptal
                            </button>
                            <button
                              type="button"
                              onClick={handleSubmit}
                              className="bg-primary text-on-primary px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                            >
                              {editingEvrak ? 'Güncelle' : 'Kaydet'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              )}

                {/* Documents List */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden mt-6">
                  <div className="p-6">
                    <h3 className="text-lg leading-6 font-semibold text-on-surface mb-4">
                      Tüm Evraklar
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-outline-variant">
                        <thead className="bg-surface-container-low">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                              Adı
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                              Tip
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                              Kategori
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                              Son Geçerlilik
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                              Durum
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                              İşlemler
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-surface-container-lowest divide-y divide-outline-variant">
                          {evraklar.map((evrak) => (
                            <tr key={evrak.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-on-surface">
                                {evrak.ad}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                                {getTipLabel(evrak.tip)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                                {getKategoriLabel(evrak.kategori)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                                {formatDate(evrak.sonGecerlilikTarihi)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getDurumColor(evrak.durum)}`}>
                                  {evrak.durum}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleEdit(evrak)}
                                  className="text-primary hover:opacity-90 mr-3"
                                >
                                  Düzenle
                                </button>
                                <button
                                  onClick={() => handleDelete(evrak.id)}
                                  className="text-error hover:opacity-90"
                                >
                                  Sil
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
      </div>
    </div>
  )
}

export default SirketEvraklari
