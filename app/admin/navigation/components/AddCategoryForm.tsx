'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional(),
  enabled: z.boolean().default(true)
})

interface AddCategoryFormProps {
  defaultValues?: {
    title: string
    description?: string
    enabled: boolean
  }
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
  onCancel: () => void
}

export function AddCategoryForm({ defaultValues, onSubmit, onCancel }: AddCategoryFormProps) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      title: "",
      description: "",
      enabled: true
    }
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await onSubmit(values);
      toast({
        title: "保存成功",
      });
      setTimeout(onCancel, 0);
    } catch (error) {
      console.error('Failed to submit:', error);
      toast({
        title: "保存失败",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>标题</FormLabel>
              <FormControl>
                <Input placeholder="输入分类标题" {...field} />
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
              <FormLabel>描述</FormLabel>
              <FormControl>
                <Input placeholder="输入分类描述" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  启用状态
                </FormLabel>
                <FormDescription>
                  控制该分类是否在导航中显示
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
