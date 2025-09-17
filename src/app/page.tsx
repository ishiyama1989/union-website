'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Post } from '@/lib/posts'
import PostModal from '@/components/PostModal'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [opinionForm, setOpinionForm] = useState({
    name: '',
    department: '',
    content: ''
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
          content: ''
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
            <div className="flex items-center space-x-3">
              <img src="/images/pru-logo.png" alt="PRU" className="h-8 md:h-10 object-contain" />
              <h1 className="text-xl md:text-2xl font-bold">富士急行労働組合</h1>
            </div>
            
            {/* デスクトップナビゲーション */}
            <nav className="hidden md:block">
              <ul className="flex space-x-6">
                <li><a href="#about" className="hover:opacity-80">組合について</a></li>
                <li><a href="#news" className="hover:opacity-80">ニュース</a></li>
                <li><a href="#activities" className="hover:opacity-80">活動紹介</a></li>
                <li><a href="#contact" className="hover:opacity-80">ご意見</a></li>
              </ul>
            </nav>

            {/* モバイルメニューボタン */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="メニュー"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* モバイルメニュー */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4">
              <ul className="space-y-2">
                <li><a href="#about" className="block py-2 hover:opacity-80" onClick={() => setMobileMenuOpen(false)}>組合について</a></li>
                <li><a href="#news" className="block py-2 hover:opacity-80" onClick={() => setMobileMenuOpen(false)}>ニュース</a></li>
                <li><a href="#activities" className="block py-2 hover:opacity-80" onClick={() => setMobileMenuOpen(false)}>活動紹介</a></li>
                <li><a href="#contact" className="block py-2 hover:opacity-80" onClick={() => setMobileMenuOpen(false)}>ご意見</a></li>
              </ul>
            </nav>
          )}
        </div>
      </header>

      <main>
        {/* メインビジュアル */}
        <section className="text-white py-12 md:py-16 relative overflow-hidden min-h-[400px]">
          {/* 背景スライドショー */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 slideshow-bg slide1"
              style={{
                backgroundImage: 'url(/images/taikai-meeting.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            ></div>
            <div 
              className="absolute inset-0 slideshow-bg slide2"
              style={{
                backgroundImage: 'url(/images/taikai-celebration.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            ></div>
            <div 
              className="absolute inset-0 slideshow-bg slide3"
              style={{
                backgroundImage: 'url(/images/taikai-podium.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            ></div>
            <div 
              className="absolute inset-0 slideshow-bg slide4"
              style={{
                backgroundImage: 'url(/images/taikai-speech.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            ></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-20">
            <div className="flex justify-center items-center mb-6">
              <div className="flex space-x-4">
                <div>
                  <img src="/images/train-icon.png" alt="電車" className="w-8 h-8 md:w-12 md:h-12 object-contain" />
                </div>
                <div>
                  <img src="/images/bus-taxi-icon.png" alt="バス・タクシー" className="w-8 h-8 md:w-12 md:h-12 object-contain" />
                </div>
                <div>
                  <img src="/images/leisure-icon.png" alt="レジャー" className="w-8 h-8 md:w-12 md:h-12 object-contain" />
                </div>
                <div>
                  <img src="/images/support-icon.png" alt="組合員サポート" className="w-8 h-8 md:w-12 md:h-12 object-contain" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-4" style={{textShadow: '3px 3px 6px rgba(0, 0, 0, 0.8)'}}>働く仲間のために、ともに歩む</h2>
            <p className="text-lg md:text-xl mb-4" style={{textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)'}}>富士急行グループで働く全ての組合員の</p>
            <p className="text-lg md:text-xl" style={{textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)'}}>労働者の権利と福利向上のために活動しています</p>
          </div>
        </section>
        
        <style jsx global>{`
          .slideshow-bg {
            opacity: 0;
            animation: slideshow 32s infinite;
            transition: opacity 3s ease-in-out;
          }
          
          .slide1 { animation-delay: 0s; }
          .slide2 { animation-delay: 8s; }
          .slide3 { animation-delay: 16s; }
          .slide4 { animation-delay: 24s; }
          
          @keyframes slideshow {
            0% { opacity: 0; }
            8% { opacity: 1; }
            18% { opacity: 1; }
            45% { opacity: 0; }
            100% { opacity: 0; }
          }
        `}</style>

        {/* ニュース・お知らせ */}
        <section id="news" className="py-8 md:py-12 bg-white scroll-mt-20">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-blue-800">ニュース・お知らせ</h2>
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
                    <div className="flex justify-between items-start mb-2">
                      <time className="text-gray-800 text-sm font-medium">2025-07-20</time>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        活動報告
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mt-2 mb-3 text-blue-900">第83回定期大会を開催しました</h3>
                    <div className="mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-center">
                          <img 
                            src="/images/taikai-meeting.jpg" 
                            alt="定期大会の様子" 
                            className="max-w-full max-h-32 md:max-h-40 object-contain rounded"
                          />
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-center">
                          <img 
                            src="/images/taikai-celebration.jpg" 
                            alt="定期大会での団結式" 
                            className="max-w-full max-h-32 md:max-h-40 object-contain rounded"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-900">令和7年度第83回定期大会を無事開催いたしました。多数の組合員の皆様にご参加いただき、今年度の活動方針や予算案について活発な議論が行われました。</p>
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
              
              <div className="text-center mt-8">
                <Link 
                  href="/archive" 
                  className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  過去のニュースを見る（年月別アーカイブ）
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 組合について */}
        <section id="about" className="py-8 md:py-12 bg-gray-50 scroll-mt-20">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-blue-800">組合について</h2>
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-blue-800">私たちの理念</h3>
                <p className="text-gray-800 mb-6">すべての働く仲間が安心して働けるよう、労働条件の改善と職場環境の向上に取り組んでいます。</p>
                
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-blue-800">活動方針</h3>
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
        <section id="activities" className="py-8 md:py-12 bg-white scroll-mt-20">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-blue-800">活動紹介</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {/* 電車アイコン */}
                  <img 
                    src="/images/train-icon.png" 
                    alt="電車" 
                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-blue-800">鉄道事業</h3>
                <p className="text-sm md:text-base text-gray-800">富士急行線の運行・保守に従事する組合員の労働条件改善と安全確保に取り組んでいます。</p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {/* バス・タクシーアイコン */}
                  <img 
                    src="/images/bus-taxi-icon.png" 
                    alt="バス・タクシー" 
                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-blue-800">バス・タクシー事業</h3>
                <p className="text-sm md:text-base text-gray-800">路線バスやタクシー運転手の労働環境改善と安全運行体制の確立を支援しています。</p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {/* レジャーアイコン */}
                  <img 
                    src="/images/leisure-icon.png" 
                    alt="観覧車とジェットコースター" 
                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-blue-800">レジャー事業</h3>
                <p className="text-sm md:text-base text-gray-800">富士急ハイランドやその他観光施設で働く組合員の労働条件向上に努めています。</p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {/* 組合員サポートアイコン */}
                  <img 
                    src="/images/support-icon.png" 
                    alt="組合員サポート" 
                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-blue-800">組合員サポート</h3>
                <p className="text-sm md:text-base text-gray-800">全ての事業部門の組合員の悩み相談、福利厚生の充実、権利擁護に取り組んでいます。</p>
              </div>
            </div>
          </div>
        </section>


        {/* お問い合わせ・意見投稿 */}
        <section id="contact" className="py-8 md:py-12 bg-gray-50 scroll-mt-20">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-blue-800">組合員からのご意見</h2>
            
            <div className="max-w-4xl mx-auto">
              {/* 組合員意見投稿 */}
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                <p className="text-gray-800 mb-4 md:mb-6 text-center text-sm md:text-base">組合員の皆様からのご意見・ご要望をお聞かせください。</p>
                
                <form onSubmit={handleOpinionSubmit} className="space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-sm md:text-base font-bold mb-2 text-gray-900">
                      お名前 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={opinionForm.name}
                      onChange={(e) => setOpinionForm({...opinionForm, name: e.target.value})}
                      className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 text-base md:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm md:text-base font-bold mb-2 text-gray-900">分会名</label>
                    <select
                      value={opinionForm.department}
                      onChange={(e) => setOpinionForm({...opinionForm, department: e.target.value})}
                      className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 text-base md:text-sm"
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
                    <label className="block text-sm md:text-base font-bold mb-2 text-gray-900">
                      ご意見・ご要望 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      maxLength={1000}
                      value={opinionForm.content}
                      onChange={(e) => setOpinionForm({...opinionForm, content: e.target.value})}
                      className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 text-base md:text-sm md:rows-6"
                    />
                    <small className="text-gray-700">1000文字以内でご記入ください</small>
                  </div>
                  
                  
                  <button
                    type="submit"
                    className="w-full bg-blue-800 text-white py-3 md:py-2 px-4 rounded-lg hover:bg-blue-900 transition-colors text-base md:text-sm font-medium"
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
      <footer className="bg-blue-800 text-white py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">富士急行労働組合</h3>
              <p className="text-blue-100 text-sm md:text-base mb-1">〒403-0017 山梨県富士吉田市新西匹2-1-1</p>
              <p className="text-blue-100 text-sm md:text-base mb-1">TEL: 000-000-0000 / FAX: 000-000-0000</p>
              <p className="text-blue-100 text-sm md:text-base">Email: info@union-example.jp</p>
            </div>
            
            <div>
              <ul className="space-y-2 text-sm md:text-base">
                <li><a href="#about" className="text-blue-100 hover:text-white block py-1">組合について</a></li>
                <li><a href="#news" className="text-blue-100 hover:text-white block py-1">ニュース</a></li>
                <li><Link href="/archive" className="text-blue-100 hover:text-white block py-1">ニュースアーカイブ</Link></li>
                <li><a href="#activities" className="text-blue-100 hover:text-white block py-1">活動紹介</a></li>
                <li><Link href="/admin" className="text-blue-100 hover:text-white block py-1">管理者ログイン</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-700 mt-6 md:mt-8 pt-4 text-center">
            <p className="text-blue-100 text-xs md:text-sm">&copy; 2025 富士急行労働組合. All rights reserved.</p>
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
