import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-2xl bg-muted after:absolute after:inset-y-0 after:left-0 after:w-[400%] after:animate-shimmer after:bg-size-[50%_100%] after:bg-[linear-gradient(90deg,transparent_50%,rgba(255,255,255,0.9)_75%,transparent_100%)] dark:after:bg-[linear-gradient(90deg,transparent_50%,rgba(255,255,255,0.1)_75%,transparent_100%)]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
