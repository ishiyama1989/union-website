import { NextRequest, NextResponse } from 'next/server'
import { OpinionService } from '@/lib/opinions'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // バリデーション
    if (!body.name || !body.content) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      )
    }
    
    if (body.content.length > 1000) {
      return NextResponse.json(
        { error: 'ご意見・ご要望は1000文字以内で入力してください' },
        { status: 400 }
      )
    }
    
    
    // 意見を保存
    const opinion = await OpinionService.create({
      name: body.name,
      department: body.department || '',
      email: '',
      subject: '組合員からのご意見',
      content: body.content,
      isAnonymous: body.isAnonymous || false,
    })
    
    return NextResponse.json({ success: true, id: opinion.id })
  } catch (error) {
    console.error('Error saving opinion:', error)
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

    const opinions = await OpinionService.getAll()
    return NextResponse.json(opinions)
  } catch (error) {
    console.error('Error fetching opinions:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}

