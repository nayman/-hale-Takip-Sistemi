'use client'

import React from 'react'
// No heroicons imports

interface DocumentPreviewProps {
  document: {
    id: string
    ad: string
    dosyaYolu: string
    dosyaAdi: string
    dosyaTipi: string
    dosyaBoyutu: number
  }
  onClose: () => void
  onDownload: () => void
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  onClose,
  onDownload
}) => {
  const previewUrl =
    document.dosyaTipi === 'application/pdf' || document.dosyaTipi.startsWith('image/')
      ? `/api/sirket-evraklari/preview/${document.id}`
      : ''
  const loading = false
  const error = previewUrl ? '' : 'Bu dosya türü için önizleme desteklenmiyor'

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return (
        <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H14V8H20V20Z" />
        </svg>
      )
    } else if (fileType.startsWith('image/')) {
      return (
        <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21,19V5C21,3.67 20.33,3 19.5,3H4.5C3.67,3 3,3.67 3,4.5V19C3,20.33 3.67,21 4.5,21H19.5C20.33,21 21,20.33 21,19M8.5,13.5L11,16.5L14.5,13.5" />
        </svg>
      )
    } else {
      return (
        <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H14V8H20V20Z" />
        </svg>
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-outline-variant">
            <div className="flex items-center space-x-3">
              {getFileIcon(document.dosyaTipi)}
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {document.ad}
                </h3>
                <p className="text-sm text-gray-500">
                  {document.dosyaAdi} • {formatFileSize(document.dosyaBoyutu)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onDownload}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
                title="İndir"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
                title="Kapat"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-gray-600">Önizleme yükleniyor...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 0l3-3m-3 3h6m-6 0l6 6" />
                </svg>
                <p className="mt-4 text-gray-600">{error}</p>
              </div>
            ) : previewUrl ? (
              document.dosyaTipi === 'application/pdf' ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[600px] border-0"
                  title={document.ad}
                />
              ) : (
                <img
                  src={previewUrl}
                  alt={document.ad}
                  className="max-w-full h-auto mx-auto"
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                {getFileIcon(document.dosyaTipi)}
                <p className="mt-4 text-gray-600">Bu dosya türü için önizleme mevcut değil</p>
                <button
                  onClick={onDownload}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Dosyayı İndir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentPreview
