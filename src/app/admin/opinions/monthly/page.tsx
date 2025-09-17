'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface MonthlyStats {
  [monthKey: string]: {
    total: number
    byDepartment: Record<string, number>
  }
}

export default function MonthlyOpinions() {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [exportLoading, setExportLoading] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchMonthlyStats()
  }, [])

  const fetchMonthlyStats = async () => {
    try {
      const response = await fetch('/api/opinions/monthly-stats')
      if (response.ok) {
        const data = await response.json()
        setMonthlyStats(data)
      } else if (response.status === 401) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching monthly stats:', error)
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

  const exportToWord = async (year: number, month: number) => {
    const monthKey = `${year}-${String(month).padStart(2, '0')}`
    setExportLoading(monthKey)
    
    try {
      const response = await fetch('/api/opinions/export-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ year, month }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `意見集約_${year}年${month}月.docx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        setMessage(`${year}年${month}月の意見をWordファイルに出力しました。`)
        setTimeout(() => setMessage(''), 3000)
      } else if (response.status === 404) {
        setMessage(`${year}年${month}月の意見はありません。`)
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Wordファイルの出力に失敗しました。')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error exporting to Word:', error)
      setMessage('Wordファイルの出力に失敗しました。')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setExportLoading(null)
    }
  }

  const sortedMonths = Object.keys(monthlyStats).sort((a, b) => b.localeCompare(a))

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
            <h1 className="text-xl font-bold">月別意見集計</h1>
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
          <Link href="/admin/opinions" className="text-blue-600 hover:text-blue-800">
            意見管理
          </Link>
          {' > '}
          月別集計
        </div>

        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{message}</p>
          </div>
        )}

        <h2 className="text-3xl font-bold text-gray-900 mb-8">月別意見集計</h2>

        {sortedMonths.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-800">まだ意見は投稿されていません。</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedMonths.map((monthKey) => {
              const [year, month] = monthKey.split('-')
              const stats = monthlyStats[monthKey]
              
              return (
                <div key={monthKey} className="bg-white rounded-lg shadow">
                  <div className="bg-blue-50 px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {year}年{parseInt(month)}月 (総計: {stats.total}件)
                    </h3>
                    <button
                      onClick={() => exportToWord(parseInt(year), parseInt(month))}
                      disabled={exportLoading === monthKey}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
                    >
                      {exportLoading === monthKey ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          出力中...
                        </>
                      ) : (
                        <>
                          📄 Word出力
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(stats.byDepartment).map(([department, count]) => (
                        <div key={department} className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600">分解名</div>
                          <div className="font-medium text-gray-900">{department}</div>
                          <div className="text-sm text-gray-600 mt-2">件数</div>
                          <div className="text-xl font-bold text-blue-600">{count}件</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}