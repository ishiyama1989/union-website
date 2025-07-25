'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Post } from '@/lib/posts'

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      } else if (response.status === 401) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublished: !currentStatus }),
      })

      if (response.ok) {
        setPosts(posts.map(post => 
          post.id === id ? { ...post, isPublished: !currentStatus } : post
        ))
        setMessage(`投稿を${!currentStatus ? '公開' : '非公開'}にしました。`)
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error toggling publish status:', error)
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm('この投稿を削除してもよろしいですか？')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== id))
        setMessage('投稿を削除しました。')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error deleting post:', error)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-800 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">投稿管理</h1>
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
          投稿管理
        </div>

        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{message}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">投稿一覧</h2>
          <Link
            href="/admin/posts/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            新規投稿
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-800">まだ投稿はありません。</p>
            <Link
              href="/admin/posts/new"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              最初の投稿を作成
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* テーブルヘッダー（デスクトップ用） */}
            <div className="hidden md:grid md:grid-cols-7 gap-4 p-4 bg-gray-50 border-b font-medium text-gray-700">
              <div>画像</div>
              <div>タイトル</div>
              <div>カテゴリ</div>
              <div>作成日</div>
              <div>更新日</div>
              <div>公開状態</div>
              <div>アクション</div>
            </div>

            {/* 投稿リスト */}
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 border-b last:border-b-0 md:grid md:grid-cols-7 gap-4 items-center"
              >
                <div className="mb-2 md:mb-0">
                  <div className="md:hidden font-medium text-gray-700 mb-1">画像:</div>
                  {post.imageUrls && post.imageUrls.length > 0 ? (
                    <div className="flex gap-1 overflow-x-auto">
                      {post.imageUrls.slice(0, 3).map((imageUrl, index) => (
                        <img 
                          key={index}
                          src={imageUrl} 
                          alt={`${post.title} - ${index + 1}`} 
                          className="w-12 h-12 md:w-16 md:h-16 object-cover rounded flex-shrink-0"
                        />
                      ))}
                      {post.imageUrls.length > 3 && (
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 text-xs">+{post.imageUrls.length - 3}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-gray-600 text-xs">画像なし</span>
                    </div>
                  )}
                </div>

                <div className="mb-2 md:mb-0">
                  <div className="md:hidden font-medium text-gray-700 mb-1">タイトル:</div>
                  <div className="font-medium">{post.title}</div>
                </div>

                <div className="mb-2 md:mb-0">
                  <div className="md:hidden font-medium text-gray-700 mb-1">カテゴリ:</div>
                  <div className="text-sm text-gray-800">{post.category}</div>
                </div>

                <div className="mb-2 md:mb-0">
                  <div className="md:hidden font-medium text-gray-700 mb-1">作成日:</div>
                  <div className="text-sm text-gray-800">
                    {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>

                <div className="mb-2 md:mb-0">
                  <div className="md:hidden font-medium text-gray-700 mb-1">更新日:</div>
                  <div className="text-sm text-gray-800">
                    {new Date(post.updatedAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>

                <div className="mb-2 md:mb-0">
                  <div className="md:hidden font-medium text-gray-700 mb-1">公開状態:</div>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      post.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {post.isPublished ? '公開中' : '下書き'}
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    編集
                  </Link>

                  <button
                    onClick={() => togglePublish(post.id, post.isPublished)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                  >
                    {post.isPublished ? '非公開' : '公開'}
                  </button>

                  <button
                    onClick={() => deletePost(post.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}