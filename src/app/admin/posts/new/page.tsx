'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewPost() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '活動報告',
    isPublished: false
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // 最大サイズを800pxに制限
        const maxSize = 800
        let { width, height } = img
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        }, file.type, 0.7) // 70%品質で圧縮
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length + imageFiles.length > 3) {
      alert('画像は3枚まで選択できます')
      return
    }
    
    // 各ファイルのサイズをチェック
    const oversizedFiles = files.filter(file => file.size > 2 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      alert('2MB以下の画像をご利用ください')
      return
    }
    
    // 画像圧縮
    const compressedFiles = await Promise.all(files.map(compressImage))
    const newFiles = [...imageFiles, ...compressedFiles]
    setImageFiles(newFiles)
    
    // プレビュー生成
    const newPreviews = [...imagePreviews]
    compressedFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string)
        if (newPreviews.length === newFiles.length) {
          setImagePreviews(newPreviews)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const imageUrls: string[] = []
      
      // 画像アップロード処理
      for (const file of imageFiles) {
        const formDataForImage = new FormData()
        formDataForImage.append('image', file)
        
        const imageResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataForImage
        })
        
        if (imageResponse.ok) {
          const { imageUrl } = await imageResponse.json()
          imageUrls.push(imageUrl)
        }
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, imageUrls })
      })

      if (response.ok) {
        router.push('/admin/posts')
      } else if (response.status === 401) {
        router.push('/admin')
      } else {
        const data = await response.json()
        setError(data.error || '投稿の作成に失敗しました')
      }
    } catch {
      setError('システムエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin')
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-800 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">新規投稿</h1>
            <div className="flex gap-2">
              <Link
                href="/"
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
              >
                サイトへ戻る
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* パンくずリスト */}
        <div className="mb-4 text-sm text-gray-600">
          <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">
            ダッシュボード
          </Link>
          {' > '}
          <Link href="/admin/posts" className="text-blue-600 hover:text-blue-800">
            投稿管理
          </Link>
          {' > '}
          新規投稿
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="労使定例会議開催のお知らせ"
              />
              <small className="text-gray-500">100文字以内</small>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">カテゴリ</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="活動報告">活動報告</option>
                <option value="お知らせ">お知らせ</option>
                <option value="労使定例">労使定例</option>
                <option value="その他">その他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">概要</label>
              <textarea
                rows={3}
                maxLength={200}
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="この投稿の概要を入力してください（空白の場合は本文から自動生成されます）"
              />
              <small className="text-gray-500">200文字以内（省略可能）</small>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={12}
                maxLength={5000}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="本日、労使定例会議を開催いたしました。
主な議題：
1. 労働条件の改善について
2. 職場環境の安全確保
3. 福利厚生の充実

詳細な内容については、組合員の皆様に後日お知らせいたします。"
              />
              <small className="text-gray-500">5000文字以内</small>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">画像（3枚まで）</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                disabled={imageFiles.length >= 3}
              />
              {imagePreviews.length > 0 && (
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative bg-gray-50 rounded-lg p-2 flex items-center justify-center min-h-32">
                      <img 
                        src={preview} 
                        alt={`プレビュー ${index + 1}`} 
                        className="max-w-full max-h-28 object-contain rounded" 
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <small className="text-gray-500">JPG, PNG, GIF形式（最大2MB、3枚まで、自動圧縮されます）</small>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                  className="mr-2"
                />
                すぐに公開する（チェックしない場合は下書きとして保存されます）
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:bg-gray-400"
              >
                {loading ? '投稿中...' : (formData.isPublished ? '投稿して公開' : '下書きとして保存')}
              </button>
              
              <Link
                href="/admin/posts"
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-center"
              >
                キャンセル
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}