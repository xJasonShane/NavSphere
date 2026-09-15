import { NextResponse } from 'next/server'
import { getFileContent } from '@/lib/github'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const { resourcePaths } = await request.json()
    
    if (!Array.isArray(resourcePaths)) {
      return NextResponse.json({ error: 'Invalid resource paths' }, { status: 400 })
    }

    // 获取站点配置数据
    const siteData = await getFileContent('navsphere/content/site.json') as any
    
    const references: Record<string, Array<{ type: string; location: string; title?: string }>> = {}
    
    // 检查每个资源路径的引用
    for (const resourcePath of resourcePaths) {
      references[resourcePath] = []
      
      // 检查站点配置中的引用
      if (siteData?.appearance) {
        if (siteData.appearance.logo === resourcePath) {
          references[resourcePath].push({
            type: 'site',
            location: '站点Logo',
            title: '站点Logo'
          })
        }
        
        if (siteData.appearance.favicon === resourcePath) {
          references[resourcePath].push({
            type: 'site',
            location: '站点图标',
            title: '站点图标'
          })
        }
      }
    }
    
    return NextResponse.json({ references })
  } catch (error) {
    console.error('Failed to check resource references:', error)
    return NextResponse.json({ error: 'Failed to check resource references' }, { status: 500 })
  }
}