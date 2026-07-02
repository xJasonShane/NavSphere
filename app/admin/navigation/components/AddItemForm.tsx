'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { NavigationSubItem } from "@/types/navigation"
import { Icons } from "@/components/icons"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useWebsiteMetadata } from "@/hooks/useWebsiteMetadata"

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, { message: "网站标题至少需要2个字符" }),
  href: z.string().url({ message: "请输入有效的网站链接" }),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
})

interface AddItemFormProps {
  onSubmit: (values: NavigationSubItem) => Promise<void>
  onCancel: () => void
  defaultValues?: NavigationSubItem
}

export function AddItemForm({ onSubmit, onCancel, defaultValues }: AddItemFormProps) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ? {
      id: defaultValues.id,
      title: defaultValues.title,
      href: defaultValues.href,
      description: defaultValues.description,
      enabled: defaultValues.enabled,
    } : {
      id: String(Date.now()),
      title: "",
      href: "",
      description: "",
      enabled: true,
    }
  })

  const isSubmitting = form.formState.isSubmitting
  const { isFetching: isFetchingMetadata, fetchMetadata } = useWebsiteMetadata({
    onSuccess: (metadata) => {
      if (!form.getValues('title')) {
        form.setValue('title', metadata.title)
      }
      if (!form.getValues('description')) {
        form.setValue('description', metadata.description)
      }
      toast({ title: "成功", description: "已自动获取网站信息" })
    },
    onError: () => {
      toast({ title: "提示", description: "自动获取网站信息失败，请手动填写", variant: "destructive" })
    }
  })

  const hrefValue = form.watch("href")

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (hrefValue && !defaultValues) {
        fetchMetadata(hrefValue)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [hrefValue, defaultValues])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(async (data) => {
        try {
          const values: NavigationSubItem = {
            id: data.id || crypto.randomUUID(),
            title: data.title,
            href: data.href,
            description: data.description,
            icon: '',
            enabled: data.enabled
          }
          await onSubmit(values)
        } catch (error) {
          console.error('保存失败:', error)
        }
      })} className="space-y-4">
        <FormField
          control={form.control}
          name="href"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站链接</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Input placeholder="输入网站链接，将自动获取网站信息" {...field} />
                    {isFetchingMetadata && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Icons.loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!field.value || isFetchingMetadata}
                    onClick={() => fetchMetadata(field.value)}
                  >
                    {isFetchingMetadata ? (
                      <Icons.loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.refresh className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                输入完整的网站链接后，系统将自动获取网站标题和描述
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站标题</FormLabel>
              <FormControl>
                <Input placeholder="网站标题（可自动获取）" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站描述</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="输入网站描述"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  启用状态
                </FormLabel>
                <FormDescription>
                  设置该导航项是否启用
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            取消
          </Button>
        </div>
      </form>
    </Form>
  )
}
