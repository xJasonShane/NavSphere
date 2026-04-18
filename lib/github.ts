import { auth } from '@/lib/auth'
import { stringToBase64, uint8ArrayToBase64 } from '@/lib/buffer-utils'

export async function getFileContent(path: string) {
  const owner = process.env.GITHUB_OWNER!
  const repo = process.env.GITHUB_REPO!
  const branch = process.env.GITHUB_BRANCH || 'main'

  try {
    const session = await auth()
    const token = session?.user?.accessToken

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
        Authorization: token ? `token ${token}` : '',
        'User-Agent': 'NavSphere',
      },
    })

    if (response.status === 404) {
      if (path.includes('navigation.json')) {
        return { navigationItems: [] }
      }
      return {}
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching file:', error)
    if (path.includes('navigation.json')) {
      return { navigationItems: [] }
    }
    return {}
  }
}

export async function commitFile(
  path: string,
  content: string,
  message: string,
  token: string,
  retryCount = 3
) {
  const owner = process.env.GITHUB_OWNER!
  const repo = process.env.GITHUB_REPO!
  const branch = process.env.GITHUB_BRANCH || 'main'

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      // 1. 获取当前文件信息（如果存在）
      const currentFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
      const currentFileResponse = await fetch(currentFileUrl, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'NavSphere',
        },
        cache: 'no-store', // 禁用缓存，确保获取最新的文件信息
      })

      let sha = undefined
      if (currentFileResponse.ok) {
        const currentFile = await currentFileResponse.json()
        sha = currentFile.sha
      }

      // 2. 创建或更新文件
      const updateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'NavSphere',
        },
        body: JSON.stringify({
          message,
          content: stringToBase64(content),
          sha,
          branch,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (attempt < retryCount && error.message?.includes('sha')) {
          await delay(1000 * attempt) // 指数退避
          continue
        }
        throw new Error(`Failed to commit file: ${error.message}`)
      }

      return await response.json()
    } catch (error) {
      if (attempt === retryCount) {
        console.error('Error in commitFile:', error)
        throw error
      }
      await delay(1000 * attempt)
    }
  }
}

export async function uploadImageToGitHub(
  binaryData: Uint8Array,
  token: string,
  extension: string = 'png',
  prefix: string = 'favicon'
): Promise<{ path: string; commitHash: string }> {
  const owner = process.env.GITHUB_OWNER!
  const repo = process.env.GITHUB_REPO!
  const branch = process.env.GITHUB_BRANCH || 'main'
  const path = `/assets/${prefix}_${Date.now()}.${extension}`
  const githubPath = 'public' + path

  const base64String = uint8ArrayToBase64(binaryData)
  const currentFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${githubPath}?ref=${branch}`

  const response = await fetch(currentFileUrl, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message: `Upload ${githubPath}`,
      content: base64String,
      branch: branch,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('Failed to upload image to GitHub:', errorData)
    throw new Error(`Failed to upload image to GitHub: ${errorData.message || 'Unknown error'}`)
  }

  const responseData = await response.json()
  const commitHash = responseData.commit.sha

  return { path, commitHash }
}