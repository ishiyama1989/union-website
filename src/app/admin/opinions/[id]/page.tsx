'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Opinion } from '@/lib/opinions'

export default function OpinionDetail({ params }: { params: Promise<{ id: string }> }) {
  const [opinion, setOpinion] = useState<Opinion | null>(null)
  const [loading, setLoading] = useState(true)
  const [paramId, setParamId] = useState<string>('')
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
      fetchOpinion()
    }
  }, [paramId])

  const fetchOpinion = async () => {
    try {
      const response = await fetch(`/api/opinions/${paramId}`)
      if (response.ok) {
        const data = await response.json()
        setOpinion(data)
        
        // 自動的に既読にする
        if (!data.isRead) {
          await fetch(`/api/opinions/${paramId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isRead: true }),
          })
          setOpinion({ ...data, isRead: true })
        }
      } else if (response.status === 401) {
        router.push('/admin')
      } else if (response.status === 404) {
        router.push('/admin/opinions')
      }
    } catch (error) {
      console.error('Error fetching opinion:', error)
      router.push('/admin/opinions')
    } finally {
      setLoading(false)
    }
  }

  const deleteOpinion = async () => {
    if (!confirm('この意見を削除してもよろしいですか？')) {
      return
    }

    try {
      const response = await fetch(`/api/opinions/${paramId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin/opinions')
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

  const handlePrint = () => {
    window.print()
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

  if (!opinion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">意見が見つかりません。</p>
          <Link
            href="/admin/opinions"
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
      <header className="bg-blue-800 text-white print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">意見詳細</h1>
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
        <div className="mb-4 text-sm text-gray-600 print:hidden">
          <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">
            ダッシュボード
          </Link>
          {' > '}
          <Link href="/admin/opinions" className="text-blue-600 hover:text-blue-800">
            意見管理
          </Link>
          {' > '}
          意見詳細
        </div>

        {/* 意見詳細 */}
        <div className="bg-white rounded-lg shadow-md p-8 print:shadow-none print:border">
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4 pb-4 border-b">
              <div className="font-medium text-gray-700">投稿日時</div>
              <div className="md:col-span-3">
                {new Date(opinion.createdAt).toLocaleString('ja-JP')}
              </div>
            </div>


            <div className="grid md:grid-cols-4 gap-4 pb-4 border-b">
              <div className="font-medium text-gray-700">投稿者</div>
              <div className="md:col-span-3">
                {opinion.isAnonymous ? (
                  <span className="text-gray-500 italic">匿名での投稿</span>
                ) : (
                  opinion.name
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 pb-4 border-b">
              <div className="font-medium text-gray-700">所属・職場</div>
              <div className="md:col-span-3">
                {opinion.department || '未記入'}
              </div>
            </div>


            <div className="grid md:grid-cols-4 gap-4 pb-4 border-b">
              <div className="font-medium text-gray-700">ステータス</div>
              <div className="md:col-span-3">
                <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                  既読
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="font-medium text-gray-700">ご意見・ご要望</div>
              <div className="md:col-span-3">
                <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap leading-relaxed">
                  {opinion.content}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-4 mt-8 print:hidden">
          <Link
            href="/admin/opinions"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
          >
            一覧に戻る
          </Link>

          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            印刷
          </button>

          <button
            onClick={deleteOpinion}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
          >
            削除
          </button>
        </div>
      </main>

      {/* 印刷用スタイル */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border {
            border: 1px solid #ccc !important;
          }
        }
      `}</style>
    </div>
  )
}