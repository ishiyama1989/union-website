import { NextRequest, NextResponse } from 'next/server'
import { PostService } from '@/lib/posts'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 管理者認証チェック
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params
    const post = await PostService.getById(id)
    
    if (!post) {
      return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
    }
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 管理者認証チェック
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    // バリデーション
    if (body.title && body.title.length > 100) {
      return NextResponse.json(
        { error: 'タイトルは100文字以内で入力してください' },
        { status: 400 }
      )
    }

    if (body.content && body.content.length > 5000) {
      return NextResponse.json(
        { error: '内容は5000文字以内で入力してください' },
        { status: 400 }
      )
    }
    
    const updatedPost = await PostService.update(id, body)
    
    if (!updatedPost) {
      return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
    }
    
    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'システムエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 管理者認証チェック
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params
    const success = await PostService.delete(id)
    
    if (!success) {
      return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'システムエラーが発生しました' },
      { status: 500 }
    )
  }
}