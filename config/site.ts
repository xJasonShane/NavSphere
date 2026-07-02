import type { SiteConfig } from '@/types/site'

export const siteConfig: SiteConfig = {
  basic: {
    title: 'NavSphere',
    description: 'AI驱动的精选资源导航站，收录优质AI工具、开发资源、开源项目与效率神器',
    keywords: '导航站,AI工具,开发编程,云服务,开源项目,效率工具,游戏,影视'
  },
  appearance: {
    logo: '/logo.webp',
    favicon: '/favicon.webp',
    theme: 'system'
  },
  navigation: {
    linkTarget: '_blank'
  }
}

export function getSiteConfig(): SiteConfig {
  return siteConfig
}
