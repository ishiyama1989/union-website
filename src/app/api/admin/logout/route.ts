import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // 認証クッキーを削除
  response.cookies.delete('admin_authenticated')
  
  return response
}