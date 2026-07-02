'use client'

import { useState } from 'react'
import { isValidUrl } from '@/lib/utils'

interface WebsiteMetadataResult {
  title: string
  description: string
  icon: string
}

interface UseWebsiteMetadataOptions {
  onSuccess?: (metadata: WebsiteMetadataResult) => void
  onError?: (error: Error) => void
}

export function useWebsiteMetadata(options?: UseWebsiteMetadataOptions) {
  const [isFetching, setIsFetching] = useState(false)

  const fetchMetadata = async (url: string): Promise<WebsiteMetadataResult | null> => {
    if (!isValidUrl(url) || isFetching) return null

    setIsFetching(true)
    try {
      const response = await fetch('/api/website-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('获取网站信息失败')
      }

      const metadata: WebsiteMetadataResult = await response.json()
      options?.onSuccess?.(metadata)
      return metadata
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      options?.onError?.(err)
      return null
    } finally {
      setIsFetching(false)
    }
  }

  return { isFetching, fetchMetadata }
}
