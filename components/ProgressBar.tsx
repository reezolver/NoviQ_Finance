import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type ProgressBarVariant = "default" | "success" | "warning" | "destructive" | "info"
type ProgressBarSize = "xs" | "sm" | "default" | "lg"

interface ProgressBarProps extends React.ComponentProps<typeof Progress> {
  variant?: ProgressBarVariant
  size?: ProgressBarSize
}

const indicatorColor: Record<ProgressBarVariant, string> = {
  default:     "[&_[data-slot=progress-indicator]]:bg-primary",
  success:     "[&_[data-slot=progress-indicator]]:bg-success",
  warning:     "[&_[data-slot=progress-indicator]]:bg-warning",
  destructive: "[&_[data-slot=progress-indicator]]:bg-destructive",
  info:        "[&_[data-slot=progress-indicator]]:bg-info",
}

const trackHeight: Record<ProgressBarSize, string> = {
  xs:      "h-0.5",
  sm:      "h-1",
  default: "h-2",
  lg:      "h-3",
}

export function ProgressBar({
  variant = "default",
  size = "default",
  className,
  ...props
}: ProgressBarProps) {
  return (
    <Progress
      className={cn(
        trackHeight[size],
        indicatorColor[variant],
        className
      )}
      {...props}
    />
  )
}
