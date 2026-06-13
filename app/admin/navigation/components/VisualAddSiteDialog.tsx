'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useWebsiteMetadata } from '@/hooks/useWebsiteMetadata'
import { Icons } from '@/components/icons'
import { Loader2, Globe, Sparkles, Eye, ExternalLink, ImagePlus, ChevronDown, ChevronRight } from 'lucide-react'
import type { NavigationData, NavigationItem, NavigationCategory, NavigationSubItem } from '@/types/navigation'
import { cn } from '@/lib/utils'

interface VisualAddSiteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  navigationData: NavigationData
  onSuccess: () => void
}

type TargetLocation = {
  navigationId: string
  categoryId?: string // 子分类ID，为空则添加到主分类items
}

export function VisualAddSiteDialog({
  open,
  onOpenChange,
  navigationData,
  onSuccess,
}: VisualAddSiteDialogProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<'input' | 'preview' | 'target'>('input')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [target, setTarget] = useState<TargetLocation | null>(null)
  const [expandedNavs, setExpandedNavs] = useState<Record<string, boolean>>({})

  const { isFetching: isFetchingMetadata, fetchMetadata } = useWebsiteMetadata({
    onSuccess: (metadata) => {
      if (!title) setTitle(metadata.title)
      if (!description) setDescription(metadata.description)
      if (!icon && metadata.icon) setIcon(metadata.icon)
      toast({ title: '成功', description: '已自动获取网站信息' })
    },
    onError: () => {
      toast({ title: '提示', description: '自动获取网站信息失败，请手动填写', variant: 'destructive' })
    },
  })

  // 重置表单
  const resetForm = useCallback(() => {
    setStep('input')
    setUrl('')
    setTitle('')
    setDescription('')
    setIcon('')
    setEnabled(true)
    setTarget(null)
    setExpandedNavs({})
  }, [])

  useEffect(() => {
    if (!open) resetForm()
  }, [open, resetForm])

  // URL输入后自动获取元数据
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (url) {
        fetchMetadata(url)
      }
    }, 800)
    return () => clearTimeout(timeoutId)
  }, [url])

  const toggleNavExpand = (navId: string) => {
    setExpandedNavs(prev => ({ ...prev, [navId]: !prev[navId] }))
  }

  const handleNextFromInput = () => {
    if (!url || !title) {
      toast({ title: '提示', description: '请填写网站链接和标题', variant: 'destructive' })
      return
    }
    setStep('preview')
  }

  const handleNextFromPreview = () => {
    if (!target) {
      toast({ title: '提示', description: '请选择添加位置', variant: 'destructive' })
      return
    }
    setStep('target')
  }

  const handleSubmit = async () => {
    if (!target) return

    setIsSubmitting(true)
    try {
      const newItem: NavigationSubItem = {
        id: crypto.randomUUID(),
        title,
        href: url,
        description,
        icon,
        enabled,
      }

      // 获取当前导航数据
      const response = await fetch('/api/navigation')
      if (!response.ok) throw new Error('获取导航数据失败')
      const currentData: NavigationData = await response.json()

      const updatedItems = currentData.navigationItems.map(nav => {
        if (nav.id !== target.navigationId) return nav

        if (target.categoryId) {
          // 添加到子分类
          const updatedSubCategories = (nav.subCategories || []).map(sub => {
            if (sub.id !== target.categoryId) return sub
            return { ...sub, items: [...(sub.items || []), newItem] }
          })
          return { ...nav, subCategories: updatedSubCategories }
        } else {
          // 添加到主分类的items
          return { ...nav, items: [...(nav.items || []), newItem] }
        }
      })

      const saveResponse = await fetch('/api/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ navigationItems: updatedItems }),
      })

      if (!saveResponse.ok) throw new Error('保存失败')

      toast({ title: '成功', description: `已将「${title}」添加到导航` })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: '错误',
        description: '添加失败：' + (error as Error).message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 获取目标位置的可读名称
  const getTargetLabel = () => {
    if (!target) return ''
    const nav = navigationData.navigationItems.find(n => n.id === target.navigationId)
    if (!nav) return ''
    if (target.categoryId) {
      const cat = nav.subCategories?.find(c => c.id === target.categoryId)
      return `${nav.title} / ${cat?.title || ''}`
    }
    return nav.title
  }

  // 渲染步骤指示器
  const renderStepIndicator = () => {
    const steps = [
      { key: 'input', label: '输入网址', num: 1 },
      { key: 'preview', label: '预览确认', num: 2 },
      { key: 'target', label: '选择位置', num: 3 },
    ] as const

    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, i) => {
          const currentIdx = steps.findIndex(x => x.key === step)
          const sIdx = i
          const isActive = s.key === step
          const isCompleted = sIdx < currentIdx

          return (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-colors',
                  isActive && 'bg-primary text-primary-foreground',
                  isCompleted && 'bg-primary/20 text-primary',
                  !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? '✓' : s.num}
              </div>
              <span
                className={cn(
                  'text-xs hidden sm:inline',
                  isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={cn('w-8 h-px', sIdx < currentIdx ? 'bg-primary' : 'bg-muted')} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // 步骤1：输入网址
  const renderInputStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">网站链接</label>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="输入网站链接，如 https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-9"
            />
            {isFetchingMetadata && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!url || isFetchingMetadata}
            onClick={() => fetchMetadata(url)}
          >
            {isFetchingMetadata ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          输入链接后将自动获取网站标题、描述和图标
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">网站标题</label>
        <Input
          placeholder="网站标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">网站描述</label>
        <Textarea
          placeholder="输入网站描述（可选）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="resize-none"
          rows={2}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">启用状态</label>
          <p className="text-xs text-muted-foreground">设置该导航项是否启用</p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNextFromInput} disabled={!url || !title}>
          下一步：预览确认
        </Button>
      </div>
    </div>
  )

  // 步骤2：预览确认
  const renderPreviewStep = () => (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg border bg-background flex items-center justify-center overflow-hidden">
            {icon ? (
              <img
                src={icon}
                alt={title}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            ) : (
              <Globe className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {description || '暂无描述'}
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
            >
              {url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* 模拟导航卡片样式 */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <Eye className="h-3 w-3" /> 卡片预览效果
        </p>
        <div className="rounded-lg border bg-card p-3 max-w-xs">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex-shrink-0 w-8 h-8">
                <img
                  src={icon}
                  alt={title}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{title}</p>
              {description && (
                <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 图标编辑 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">图标</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="图标URL"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            />
            {icon && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <img src={icon} alt="icon" className="w-4 h-4 object-contain" />
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => document.getElementById('visual-icon-upload')?.click()}
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="mr-2 h-4 w-4" />
            )}
            上传
          </Button>
          <input
            id="visual-icon-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              try {
                setIsUploading(true)
                const base64 = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader()
                  reader.onload = () => resolve(reader.result as string)
                  reader.onerror = reject
                  reader.readAsDataURL(file)
                })
                const res = await fetch('/api/resource', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ image: base64 }),
                })
                if (!res.ok) throw new Error('上传失败')
                const data = await res.json()
                if (data.imageUrl) setIcon(data.imageUrl)
              } catch {
                toast({ title: '错误', description: '图标上传失败', variant: 'destructive' })
              } finally {
                setIsUploading(false)
              }
            }}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep('input')}>
          上一步
        </Button>
        <Button onClick={handleNextFromPreview}>
          下一步：选择位置
        </Button>
      </div>
    </div>
  )

  // 步骤3：选择目标位置
  const renderTargetStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">选择添加位置</label>
        <p className="text-xs text-muted-foreground">
          选择要将「{title}」添加到哪个分类下
        </p>
      </div>

      <div className="max-h-[400px] overflow-y-auto space-y-1 rounded-lg border p-2">
        {navigationData.navigationItems.map((nav) => {
          const hasSubCategories = nav.subCategories && nav.subCategories.length > 0
          const isExpanded = expandedNavs[nav.id]
          const isSelectedDirect = target?.navigationId === nav.id && !target?.categoryId

          return (
            <div key={nav.id}>
              {/* 主分类 */}
              <div
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer transition-colors',
                  isSelectedDirect
                    ? 'bg-primary/10 border border-primary/30'
                    : 'hover:bg-muted'
                )}
                onClick={() => {
                  if (hasSubCategories) {
                    toggleNavExpand(nav.id)
                  }
                  setTarget({ navigationId: nav.id })
                }}
              >
                {hasSubCategories ? (
                  isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )
                ) : (
                  <div className="w-4 flex-shrink-0" />
                )}
                <span className="text-sm font-medium">{nav.title}</span>
                {isSelectedDirect && (
                  <span className="ml-auto text-xs text-primary font-medium">已选择</span>
                )}
              </div>

              {/* 子分类 */}
              {hasSubCategories && isExpanded && (
                <div className="ml-6 space-y-0.5 mt-0.5">
                  {nav.subCategories!.map((sub) => {
                    const isSelectedSub =
                      target?.navigationId === nav.id && target?.categoryId === sub.id
                    return (
                      <div
                        key={sub.id}
                        className={cn(
                          'flex items-center gap-2 rounded-md px-3 py-1.5 cursor-pointer transition-colors',
                          isSelectedSub
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-muted'
                        )}
                        onClick={() =>
                          setTarget({ navigationId: nav.id, categoryId: sub.id })
                        }
                      >
                        <div className="w-4 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{sub.title}</span>
                        {isSelectedSub && (
                          <span className="ml-auto text-xs text-primary font-medium">已选择</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 已选择的位置摘要 */}
      {target && (
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground mb-1">添加位置</p>
          <p className="text-sm font-medium">{getTargetLabel()}</p>
        </div>
      )}

      {/* 最终预览 */}
      <div className="rounded-lg border p-3">
        <p className="text-xs text-muted-foreground mb-2">即将添加</p>
        <div className="flex items-center gap-2">
          {icon && (
            <img src={icon} alt={title} className="w-6 h-6 object-contain" />
          )}
          <span className="text-sm font-medium">{title}</span>
          {description && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              - {description}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep('preview')}>
          上一步
        </Button>
        <Button onClick={handleSubmit} disabled={!target || isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? '添加中...' : '确认添加'}
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            可视化添加导航站点
          </DialogTitle>
          <DialogDescription>
            通过可视化方式快速添加新的导航站点
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        {step === 'input' && renderInputStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'target' && renderTargetStep()}
      </DialogContent>
    </Dialog>
  )
}
