import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import type { NavigationData, NavigationItem } from '@/types/navigation'

const NAVIGATION_FILE = join(process.cwd(), 'navsphere/content/navigation.json')

async function readNavigationData(): Promise<NavigationData> {
  try {
    const content = await readFile(NAVIGATION_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return { navigationItems: [] }
  }
}

async function writeNavigationData(data: NavigationData): Promise<void> {
  await writeFile(NAVIGATION_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

// 获取全部导航数据
export async function GET() {
  try {
    const data = await readNavigationData()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: '读取导航数据失败' }, { status: 500 })
  }
}

// 保存全部导航数据（整体替换）
export async function POST(request: Request) {
  try {
    const data: NavigationData = await request.json()

    if (!data.navigationItems || !Array.isArray(data.navigationItems)) {
      return NextResponse.json({ error: '数据格式错误' }, { status: 400 })
    }

    await writeNavigationData(data)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '保存导航数据失败' }, { status: 500 })
  }
}

// 更新单个导航分类
export async function PUT(request: Request) {
  try {
    const updatedItem: NavigationItem = await request.json()
    const data = await readNavigationData()

    const index = data.navigationItems.findIndex(item => item.id === updatedItem.id)
    if (index === -1) {
      return NextResponse.json({ error: '未找到该导航项' }, { status: 404 })
    }

    data.navigationItems[index] = { ...data.navigationItems[index], ...updatedItem }
    await writeNavigationData(data)
    return NextResponse.json({ success: true, item: data.navigationItems[index] })
  } catch (error) {
    return NextResponse.json({ error: '更新导航数据失败' }, { status: 500 })
  }
}

// 删除单个导航分类
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    const data = await readNavigationData()
    data.navigationItems = data.navigationItems.filter(item => item.id !== id)
    await writeNavigationData(data)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '删除导航数据失败' }, { status: 500 })
  }
}
