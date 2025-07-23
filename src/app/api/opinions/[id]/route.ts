import { NextRequest, NextResponse } from 'next/server'
import { OpinionService } from '@/lib/kv'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 管理者認証チェック
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_authenticated')
    if (!adminSession || adminSession.value !== 'true') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params
    const opinion = await OpinionService.getById(id)
    
    if (!opinion) {
      return NextResponse.json(
        { error: '意見が見つかりません' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(opinion)
  } catch (error) {
    console.error('Error fetching opinion:', error)
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
    const adminSession = cookieStore.get('admin_authenticated')
    if (!adminSession || adminSession.value !== 'true') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    const updated = await OpinionService.update(id, body)
    
    if (!updated) {
      return NextResponse.json(
        { error: '意見が見つかりません' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating opinion:', error)
    return NextResponse.json(
      { error: '更新に失敗しました' },
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
    const adminSession = cookieStore.get('admin_authenticated')
    if (!adminSession || adminSession.value !== 'true') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params
    const deleted = await OpinionService.delete(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: '意見が見つかりません' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting opinion:', error)
    return NextResponse.json(
      { error: '削除に失敗しました' },
      { status: 500 }
    )
  }
}