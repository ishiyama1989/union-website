'use client'

import { Post } from '@/lib/posts'

interface PostModalProps {
  post: Post
  onClose: () => void
}

export default function PostModal({ post, onClose }: PostModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-start p-4 md:p-6 border-b">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {post.category}
              </span>
              <time className="text-gray-600 text-sm">
                {new Date(post.createdAt).toLocaleDateString('ja-JP')}
              </time>
            </div>
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 pr-4">{post.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-600 text-xl md:text-2xl font-bold flex-shrink-0 p-1"
          >
            ×
          </button>
        </div>

        {/* 画像表示 */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="p-4 md:p-6 border-b">
            {post.imageUrls.length === 1 ? (
              <img 
                src={post.imageUrls[0]} 
                alt={post.title} 
                className="w-full max-h-64 md:max-h-96 object-contain rounded-lg mx-auto"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                {post.imageUrls.map((imageUrl, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-2 flex items-center justify-center min-h-48">
                    <img 
                      src={imageUrl} 
                      alt={`${post.title} - ${index + 1}`} 
                      className="max-w-full max-h-44 object-contain rounded cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        // 画像クリックで拡大表示
                        const newWindow = window.open()
                        if (newWindow) {
                          newWindow.document.write(`
                            <html>
                              <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;">
                                <img src="${imageUrl}" style="max-width:100%;max-height:100%;object-fit:contain;" alt="${post.title}">
                              </body>
                            </html>
                          `)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PDF表示 */}
        {post.pdfUrls && post.pdfUrls.length > 0 && (
          <div className="p-4 md:p-6 border-b">
            <h3 className="text-base font-semibold text-gray-900 mb-3">添付ファイル（PDF）</h3>
            <div className="space-y-3">
              {post.pdfUrls.map((pdfUrl, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <svg className="w-8 h-8 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">PDF文書 {index + 1}</span>
                    </div>
                    <a
                      href={pdfUrl}
                      download={`document-${index + 1}.pdf`}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      ダウンロード
                    </a>
                  </div>
                  <div className="w-full h-96 border border-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      src={pdfUrl}
                      className="w-full h-full"
                      title={`PDF文書 ${index + 1}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 本文 */}
        <div className="p-4 md:p-6">
          <div className="prose max-w-none">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-3 md:mb-4 text-sm md:text-base text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* フッター */}
        <div className="flex justify-end p-4 md:p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 md:py-2 rounded-lg text-base font-medium min-h-12 md:min-h-auto"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}