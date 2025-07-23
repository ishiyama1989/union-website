import { NextResponse } from 'next/server'
import { PostService } from '@/lib/posts'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '3')
    
    const posts = await PostService.getRecentNews(limit)
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching public posts:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}