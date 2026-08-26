import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-[#141414]/80 border border-[#2A2A2A]/30", className)}
      {...props}
    />
  )
}

export { Skeleton }
