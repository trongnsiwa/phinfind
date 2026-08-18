import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-dark-roast/80 border border-dark-border/30", className)}
      {...props}
    />
  )
}

export { Skeleton }
