import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { Post } from '@/lib/posts'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const year = searchParams.get('year')
  const month = searchParams.get('month')

  try {
    const postsDir = path.join(process.cwd(), 'data', 'posts')
    
    if (!fs.existsSync(postsDir)) {
      return NextResponse.json([])
    }

    const files = fs.readdirSync(postsDir)
    const posts: Post[] = []

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(postsDir, file)
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const post = JSON.parse(fileContent)
        
        if (post.isPublished) {
          const postDate = new Date(post.createdAt)
          const postYear = postDate.getFullYear().toString()
          const postMonth = (postDate.getMonth() + 1).toString().padStart(2, '0')

          // 年月でフィルタリング
          const yearMatch = !year || postYear === year
          const monthMatch = !month || postMonth === month

          if (yearMatch && monthMatch) {
            posts.push(post)
          }
        }
      }
    }

    // 作成日時でソート（新しい順）
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching archive posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}