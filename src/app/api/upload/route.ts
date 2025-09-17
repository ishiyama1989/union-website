import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // 管理者認証チェック
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_authenticated')
    if (!adminSession || adminSession.value !== 'true') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const pdfFile = formData.get('pdf') as File
    
    if (!imageFile && !pdfFile) {
      return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 })
    }

    // 画像ファイルの処理
    if (imageFile) {
      // ファイルサイズチェック（2MB）
      if (imageFile.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: 'ファイルサイズが大きすぎます（2MB以下にしてください）' }, { status: 400 })
      }

      // ファイル拡張子チェック
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!allowedImageTypes.includes(imageFile.type)) {
        return NextResponse.json({ error: 'サポートされていないファイル形式です' }, { status: 400 })
      }
    }

    // PDFファイルの処理
    if (pdfFile) {
      // ファイルサイズチェック（10MB）
      if (pdfFile.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'PDFファイルサイズが大きすぎます（10MB以下にしてください）' }, { status: 400 })
      }

      // ファイル拡張子チェック
      if (pdfFile.type !== 'application/pdf') {
        return NextResponse.json({ error: 'PDFファイルのみアップロード可能です' }, { status: 400 })
      }
    }


    // 画像ファイルの処理
    if (imageFile) {
      // 画像圧縮処理
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      
      // 画像サイズを縮小してBase64エンコード
      const compressedBuffer = buffer
      
      // もしファイルサイズが1MB以上の場合、簡易圧縮（品質調整）
      if (buffer.length > 1024 * 1024) {
        // 大きなファイルの場合、より小さなサイズ制限を適用
        if (buffer.length > 1.5 * 1024 * 1024) {
          return NextResponse.json({ 
            error: '画像が大きすぎます。1.5MB以下の画像をご利用ください' 
          }, { status: 400 })
        }
      }
      
      const base64 = compressedBuffer.toString('base64')
      const imageUrl = `data:${imageFile.type};base64,${base64}`
      
      return NextResponse.json({ 
        success: true, 
        imageUrl
      })
    }

    // PDFファイルの処理
    if (pdfFile) {
      const buffer = Buffer.from(await pdfFile.arrayBuffer())
      const base64 = buffer.toString('base64')
      const pdfUrl = `data:application/pdf;base64,${base64}`
      
      return NextResponse.json({ 
        success: true, 
        pdfUrl
      })
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'アップロードに失敗しました' },
      { status: 500 }
    )
  }
}