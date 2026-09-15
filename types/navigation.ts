export interface NavigationSubItem {
  id: string
  title: string
  href: string
  description?: string
  enabled: boolean
}

export interface NavigationCategory {
  id: string
  title: string
  description?: string
  parentId?: string
  items?: NavigationSubItem[]
  enabled?: boolean
}

export interface NavigationItem {
  id: string
  title: string
  description?: string
  items?: NavigationSubItem[]
  subCategories?: NavigationCategory[]
  enabled?: boolean
}

export interface NavigationData {
  navigationItems: NavigationItem[]
}

export interface ResourceItem {
  title: string
  description: string
  icon: string
  url: string
}

export interface ResourceSection {
  id: string
  title: string
  items: ResourceItem[]
}

export interface ResourceData {
  resourceSections: ResourceSection[]
}