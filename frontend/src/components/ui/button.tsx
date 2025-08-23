import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/cn"

const buttonVariants = cva(
 "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
 {
  variants: {
   variant: {
    default: "bg-blue-600 text-primary-foreground hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
    destructive: "bg-red-600 text-primary-foreground hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
    outline: "border border-border bg-card hover:bg-card hover:text-muted-foreground   dark:hover:bg-card dark:text-muted-foreground",
    secondary: "bg-card text-muted-foreground hover:bg-card  dark:text-muted-foreground dark:hover:bg-card",
    ghost: "hover:bg-card hover:text-muted-foreground dark:hover:bg-card dark:hover:text-muted-foreground",
    link: "text-muted-foreground underline-offset-4 hover:underline dark:text-muted-foreground",
   },
   size: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
   },
  },
  defaultVariants: {
   variant: "default",
   size: "default",
  },
 }
)

export interface ButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
 asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant, size, asChild = false, ...props }, ref) => {
  return (
   <button
    className={cn(buttonVariants({ variant, size, className }))}
    ref={ref}
    {...props}
   />
  )
 }
)
Button.displayName = "Button"

export { Button, buttonVariants }