import { NextResponse } from 'next/server'
import type { NavigationData, NavigationItem } from '@/types/navigation'

export const runtime = 'edge'

// 仅开发环境可用
function devOnly() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: '该功能仅在开发环境可用' }, { status: 403 })
  }
  return null
}

// Edge Runtime 不支持文件系统，开发环境请使用 Node.js 运行
function notSupportedInEdge() {
  return NextResponse.json({ error: '该功能在 Edge Runtime 下不可用，请使用 Node.js 开发服务器' }, { status: 501 })
}

// 获取全部导航数据
export async function GET() {
  const blocked = devOnly()
  if (blocked) return blocked
  return notSupportedInEdge()
}

// 保存全部导航数据（整体替换）
export async function POST(request: Request) {
  const blocked = devOnly()
  if (blocked) return blocked
  return notSupportedInEdge()
}

// 更新单个导航分类
export async function PUT(request: Request) {
  const blocked = devOnly()
  if (blocked) return blocked
  return notSupportedInEdge()
}

// 删除单个导航分类
export async function DELETE(request: Request) {
  const blocked = devOnly()
  if (blocked) return blocked
  return notSupportedInEdge()
}
