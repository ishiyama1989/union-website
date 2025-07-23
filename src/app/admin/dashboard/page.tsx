'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Stats {
  total: number
  unread: number
  thisMonth: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, unread: 0, thisMonth: 0 })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else if (response.status === 401) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-800 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">管理画面</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">ダッシュボード</h2>

        {/* 統計カード */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-blue-800 mb-2">{stats.total}</div>
            <div className="text-gray-600">総投稿数</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className={`text-3xl font-bold mb-2 ${stats.unread > 0 ? 'text-red-600' : 'text-blue-800'}`}>
              {stats.unread}
            </div>
            <div className="text-gray-600">未読投稿</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-blue-800 mb-2">{stats.thisMonth}</div>
            <div className="text-gray-600">今月の投稿</div>
          </div>
        </div>

        {/* アクションカード */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-bold text-blue-800 mb-4">意見管理</h3>
            <p className="text-gray-600 mb-6">組合員から投稿された意見の確認・管理を行います。</p>
            <Link
              href="/admin/opinions"
              className="bg-blue-800 text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-colors"
            >
              意見一覧を見る
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-bold text-blue-800 mb-4">システム情報</h3>
            <p className="text-gray-600 mb-4">システムの稼働状況や基本情報を確認します。</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>データベース:</strong> 正常</p>
              <p><strong>最終更新:</strong> {new Date().toLocaleString('ja-JP')}</p>
            </div>
          </div>
        </div>

        {/* 未読通知 */}
        {stats.unread > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>お知らせ:</strong> {stats.unread}件の未読意見があります。
                  <Link href="/admin/opinions" className="underline ml-1">確認する</Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}