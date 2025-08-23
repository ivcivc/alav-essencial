import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/cn"

const badgeVariants = cva(
 "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
 {
  variants: {
   variant: {
    default: "border-transparent bg-card text-primary-foreground hover:bg-card  dark:text-muted-foreground dark:hover:bg-card",
    secondary: "border-transparent bg-card text-muted-foreground hover:bg-card  dark:text-muted-foreground dark:hover:bg-card",
    destructive: "border-transparent bg-red-600 text-primary-foreground hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
    outline: "text-muted-foreground border-border dark:text-muted-foreground ",
    success: "border-transparent bg-green-600 text-primary-foreground hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600",
    warning: "border-transparent bg-yellow-600 text-primary-foreground hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600",
    info: "border-transparent bg-blue-600 text-primary-foreground hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
   },
  },
  defaultVariants: {
   variant: "default",
  },
 }
)

export interface BadgeProps
 extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
 return (
  <div className={cn(badgeVariants({ variant }), className)} {...props} />
 )
}

export { Badge, badgeVariants }