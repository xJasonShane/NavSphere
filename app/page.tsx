import { NavigationContent } from '@/components/navigation-content'
import { Metadata } from 'next/types'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Container } from '@/components/ui/container'
import type { SiteConfig } from '@/types/site'
import type { NavigationData } from '@/types/navigation'
import navigationDataRaw from '@/navsphere/content/navigation.json'
import siteDataRaw from '@/navsphere/content/site.json'

const navigationData = navigationDataRaw as NavigationData

function getData() {
  // 确保 theme 类型正确
  const siteData: SiteConfig = {
    ...siteDataRaw,
    appearance: {
      ...siteDataRaw.appearance,
      theme: (siteDataRaw.appearance.theme === 'light' ||
        siteDataRaw.appearance.theme === 'dark' ||
        siteDataRaw.appearance.theme === 'system')
        ? siteDataRaw.appearance.theme
        : 'system'
    },
    navigation: {
      linkTarget: (siteDataRaw.navigation?.linkTarget === '_blank' ||
        siteDataRaw.navigation?.linkTarget === '_self')
        ? siteDataRaw.navigation.linkTarget
        : '_blank'
    }
  }

  const filteredNavigationData = {
    navigationItems: navigationData.navigationItems
      .filter(category => category.enabled !== false)
      .map(category => {
        const filteredSubCategories = category.subCategories
          ? category.subCategories
              .filter(sub => sub.enabled !== false)
              .map(sub => ({
                ...sub,
                items: sub.items?.filter(item => item.enabled !== false)
              }))
          : undefined

        return {
          ...category,
          items: category.items?.filter(item => item.enabled !== false),
          subCategories: filteredSubCategories
        }
      })
  }

  return {
    navigationData: filteredNavigationData || { navigationItems: [] },
    siteData: siteData || {
      basic: {
        title: 'NavSphere',
        description: '',
        keywords: ''
      },
      appearance: {
        logo: '',
        favicon: '',
        theme: 'system' as const
      },
      navigation: {
        linkTarget: '_blank' as const
      }
    }
  }
}

export function generateMetadata(): Metadata {
  const { siteData } = getData()

  return {
    title: siteData.basic.title,
    description: siteData.basic.description,
    keywords: siteData.basic.keywords,
    icons: {
      icon: siteData.appearance.favicon,
    },
  }
}

export default function HomePage() {
  const { navigationData, siteData } = getData()

  return (
    <Container>
      <NavigationContent navigationData={navigationData} siteData={siteData} />
      <ScrollToTop />
    </Container>
  )
}
