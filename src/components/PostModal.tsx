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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-start p-6 border-b">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {post.category}
              </span>
              <time className="text-gray-600 text-sm">
                {new Date(post.createdAt).toLocaleDateString('ja-JP')}
              </time>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 pr-4">{post.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold flex-shrink-0"
          >
            ×
          </button>
        </div>

        {/* 画像表示 */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="p-6 border-b">
            {post.imageUrls.length === 1 ? (
              <img 
                src={post.imageUrls[0]} 
                alt={post.title} 
                className="w-full max-h-96 object-contain rounded-lg mx-auto"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* 本文 */}
        <div className="p-6">
          <div className="prose max-w-none">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* フッター */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}