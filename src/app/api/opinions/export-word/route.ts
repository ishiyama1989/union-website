import { NextRequest, NextResponse } from 'next/server'
import { OpinionService } from '@/lib/opinions'
import { cookies } from 'next/headers'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel } from 'docx'

export async function POST(request: NextRequest) {
  try {
    // 管理者認証チェック
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_authenticated')
    if (!adminSession || adminSession.value !== 'true') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const { year, month } = body

    if (!year || !month) {
      return NextResponse.json({ error: '年月を指定してください' }, { status: 400 })
    }

    // 指定された月の意見を取得
    const opinions = await OpinionService.getOpinionsByMonth(parseInt(year), parseInt(month))
    
    if (opinions.length === 0) {
      return NextResponse.json({ error: '指定された月の意見はありません' }, { status: 404 })
    }

    // 分解ごとにグループ化
    const groupedOpinions: Record<string, typeof opinions> = {}
    opinions.forEach(opinion => {
      const department = opinion.department || '未記入'
      if (!groupedOpinions[department]) {
        groupedOpinions[department] = []
      }
      groupedOpinions[department].push(opinion)
    })

    // Wordドキュメントを作成
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: `組合員意見集約報告書 ${year}年${month}月`,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: `作成日: ${new Date().toLocaleDateString('ja-JP')}`,
          }),
          new Paragraph({
            text: `総件数: ${opinions.length}件`,
          }),
          new Paragraph({ text: '' }), // 空行

          // 分解ごとの統計表
          new Paragraph({
            text: '分解別集計',
            heading: HeadingLevel.HEADING_2,
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph('分解名')],
                  }),
                  new TableCell({
                    children: [new Paragraph('件数')],
                  }),
                ],
              }),
              ...Object.entries(groupedOpinions).map(([department, deptOpinions]) =>
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph(department)],
                    }),
                    new TableCell({
                      children: [new Paragraph(deptOpinions.length.toString())],
                    }),
                  ],
                })
              ),
            ],
          }),
          new Paragraph({ text: '' }), // 空行

          // 分解ごとの詳細
          ...Object.entries(groupedOpinions).flatMap(([department, deptOpinions]) => [
            new Paragraph({
              text: `${department} (${deptOpinions.length}件)`,
              heading: HeadingLevel.HEADING_2,
            }),
            ...deptOpinions.flatMap((opinion, index) => [
              new Paragraph({
                text: `${index + 1}. ${opinion.name}`,
                heading: HeadingLevel.HEADING_3,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `投稿日時: ${new Date(opinion.createdAt).toLocaleDateString('ja-JP')}`,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `所属: ${opinion.department || '未記入'}`,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '内容:',
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                text: opinion.content,
              }),
              new Paragraph({ text: '' }), // 空行
            ]),
          ]),
        ],
      }],
    })

    // ドキュメントをバイナリに変換
    const buffer = await Packer.toBuffer(doc)
    
    // レスポンスヘッダーを設定
    const fileName = `意見集約_${year}年${month}月.docx`
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    })

  } catch (error) {
    console.error('Error generating Word document:', error)
    return NextResponse.json(
      { error: 'Wordファイルの生成に失敗しました' },
      { status: 500 }
    )
  }
}