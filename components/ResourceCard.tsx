import { cn } from "@/lib/utils"
import Link from "next/link"

interface ResourceCardProps {
  title: string
  description?: string
  icon?: string
  url: string
  className?: string
}

export default function ResourceCard({
  title,
  description,
  url,
  className
}: ResourceCardProps) {
  return (
    <Link href={url} target="_blank" className={cn("block", className)}>
      <div className="group relative rounded-lg border p-6 hover:border-foreground">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold">{title}</h3>
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        )}
      </div>
    </Link>
  )
}