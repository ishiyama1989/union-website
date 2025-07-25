'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Opinion } from '@/lib/opinions'

export default function AdminOpinions() {
  const [opinions, setOpinions] = useState<Opinion[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchOpinions()
  }, [])

  const fetchOpinions = async () => {
    try {
      const response = await fetch('/api/opinions')
      if (response.ok) {
        const data = await response.json()
        setOpinions(data)
      } else if (response.status === 401) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching opinions:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRead = async (id: string, currentIsRead: boolean) => {
    try {
      const response = await fetch(`/api/opinions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: !currentIsRead }),
      })

      if (response.ok) {
        setOpinions(opinions.map(op => 
          op.id === id ? { ...op, isRead: !currentIsRead } : op
        ))
      }
    } catch (error) {
      console.error('Error toggling read status:', error)
    }
  }

  const deleteOpinion = async (id: string) => {
    if (!confirm('この意見を削除してもよろしいですか？')) {
      return
    }

    try {
      const response = await fetch(`/api/opinions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setOpinions(opinions.filter(op => op.id !== id))
        setMessage('意見を削除しました。')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error deleting opinion:', error)
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
            <h1 className="text-xl font-bold">意見管理</h1>
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
          意見管理
        </div>

        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{message}</p>
          </div>
        )}

        <h2 className="text-3xl font-bold text-gray-900 mb-8">投稿された意見一覧</h2>

        {opinions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-800">まだ意見は投稿されていません。</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* テーブルヘッダー（デスクトップ用） */}
            <div className="hidden md:grid md:grid-cols-5 gap-4 p-4 bg-gray-50 border-b font-medium text-gray-700">
              <div>投稿日時</div>
              <div>投稿者</div>
              <div>所属</div>
              <div>ステータス</div>
              <div>アクション</div>
            </div>

            {/* 意見リスト */}
            {opinions.map((opinion) => (
              <div
                key={opinion.id}
                className={`p-4 border-b last:border-b-0 ${
                  !opinion.isRead ? 'bg-yellow-50' : ''
                } md:grid md:grid-cols-5 gap-4 items-center`}
              >
                <div className="mb-2 md:mb-0">
                  <div className="md:hidden font-medium text-gray-700 mb-1">投稿日時:</div>
                  <div className="text-sm text-gray-800">
                    {new Date(opinion.createdAt).toLocaleString('ja-JP')}
                  </div>
                </div>

                <div className="mb-2 md:mb-0">
                  <div className="md:hidden font-medium text-gray-700 mb-1">投稿者:</div>
                  <div>
                    {opinion.isAnonymous ? '匿名' : opinion.name}
                  </div>
                </div>

                <div className="mb-2 md:mb-0">
                  <div className="md:hidden font-medium text-gray-700 mb-1">所属:</div>
                  <div className="text-sm text-gray-800">
                    {opinion.department || '未記入'}
                  </div>
                </div>

                <div className="mb-2 md:mb-0">
                  <div className="md:hidden font-medium text-gray-700 mb-1">ステータス:</div>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      opinion.isRead
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {opinion.isRead ? '既読' : '未読'}
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Link
                    href={`/admin/opinions/${opinion.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    詳細
                  </Link>

                  <button
                    onClick={() => toggleRead(opinion.id, opinion.isRead)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                  >
                    {opinion.isRead ? '未読' : '既読'}
                  </button>

                  <button
                    onClick={() => deleteOpinion(opinion.id)}
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