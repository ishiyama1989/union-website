'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Post } from '@/lib/posts'
import PostModal from '@/components/PostModal'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [opinionForm, setOpinionForm] = useState({
    name: '',
    department: '',
    content: '',
    isAnonymous: false
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts/public?limit=3')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }


  const handleOpinionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/opinions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(opinionForm)
      })

      if (response.ok) {
        alert('ご意見をお寄せいただき、ありがとうございました。')
        setOpinionForm({
          name: '',
          department: '',
          content: '',
          isAnonymous: false
        })
      } else {
        alert('送信に失敗しました。時間をおいて再度お試しください。')
      }
    } catch {
      alert('送信中にエラーが発生しました。')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-800 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">富士急行労働組合</h1>
            <nav>
              <ul className="flex space-x-6">
                <li><a href="#about" className="hover:opacity-80">組合について</a></li>
                <li><a href="#news" className="hover:opacity-80">ニュース</a></li>
                <li><a href="#activities" className="hover:opacity-80">活動紹介</a></li>
                <li><a href="#contact" className="hover:opacity-80">ご意見</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* メインビジュアル */}
        <section className="bg-gradient-to-br from-blue-800 to-blue-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">働く仲間のために、ともに歩む</h2>
            <p className="text-xl">労働者の権利と福利向上のために活動しています</p>
          </div>
        </section>

        {/* ニュース・お知らせ */}
        <section id="news" className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-blue-800">ニュース・お知らせ</h2>
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => (
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
                ))
              ) : (
                <>
                  <article className="bg-white p-6 rounded-lg shadow-md">
                    <time className="text-gray-600 text-sm">2025-07-20</time>
                    <h3 className="text-xl font-bold mt-2 mb-2 text-blue-900">定期大会開催のお知らせ</h3>
                    <p className="text-gray-800">令和7年度定期大会を8月15日に開催いたします。</p>
                  </article>
                  <article className="bg-white p-6 rounded-lg shadow-md">
                    <time className="text-gray-600 text-sm">2025-07-15</time>
                    <h3 className="text-xl font-bold mt-2 mb-2 text-blue-900">賃金改善要求書を提出</h3>
                    <p className="text-gray-800">組合員の労働条件改善に向けた要求書を経営側に提出いたしました。</p>
                  </article>
                  <article className="bg-white p-6 rounded-lg shadow-md">
                    <time className="text-gray-600 text-sm">2025-07-10</time>
                    <h3 className="text-xl font-bold mt-2 mb-2 text-blue-900">労働安全講習会開催</h3>
                    <p className="text-gray-800">職場の安全確保に関する講習会を開催いたします。</p>
                  </article>
                </>
              )}
            </div>
          </div>
        </section>

        {/* 組合について */}
        <section id="about" className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-blue-800">組合について</h2>
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 text-blue-800">私たちの理念</h3>
                <p className="text-gray-800 mb-6">すべての働く仲間が安心して働けるよう、労働条件の改善と職場環境の向上に取り組んでいます。</p>
                
                <h3 className="text-2xl font-bold mb-4 text-blue-800">活動方針</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-800">
                  <li>賃金・労働条件の改善</li>
                  <li>職場の安全・衛生の確保</li>
                  <li>組合員の福利厚生の充実</li>
                  <li>労働者の権利擁護</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 活動紹介 */}
        <section id="activities" className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-blue-800">活動紹介</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-bold mb-4 text-blue-800">労働条件改善</h3>
                <p className="text-gray-800">賃金向上や労働時間短縮などの労働条件改善に向けた交渉を行っています。</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-bold mb-4 text-blue-800">安全衛生活動</h3>
                <p className="text-gray-800">職場の安全確保と健康管理に関する活動を推進しています。</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-bold mb-4 text-blue-800">教育・研修</h3>
                <p className="text-gray-800">組合員の知識向上のための各種講習会や研修を実施しています。</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-bold mb-4 text-blue-800">相談・支援</h3>
                <p className="text-gray-800">労働問題や職場の悩みに関する相談・支援を行っています。</p>
              </div>
            </div>
          </div>
        </section>


        {/* お問い合わせ・意見投稿 */}
        <section id="contact" className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-blue-800">組合員からのご意見</h2>
            
            <div className="max-w-4xl mx-auto">
              {/* 組合員意見投稿 */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600 mb-6 text-center">組合員の皆様からのご意見・ご要望をお聞かせください。</p>
                
                <form onSubmit={handleOpinionSubmit} className="space-y-4">
                  <div>
                    <label className="block text-base font-bold mb-2 text-gray-900">
                      お名前 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={opinionForm.name}
                      onChange={(e) => setOpinionForm({...opinionForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-base font-bold mb-2 text-gray-900">分会名</label>
                    <select
                      value={opinionForm.department}
                      onChange={(e) => setOpinionForm({...opinionForm, department: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                    >
                      <option value="">選択してください</option>
                      <option value="山梨本社分会">山梨本社分会</option>
                      <option value="東京本社分会">東京本社分会</option>
                      <option value="運輸・観光分会">運輸・観光分会</option>
                      <option value="自動車乗務員分会">自動車乗務員分会</option>
                      <option value="管理駅分会">管理駅分会</option>
                      <option value="乗務員・指令分会">乗務員・指令分会</option>
                      <option value="技術・索道分会">技術・索道分会</option>
                      <option value="箱根遊船分会">箱根遊船分会</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-base font-bold mb-2 text-gray-900">
                      ご意見・ご要望 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={6}
                      maxLength={1000}
                      value={opinionForm.content}
                      onChange={(e) => setOpinionForm({...opinionForm, content: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                    />
                    <small className="text-gray-700">1000文字以内でご記入ください</small>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={opinionForm.isAnonymous}
                        onChange={(e) => setOpinionForm({...opinionForm, isAnonymous: e.target.checked})}
                        className="mr-2"
                      />
                      匿名で投稿する
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-blue-800 text-white py-2 px-4 rounded-lg hover:bg-blue-900 transition-colors"
                  >
                    意見を投稿する
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-blue-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">富士急行労働組合</h3>
              <p className="text-blue-100">〒403-0017 山梨県富士吉田市新西匹2-1-1</p>
              <p className="text-blue-100">TEL: 000-000-0000 / FAX: 000-000-0000</p>
              <p className="text-blue-100">Email: info@union-example.jp</p>
            </div>
            
            <div>
              <ul className="space-y-2">
                <li><a href="#about" className="text-blue-100 hover:text-white">組合について</a></li>
                <li><a href="#news" className="text-blue-100 hover:text-white">ニュース</a></li>
                <li><a href="#activities" className="text-blue-100 hover:text-white">活動紹介</a></li>
                <li><Link href="/admin" className="text-blue-100 hover:text-white">管理者ログイン</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-700 mt-8 pt-4 text-center">
            <p className="text-blue-100">&copy; 2025 富士急行労働組合. All rights reserved.</p>
          </div>
        </div>
      </footer>

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
