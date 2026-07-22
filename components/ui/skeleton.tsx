import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-2xl bg-muted after:absolute after:inset-y-0 after:left-0 after:w-[1000%] after:animate-shimmer after:bg-size-[50%_100%] after:bg-[linear-gradient(90deg,transparent_25%,rgba(0,0,0,0.06)_50%,transparent_75%)] dark:after:bg-[linear-gradient(90deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
