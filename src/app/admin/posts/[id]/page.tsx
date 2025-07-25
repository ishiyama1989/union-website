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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/posts/${paramId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
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
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">投稿が見つかりません。</p>
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
        <div className="mb-4 text-sm text-gray-600">
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
            <div className="text-sm text-gray-600">
              作成日: {new Date(post.createdAt).toLocaleString('ja-JP')}
            </div>
            <div className="text-sm text-gray-600">
              更新日: {new Date(post.updatedAt).toLocaleString('ja-JP')}
            </div>
          </div>

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
              />
              <small className="text-gray-500">5000文字以内</small>
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