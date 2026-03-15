import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("icon-[svg-spinners--blocks-wave] size-4", className)}
      {...props}
    />
  )
}

export { Spinner }
