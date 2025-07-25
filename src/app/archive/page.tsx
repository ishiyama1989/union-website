'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Post } from '@/lib/posts'
import PostModal from '@/components/PostModal'

export default function ArchivePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // 利用可能な年月を取得
  useEffect(() => {
    fetchAvailableDates()
  }, [])

  // 年が変わったら月をリセット
  useEffect(() => {
    if (selectedYear) {
      fetchAvailableMonthsForYear(selectedYear)
      setSelectedMonth('')
    }
  }, [selectedYear])

  // 年月が選択されたら投稿を取得
  useEffect(() => {
    fetchPosts()
  }, [selectedYear, selectedMonth])

  const fetchAvailableDates = async () => {
    try {
      const response = await fetch('/api/posts/archive')
      if (response.ok) {
        const allPosts: Post[] = await response.json()
        const years: string[] = [...new Set(allPosts.map((post: Post) => 
          new Date(post.createdAt).getFullYear().toString()
        ))]
        years.sort((a, b) => parseInt(b) - parseInt(a))
        
        setAvailableYears(years)
        if (years.length > 0) {
          setSelectedYear(years[0]) // 最新年を初期選択
        }
      }
    } catch (error) {
      console.error('Error fetching available dates:', error)
    }
  }

  const fetchAvailableMonthsForYear = async (year: string) => {
    try {
      const response = await fetch(`/api/posts/archive?year=${year}`)
      if (response.ok) {
        const yearPosts: Post[] = await response.json()
        const months: string[] = [...new Set(yearPosts.map((post: Post) => 
          (new Date(post.createdAt).getMonth() + 1).toString().padStart(2, '0')
        ))]
        months.sort((a, b) => parseInt(b) - parseInt(a))
        
        setAvailableMonths(months)
      }
    } catch (error) {
      console.error('Error fetching available months:', error)
    }
  }

  const fetchPosts = async () => {
    setLoading(true)
    try {
      let url = '/api/posts/archive'
      const params = new URLSearchParams()
      
      if (selectedYear) params.append('year', selectedYear)
      if (selectedMonth) params.append('month', selectedMonth)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data: Post[] = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMonthName = (month: string) => {
    const monthNames = [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ]
    return monthNames[parseInt(month) - 1]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-800 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl md:text-2xl font-bold hover:opacity-80">
              ← 富士急行労働組合
            </Link>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 text-blue-800">
            ニュース・お知らせアーカイブ
          </h1>

          {/* 年月選択 */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">年を選択</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">全ての年</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}年</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">月を選択</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    disabled={!selectedYear}
                  >
                    <option value="">全ての月</option>
                    {availableMonths.map(month => (
                      <option key={month} value={month}>{getMonthName(month)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 投稿一覧 */}
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">読み込み中...</div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <article key={post.id} className="bg-white p-6 rounded-lg shadow-md">
                      <div className="flex justify-between items-start mb-2">
                        <time className="text-gray-800 text-sm font-medium">
                          {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                        </time>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {post.category}
                        </span>
                      </div>
                      <h3 
                        className="text-xl font-bold mt-2 mb-2 cursor-pointer text-blue-900 hover:text-blue-700 transition-colors"
                        onClick={() => setSelectedPost(post)}
                      >
                        {post.title}
                      </h3>
                      {post.imageUrls && post.imageUrls.length > 0 && (
                        <div className="mb-3">
                          {post.imageUrls.length === 1 ? (
                            <div className="flex justify-center bg-gray-50 rounded-lg p-2">
                              <img 
                                src={post.imageUrls[0]} 
                                alt={post.title} 
                                className="max-w-full max-h-48 object-contain rounded-lg"
                              />
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {post.imageUrls.map((imageUrl, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-1 flex items-center justify-center">
                                  <img 
                                    src={imageUrl} 
                                    alt={`${post.title} - ${index + 1}`} 
                                    className="max-w-full max-h-24 md:max-h-32 object-contain rounded"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-gray-900">{post.excerpt}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-600">
                    {selectedYear || selectedMonth ? 
                      '選択された期間にニュースがありません。' : 
                      'ニュースがありません。'
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 記事詳細モーダル */}
      {selectedPost && (
        <PostModal 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)} 
        />
      )}
    </div>
  )
}