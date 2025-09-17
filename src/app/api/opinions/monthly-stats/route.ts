import { NextResponse } from 'next/server'
import { OpinionService } from '@/lib/opinions'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // 管理者認証チェック
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_authenticated')
    if (!adminSession || adminSession.value !== 'true') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const monthlyStats = await OpinionService.getMonthlyStats()
    return NextResponse.json(monthlyStats)
  } catch (error) {
    console.error('Error fetching monthly stats:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}