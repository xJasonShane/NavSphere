'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useWebsiteMetadata } from '@/hooks/useWebsiteMetadata'
import { IconSelector } from './components/IconSelector'
import type {
  NavigationData,
  NavigationItem,
  NavigationCategory,
  NavigationSubItem,
} from '@/types/navigation'
import {
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Globe,
  Sparkles,
  Eye,
  ExternalLink,
  ImagePlus,
  Loader2,
  ArrowUpDown,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ==================== 本地 API ====================

const API = '/api/local/navigation'

async function fetchNavigation(): Promise<NavigationData> {
  const res = await fetch(API)
  if (!res.ok) throw new Error('获取导航数据失败')
  return res.json()
}

async function saveNavigation(data: NavigationData): Promise<void> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('保存导航数据失败')
}

// ==================== 添加/编辑站点对话框 ====================

interface SiteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  navigationData: NavigationData
  editItem?: NavigationSubItem | null
  defaultNavId?: string
  defaultCategoryId?: string
  onSave: (item: NavigationSubItem, navId: string, categoryId?: string) => Promise<void>
}

function SiteFormDialog({
  open,
  onOpenChange,
  navigationData,
  editItem,
  defaultNavId,
  defaultCategoryId,
  onSave,
}: SiteFormDialogProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<'input' | 'preview' | 'target'>('input')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [target, setTarget] = useState<{
    navigationId: string
    categoryId?: string
  } | null>(null)
  const [expandedNavs, setExpandedNavs] = useState<Record<string, boolean>>({})

  const { isFetching, fetchMetadata } = useWebsiteMetadata({
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
    if (!open) {
      resetForm()
      return
    }
    // 编辑模式：填充已有数据
    if (editItem) {
      setUrl(editItem.href)
      setTitle(editItem.title)
      setDescription(editItem.description || '')
      setIcon(editItem.icon || '')
      setEnabled(editItem.enabled)
      setTarget({
        navigationId: defaultNavId || '',
        categoryId: defaultCategoryId,
      })
      setStep('preview')
    } else {
      // 新增模式：设置默认目标
      if (defaultNavId) {
        setTarget({
          navigationId: defaultNavId,
          categoryId: defaultCategoryId,
        })
      }
    }
  }, [open, editItem, defaultNavId, defaultCategoryId, resetForm])

  useEffect(() => {
    if (editItem) return
    const timeoutId = setTimeout(() => {
      if (url) fetchMetadata(url)
    }, 800)
    return () => clearTimeout(timeoutId)
  }, [url, editItem])

  const handleSubmit = async () => {
    if (!target) return
    setIsSubmitting(true)
    try {
      const item: NavigationSubItem = {
        id: editItem?.id || crypto.randomUUID(),
        title,
        href: url,
        description,
        icon,
        enabled,
      }
      await onSave(item, target.navigationId, target.categoryId)
      onOpenChange(false)
    } catch (error) {
      toast({ title: '错误', description: (error as Error).message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleNavExpand = (navId: string) => {
    setExpandedNavs((prev) => ({ ...prev, [navId]: !prev[navId] }))
  }

  const getTargetLabel = () => {
    if (!target) return ''
    const nav = navigationData.navigationItems.find((n) => n.id === target.navigationId)
    if (!nav) return ''
    if (target.categoryId) {
      const cat = nav.subCategories?.find((c) => c.id === target.categoryId)
      return `${nav.title} / ${cat?.title || ''}`
    }
    return nav.title
  }

  // 步骤指示器
  const steps = [
    { key: 'input', label: '输入网址', num: 1 },
    { key: 'preview', label: '预览确认', num: 2 },
    { key: 'target', label: '选择位置', num: 3 },
  ] as const
  const currentIdx = steps.findIndex((s) => s.key === step)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {editItem ? '编辑导航站点' : '添加导航站点'}
          </DialogTitle>
          <DialogDescription>
            {editItem ? '修改导航站点信息' : '通过可视化方式快速添加新的导航站点'}
          </DialogDescription>
        </DialogHeader>

        {/* 步骤指示器 */}
        {!editItem && (
          <div className="flex items-center justify-center gap-2 mb-4">
            {steps.map((s, i) => {
              const isActive = s.key === step
              const isCompleted = i < currentIdx
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
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : s.num}
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
                    <div className={cn('w-8 h-px', i < currentIdx ? 'bg-primary' : 'bg-muted')} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* 步骤1：输入网址 */}
        {step === 'input' && (
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
                  {isFetching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!url || isFetching}
                  onClick={() => fetchMetadata(url)}
                >
                  {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">输入链接后将自动获取网站标题、描述和图标</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">网站标题</label>
              <Input placeholder="网站标题" value={title} onChange={(e) => setTitle(e.target.value)} />
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
              <Button onClick={() => { if (!url || !title) { toast({ title: '提示', description: '请填写网站链接和标题', variant: 'destructive' }); return } setStep('preview') }} disabled={!url || !title}>
                下一步：预览确认
              </Button>
            </div>
          </div>
        )}

        {/* 步骤2：预览确认 */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg border bg-background flex items-center justify-center overflow-hidden">
                  {icon ? (
                    <img src={icon} alt={title} className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <Globe className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description || '暂无描述'}</p>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                    {url} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* 卡片预览 */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Eye className="h-3 w-3" /> 卡片预览效果</p>
              <div className="rounded-lg border bg-card p-3 max-w-xs">
                <div className="flex items-start gap-3">
                  {icon && <div className="flex-shrink-0 w-8 h-8"><img src={icon} alt={title} className="w-full h-full object-contain" /></div>}
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    {description && <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* 图标编辑 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">图标</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input placeholder="图标URL" value={icon} onChange={(e) => setIcon(e.target.value)} />
                  {icon && <div className="absolute right-3 top-1/2 -translate-y-1/2"><img src={icon} alt="icon" className="w-4 h-4 object-contain" /></div>}
                </div>
                <Button type="button" variant="outline" disabled={isUploading} onClick={() => document.getElementById('visual-icon-upload')?.click()}>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
                  上传
                </Button>
                <input id="visual-icon-upload" type="file" accept="image/*" className="hidden" onChange={async (e) => {
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
                    const res = await fetch('/api/resource', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64 }) })
                    if (!res.ok) throw new Error('上传失败')
                    const data = await res.json()
                    if (data.imageUrl) setIcon(data.imageUrl)
                  } catch { toast({ title: '错误', description: '图标上传失败', variant: 'destructive' }) } finally { setIsUploading(false) }
                }} />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('input')}>上一步</Button>
              <Button onClick={() => { if (!target) { toast({ title: '提示', description: '请选择添加位置', variant: 'destructive' }); return } if (editItem) handleSubmit(); else setStep('target') }}>
                {editItem ? (isSubmitting ? '保存中...' : '保存修改') : '下一步：选择位置'}
              </Button>
            </div>
          </div>
        )}

        {/* 步骤3：选择位置 */}
        {step === 'target' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">选择添加位置</label>
              <p className="text-xs text-muted-foreground">选择要将「{title}」添加到哪个分类下</p>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-1 rounded-lg border p-2">
              {navigationData.navigationItems.map((nav) => {
                const hasSub = nav.subCategories && nav.subCategories.length > 0
                const isExpanded = expandedNavs[nav.id]
                const isSelectedDirect = target?.navigationId === nav.id && !target?.categoryId
                return (
                  <div key={nav.id}>
                    <div
                      className={cn('flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer transition-colors', isSelectedDirect ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted')}
                      onClick={() => { if (hasSub) toggleNavExpand(nav.id); setTarget({ navigationId: nav.id }) }}
                    >
                      {hasSub ? (isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />) : <div className="w-4 flex-shrink-0" />}
                      <span className="text-sm font-medium">{nav.title}</span>
                      {isSelectedDirect && <span className="ml-auto text-xs text-primary font-medium">已选择</span>}
                    </div>
                    {hasSub && isExpanded && (
                      <div className="ml-6 space-y-0.5 mt-0.5">
                        {nav.subCategories!.map((sub) => {
                          const isSelectedSub = target?.navigationId === nav.id && target?.categoryId === sub.id
                          return (
                            <div key={sub.id} className={cn('flex items-center gap-2 rounded-md px-3 py-1.5 cursor-pointer transition-colors', isSelectedSub ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted')} onClick={() => setTarget({ navigationId: nav.id, categoryId: sub.id })}>
                              <div className="w-4 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{sub.title}</span>
                              {isSelectedSub && <span className="ml-auto text-xs text-primary font-medium">已选择</span>}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {target && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground mb-1">添加位置</p>
                <p className="text-sm font-medium">{getTargetLabel()}</p>
              </div>
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('preview')}>上一步</Button>
              <Button onClick={handleSubmit} disabled={!target || isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                确认添加
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ==================== 添加/编辑分类对话框 ====================

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: NavigationItem | null
  onSave: (values: { title: string; icon: string; description?: string; enabled: boolean }) => Promise<void>
}

function CategoryFormDialog({ open, onOpenChange, editItem, onSave }: CategoryFormDialogProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState('FolderKanban')
  const [description, setDescription] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && editItem) {
      setTitle(editItem.title)
      setIcon(editItem.icon || 'FolderKanban')
      setDescription(editItem.description || '')
      setEnabled(editItem.enabled ?? true)
    } else if (open) {
      setTitle('')
      setIcon('FolderKanban')
      setDescription('')
      setEnabled(true)
    }
  }, [open, editItem])

  const handleSubmit = async () => {
    if (!title) { toast({ title: '提示', description: '请填写标题', variant: 'destructive' }); return }
    setIsSubmitting(true)
    try {
      await onSave({ title, icon, description, enabled })
      onOpenChange(false)
    } catch (error) {
      toast({ title: '错误', description: (error as Error).message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{editItem ? '编辑分类' : '添加分类'}</DialogTitle>
          <DialogDescription>{editItem ? '修改分类信息' : '创建新的导航分类'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">标题</label>
            <Input placeholder="输入分类标题" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">图标</label>
            <IconSelector value={icon} onChange={setIcon} />
            <p className="text-xs text-muted-foreground">从 Lucide 图标库中选择一个图标</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">描述</label>
            <Textarea placeholder="输入分类描述（可选）" className="resize-none" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">启用状态</label>
              <p className="text-xs text-muted-foreground">设置该分类是否启用</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editItem ? '保存修改' : '添加'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ==================== 添加子分类对话框 ====================

interface SubCategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: NavigationCategory | null
  onSave: (values: { title: string; description?: string; enabled: boolean }) => Promise<void>
}

function SubCategoryFormDialog({ open, onOpenChange, editItem, onSave }: SubCategoryFormDialogProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && editItem) {
      setTitle(editItem.title)
      setDescription(editItem.description || '')
      setEnabled(editItem.enabled ?? true)
    } else if (open) {
      setTitle('')
      setDescription('')
      setEnabled(true)
    }
  }, [open, editItem])

  const handleSubmit = async () => {
    if (!title) { toast({ title: '提示', description: '请填写标题', variant: 'destructive' }); return }
    setIsSubmitting(true)
    try {
      await onSave({ title, description, enabled })
      onOpenChange(false)
    } catch (error) {
      toast({ title: '错误', description: (error as Error).message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{editItem ? '编辑子分类' : '添加子分类'}</DialogTitle>
          <DialogDescription>{editItem ? '修改子分类信息' : '在当前分类下创建子分类'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">标题</label>
            <Input placeholder="输入子分类标题" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">描述</label>
            <Input placeholder="输入子分类描述（可选）" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">启用状态</label>
              <p className="text-xs text-muted-foreground">设置该子分类是否启用</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editItem ? '保存修改' : '添加'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ==================== 确认删除对话框 ====================

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => Promise<void>
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button variant="destructive" onClick={async () => { setIsSubmitting(true); await onConfirm(); setIsSubmitting(false); onOpenChange(false) }} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ==================== 主页面 ====================

export default function NavigationManagerPage() {
  const { toast } = useToast()
  const [data, setData] = useState<NavigationData>({ navigationItems: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // 对话框状态
  const [siteDialogOpen, setSiteDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [subCategoryDialogOpen, setSubCategoryDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // 编辑状态
  const [editingSite, setEditingSite] = useState<NavigationSubItem | null>(null)
  const [editingSiteNavId, setEditingSiteNavId] = useState('')
  const [editingSiteCategoryId, setEditingSiteCategoryId] = useState<string | undefined>()
  const [editingCategory, setEditingCategory] = useState<NavigationItem | null>(null)
  const [editingSubCategory, setEditingSubCategory] = useState<NavigationCategory | null>(null)
  const [editingSubCategoryNavId, setEditingSubCategoryNavId] = useState('')

  // 删除状态
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'category' | 'subcategory' | 'site'
    navId: string
    categoryId?: string
    itemId?: string
    label: string
  } | null>(null)

  // 当 deleteTarget 变化时自动打开删除确认
  useEffect(() => {
    if (deleteTarget) setDeleteDialogOpen(true)
  }, [deleteTarget])

  // 展开状态
  const [expandedNavs, setExpandedNavs] = useState<Record<string, boolean>>({})

  // 加载数据
  const loadData = useCallback(async () => {
    try {
      const navData = await fetchNavigation()
      setData(navData)
    } catch {
      toast({ title: '错误', description: '加载导航数据失败', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 保存数据
  const saveData = useCallback(async (newData: NavigationData) => {
    await saveNavigation(newData)
    setData(newData)
  }, [])

  // ========== 分类操作 ==========

  const handleAddCategory = async (values: { title: string; icon: string; description?: string; enabled: boolean }) => {
    const newItem: NavigationItem = {
      id: crypto.randomUUID(),
      title: values.title,
      icon: values.icon,
      description: values.description,
      enabled: values.enabled,
      items: [],
      subCategories: [],
    }
    await saveData({ navigationItems: [...data.navigationItems, newItem] })
    toast({ title: '成功', description: `分类「${values.title}」已添加` })
  }

  const handleEditCategory = async (values: { title: string; icon: string; description?: string; enabled: boolean }) => {
    if (!editingCategory) return
    const newData = {
      navigationItems: data.navigationItems.map((item) =>
        item.id === editingCategory.id ? { ...item, ...values } : item
      ),
    }
    await saveData(newData)
    toast({ title: '成功', description: '分类已更新' })
    setEditingCategory(null)
  }

  // ========== 子分类操作 ==========

  const handleAddSubCategory = async (values: { title: string; description?: string; enabled: boolean }) => {
    const newSub: NavigationCategory = {
      id: crypto.randomUUID(),
      title: values.title,
      description: values.description,
      enabled: values.enabled,
      items: [],
    }
    const newData = {
      navigationItems: data.navigationItems.map((nav) =>
        nav.id === editingSubCategoryNavId
          ? { ...nav, subCategories: [...(nav.subCategories || []), newSub] }
          : nav
      ),
    }
    await saveData(newData)
    toast({ title: '成功', description: `子分类「${values.title}」已添加` })
    setEditingSubCategoryNavId('')
  }

  const handleEditSubCategory = async (values: { title: string; description?: string; enabled: boolean }) => {
    if (!editingSubCategory || !editingSubCategoryNavId) return
    const newData = {
      navigationItems: data.navigationItems.map((nav) =>
        nav.id === editingSubCategoryNavId
          ? {
              ...nav,
              subCategories: (nav.subCategories || []).map((sub) =>
                sub.id === editingSubCategory.id ? { ...sub, ...values } : sub
              ),
            }
          : nav
      ),
    }
    await saveData(newData)
    toast({ title: '成功', description: '子分类已更新' })
    setEditingSubCategory(null)
    setEditingSubCategoryNavId('')
  }

  // ========== 站点操作 ==========

  const handleSaveSite = async (item: NavigationSubItem, navId: string, categoryId?: string) => {
    const isEdit = !!editingSite
    const newData = {
      navigationItems: data.navigationItems.map((nav) => {
        if (nav.id !== navId) return nav

        if (categoryId) {
          return {
            ...nav,
            subCategories: (nav.subCategories || []).map((sub) => {
              if (sub.id !== categoryId) return sub
              if (isEdit) {
                return { ...sub, items: (sub.items || []).map((i) => (i.id === item.id ? item : i)) }
              }
              return { ...sub, items: [...(sub.items || []), item] }
            }),
          }
        }

        if (isEdit) {
          return { ...nav, items: (nav.items || []).map((i) => (i.id === item.id ? item : i)) }
        }
        return { ...nav, items: [...(nav.items || []), item] }
      }),
    }
    await saveData(newData)
    toast({ title: '成功', description: isEdit ? '站点已更新' : `站点「${item.title}」已添加` })
    setEditingSite(null)
  }

  // ========== 删除操作 ==========

  const handleDelete = async () => {
    if (!deleteTarget) return
    let newData = { ...data }

    if (deleteTarget.type === 'category') {
      newData = { navigationItems: data.navigationItems.filter((n) => n.id !== deleteTarget.navId) }
    } else if (deleteTarget.type === 'subcategory') {
      newData = {
        navigationItems: data.navigationItems.map((nav) =>
          nav.id === deleteTarget.navId
            ? { ...nav, subCategories: (nav.subCategories || []).filter((s) => s.id !== deleteTarget.categoryId) }
            : nav
        ),
      }
    } else if (deleteTarget.type === 'site') {
      newData = {
        navigationItems: data.navigationItems.map((nav) => {
          if (nav.id !== deleteTarget.navId) return nav
          if (deleteTarget.categoryId) {
            return {
              ...nav,
              subCategories: (nav.subCategories || []).map((sub) =>
                sub.id === deleteTarget.categoryId
                  ? { ...sub, items: (sub.items || []).filter((i) => i.id !== deleteTarget.itemId) }
                  : sub
              ),
            }
          }
          return { ...nav, items: (nav.items || []).filter((i) => i.id !== deleteTarget.itemId) }
        }),
      }
    }

    await saveData(newData)
    toast({ title: '成功', description: '已删除' })
    setDeleteTarget(null)
    setDeleteDialogOpen(false)
  }

  // ========== 移动操作 ==========

  const handleMoveCategory = async (fromIndex: number, toIndex: number) => {
    const items = [...data.navigationItems]
    const [moved] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, moved)
    await saveData({ navigationItems: items })
  }

  const handleMoveSite = async (navId: string, categoryId: string | undefined, fromIndex: number, toIndex: number) => {
    const newData = {
      navigationItems: data.navigationItems.map((nav) => {
        if (nav.id !== navId) return nav
        if (categoryId) {
          return {
            ...nav,
            subCategories: (nav.subCategories || []).map((sub) => {
              if (sub.id !== categoryId) return sub
              const items = [...(sub.items || [])]
              const [moved] = items.splice(fromIndex, 1)
              items.splice(toIndex, 0, moved)
              return { ...sub, items }
            }),
          }
        }
        const items = [...(nav.items || [])]
        const [moved] = items.splice(fromIndex, 1)
        items.splice(toIndex, 0, moved)
        return { ...nav, items }
      }),
    }
    await saveData(newData)
  }

  const toggleNav = (id: string) => setExpandedNavs((prev) => ({ ...prev, [id]: !prev[id] }))

  // 搜索过滤
  const filteredNavItems = data.navigationItems.filter((nav) =>
    nav.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Input
            placeholder="搜索分类..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-[300px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setEditingCategory(null); setCategoryDialogOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            添加分类
          </Button>
          <Button variant="outline" onClick={() => { setEditingSite(null); setEditingSiteNavId(''); setEditingSiteCategoryId(undefined); setSiteDialogOpen(true) }}>
            <Sparkles className="mr-2 h-4 w-4" />
            可视化添加站点
          </Button>
        </div>
      </div>

      {/* 导航树 */}
      <div className="space-y-3">
        {filteredNavItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">暂无分类</p>
            <p className="text-sm mt-1">点击上方「添加分类」开始创建</p>
          </div>
        ) : (
          filteredNavItems.map((nav, navIndex) => {
            const isExpanded = expandedNavs[nav.id] !== false
            const allSites = [
              ...(nav.items || []),
              ...(nav.subCategories || []).flatMap((sub) => sub.items || []),
            ]

            return (
              <div key={nav.id} className="rounded-lg border bg-card">
                {/* 分类头部 */}
                <div className="flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors">
                  <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer" onClick={() => toggleNav(nav.id)}>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>

                  <span className="text-sm font-medium flex-1">{nav.title}</span>
                  <span className="text-xs text-muted-foreground">{allSites.length} 个站点</span>

                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      {/* 上移 */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={navIndex === 0} onClick={() => handleMoveCategory(navIndex, navIndex - 1)}>
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>排序</TooltipContent>
                      </Tooltip>

                      {/* 添加子分类 */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingSubCategory(null); setEditingSubCategoryNavId(nav.id); setSubCategoryDialogOpen(true) }}>
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>添加子分类</TooltipContent>
                      </Tooltip>

                      {/* 添加站点 */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingSite(null); setEditingSiteNavId(nav.id); setEditingSiteCategoryId(undefined); setSiteDialogOpen(true) }}>
                            <Globe className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>添加站点</TooltipContent>
                      </Tooltip>

                      {/* 编辑分类 */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingCategory(nav); setCategoryDialogOpen(true) }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>编辑分类</TooltipContent>
                      </Tooltip>

                      {/* 删除分类 */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget({ type: 'category', navId: nav.id, label: nav.title })}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>删除分类</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* 展开内容 */}
                {isExpanded && (
                  <div className="border-t">
                    {/* 直接站点 */}
                    {(nav.items || []).length > 0 && (
                      <div className="p-2 space-y-1">
                        {(nav.items || []).map((item, itemIndex) => (
                          <div key={item.id} className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted/50 group transition-colors">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => handleMoveSite(nav.id, undefined, itemIndex, Math.max(0, itemIndex - 1))} disabled={itemIndex === 0}>
                                <ChevronUp className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => handleMoveSite(nav.id, undefined, itemIndex, Math.min((nav.items || []).length - 1, itemIndex + 1))} disabled={itemIndex === (nav.items || []).length - 1}>
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            </div>
                            {item.icon && <img src={item.icon} alt="" className="w-4 h-4 object-contain flex-shrink-0" />}
                            <span className="text-sm flex-1 min-w-0 truncate">{item.title}</span>
                            <span className="text-xs text-muted-foreground hidden sm:inline max-w-[200px] truncate">{item.href}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingSite(item); setEditingSiteNavId(nav.id); setEditingSiteCategoryId(undefined); setSiteDialogOpen(true) }}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => setDeleteTarget({ type: 'site', navId: nav.id, itemId: item.id, label: item.title })}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 子分类 */}
                    {(nav.subCategories || []).map((sub) => (
                      <div key={sub.id} className="border-t">
                        <div className="flex items-center gap-2 px-4 py-2 bg-muted/30">
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">{sub.title}</span>
                          <span className="text-xs text-muted-foreground/60">{(sub.items || []).length}</span>
                          <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingSite(null); setEditingSiteNavId(nav.id); setEditingSiteCategoryId(sub.id); setSiteDialogOpen(true) }}>
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingSubCategory(sub); setEditingSubCategoryNavId(nav.id); setSubCategoryDialogOpen(true) }}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => setDeleteTarget({ type: 'subcategory', navId: nav.id, categoryId: sub.id, label: sub.title })}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {(sub.items || []).length > 0 && (
                          <div className="p-2 pl-6 space-y-1">
                            {(sub.items || []).map((item, itemIndex) => (
                              <div key={item.id} className="flex items-center gap-2 rounded-md px-3 py-1.5 hover:bg-muted/50 group transition-colors">
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => handleMoveSite(nav.id, sub.id, itemIndex, Math.max(0, itemIndex - 1))} disabled={itemIndex === 0}>
                                    <ChevronUp className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => handleMoveSite(nav.id, sub.id, itemIndex, Math.min(sub.items!.length - 1, itemIndex + 1))} disabled={itemIndex === sub.items!.length - 1}>
                                    <ChevronDown className="h-3 w-3" />
                                  </Button>
                                </div>
                                {item.icon && <img src={item.icon} alt="" className="w-4 h-4 object-contain flex-shrink-0" />}
                                <span className="text-sm flex-1 min-w-0 truncate">{item.title}</span>
                                <span className="text-xs text-muted-foreground hidden sm:inline max-w-[200px] truncate">{item.href}</span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingSite(item); setEditingSiteNavId(nav.id); setEditingSiteCategoryId(sub.id); setSiteDialogOpen(true) }}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => setDeleteTarget({ type: 'site', navId: nav.id, categoryId: sub.id, itemId: item.id, label: item.title })}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* 空状态 */}
                    {(!nav.items || nav.items.length === 0) && (!nav.subCategories || nav.subCategories.length === 0) && (
                      <div className="flex items-center justify-center py-6 text-muted-foreground">
                        <p className="text-sm">暂无站点，点击上方按钮添加</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* 对话框 */}
      <SiteFormDialog
        open={siteDialogOpen}
        onOpenChange={setSiteDialogOpen}
        navigationData={data}
        editItem={editingSite}
        defaultNavId={editingSiteNavId}
        defaultCategoryId={editingSiteCategoryId}
        onSave={handleSaveSite}
      />

      <CategoryFormDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        editItem={editingCategory}
        onSave={editingCategory ? handleEditCategory : handleAddCategory}
      />

      <SubCategoryFormDialog
        open={subCategoryDialogOpen}
        onOpenChange={setSubCategoryDialogOpen}
        editItem={editingSubCategory}
        onSave={editingSubCategory ? handleEditSubCategory : handleAddSubCategory}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setDeleteTarget(null) }}
        title="确认删除"
        description={deleteTarget ? `确定要删除「${deleteTarget.label}」吗？此操作无法撤销。` : ''}
        onConfirm={handleDelete}
      />
    </div>
  )
}
