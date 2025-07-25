'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Post } from '@/lib/posts'

export default function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const [post, setPost] = useState<Post | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '活動報告',
    isPublished: false
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [paramId, setParamId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params
      setParamId(id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (paramId) {
      fetchPost()
    }
  }, [paramId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${paramId}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
        setFormData({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          category: data.category,
          isPublished: data.isPublished
        })
        if (data.imageUrls && data.imageUrls.length > 0) {
          setImagePreviews(data.imageUrls)
        }
      } else if (response.status === 401) {
        router.push('/admin')
      } else if (response.status === 404) {
        router.push('/admin/posts')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      router.push('/admin/posts')
    } finally {
      setLoading(false)
    }
  }

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
    
    if (files.length + imageFiles.length + imagePreviews.length > 3) {
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
        if (newPreviews.length === imagePreviews.length + files.length) {
          setImagePreviews(newPreviews)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    if (index < imagePreviews.length - imageFiles.length) {
      // 既存の画像を削除
      const newPreviews = imagePreviews.filter((_, i) => i !== index)
      setImagePreviews(newPreviews)
    } else {
      // 新しいファイルを削除
      const fileIndex = index - (imagePreviews.length - imageFiles.length)
      const newFiles = imageFiles.filter((_, i) => i !== fileIndex)
      const newPreviews = imagePreviews.filter((_, i) => i !== index)
      setImageFiles(newFiles)
      setImagePreviews(newPreviews)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const existingImageUrls = imagePreviews.slice(0, imagePreviews.length - imageFiles.length)
      const newImageUrls: string[] = []
      
      // 新しい画像のアップロード処理
      for (const file of imageFiles) {
        const formDataForImage = new FormData()
        formDataForImage.append('image', file)
        
        const imageResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataForImage
        })
        
        if (imageResponse.ok) {
          const { imageUrl } = await imageResponse.json()
          newImageUrls.push(imageUrl)
        }
      }

      const allImageUrls = [...existingImageUrls, ...newImageUrls]

      const response = await fetch(`/api/posts/${paramId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, imageUrls: allImageUrls })
      })

      if (response.ok) {
        router.push('/admin/posts')
      } else if (response.status === 401) {
        router.push('/admin')
      } else {
        const data = await response.json()
        setError(data.error || '投稿の更新に失敗しました')
      }
    } catch {
      setError('システムエラーが発生しました')
    } finally {
      setSaving(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800 mx-auto"></div>
          <p className="mt-2 text-gray-800">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800">投稿が見つかりません。</p>
          <Link
            href="/admin/posts"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-800 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">投稿編集</h1>
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
        <div className="mb-4 text-sm text-gray-800">
          <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">
            ダッシュボード
          </Link>
          {' > '}
          <Link href="/admin/posts" className="text-blue-600 hover:text-blue-800">
            投稿管理
          </Link>
          {' > '}
          投稿編集
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <div className="text-sm text-gray-800">
              作成日: {new Date(post.createdAt).toLocaleString('ja-JP')}
            </div>
            <div className="text-sm text-gray-800">
              更新日: {new Date(post.updatedAt).toLocaleString('ja-JP')}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
              />
              <small className="text-gray-700">100文字以内</small>
            </div>

            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">カテゴリ</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
              >
                <option value="活動報告">活動報告</option>
                <option value="お知らせ">お知らせ</option>
                <option value="労使定例">労使定例</option>
                <option value="その他">その他</option>
              </select>
            </div>

            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">概要</label>
              <textarea
                rows={3}
                maxLength={200}
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
              />
              <small className="text-gray-700">200文字以内（省略可能）</small>
            </div>

            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">
                内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={12}
                maxLength={5000}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
              />
              <small className="text-gray-700">5000文字以内</small>
            </div>

            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">画像（3枚まで）</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                disabled={imagePreviews.length >= 3}
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
              <small className="text-gray-700">JPG, PNG, GIF形式（最大2MB、3枚まで、自動圧縮されます）</small>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                  className="mr-2"
                />
                公開する
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:bg-gray-400"
              >
                {saving ? '更新中...' : '更新'}
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