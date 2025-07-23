import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.username || !body.password) {
      return NextResponse.json(
        { error: 'ユーザー名とパスワードを入力してください' },
        { status: 400 }
      )
    }
    
    if (!verifyAdmin(body.username, body.password)) {
      return NextResponse.json(
        { error: 'ユーザー名またはパスワードが正しくありません' },
        { status: 401 }
      )
    }
    
    // 認証成功時の処理
    const response = NextResponse.json({ success: true })
    
    // クッキーを設定
    response.cookies.set('admin_authenticated', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    })
    
    return response
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json(
      { error: 'ログイン中にエラーが発生しました' },
      { status: 500 }
    )
  }
}