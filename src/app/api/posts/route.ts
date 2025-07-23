import { NextRequest, NextResponse } from 'next/server'
import { PostService } from '@/lib/posts'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // 管理者認証チェック
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_authenticated')
    if (!adminSession || adminSession.value !== 'true') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    
    // バリデーション
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'タイトルと内容は必須項目です' },
        { status: 400 }
      )
    }
    
    if (body.title.length > 100) {
      return NextResponse.json(
        { error: 'タイトルは100文字以内で入力してください' },
        { status: 400 }
      )
    }

    if (body.content.length > 5000) {
      return NextResponse.json(
        { error: '内容は5000文字以内で入力してください' },
        { status: 400 }
      )
    }
    
    // 投稿を保存
    const post = await PostService.create({
      title: body.title,
      content: body.content,
      excerpt: body.excerpt || body.content.substring(0, 150) + '...',
      category: body.category || '活動報告',
      isPublished: body.isPublished || false,
    })
    
    return NextResponse.json({ success: true, id: post.id })
  } catch (error) {
    console.error('Error saving post:', error)
    return NextResponse.json(
      { error: 'システムエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // 管理者認証チェック
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_authenticated')
    if (!adminSession || adminSession.value !== 'true') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const posts = await PostService.getAll()
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}