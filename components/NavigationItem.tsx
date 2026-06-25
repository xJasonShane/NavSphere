'use client'

import { NavigationToggle } from './NavigationToggle'
import { NavigationLink } from './NavigationLink'
import type { NavigationSubItem } from '@/types/navigation'

interface NavigationItemProps {
  id: string
  title: string
  items?: NavigationSubItem[]
}

export function NavigationItem({ id, title, items = [] }: NavigationItemProps) {
  if (!items?.length) {
    return (
      <li>
        <NavigationLink href={`#${id}`}>
          <span>{title}</span>
        </NavigationLink>
      </li>
    )
  }

  return (
    <li>
      <NavigationToggle title={title}>
        <ul>
          {items.map(subItem => (
            <li key={subItem.href}>
              <NavigationLink href={subItem.href}>
                <span>{subItem.title}</span>
              </NavigationLink>
            </li>
          ))}
        </ul>
      </NavigationToggle>
    </li>
  )
}
