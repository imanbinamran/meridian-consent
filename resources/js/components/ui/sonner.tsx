import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useAppearance } from "@/hooks/use-appearance"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  // The app themes itself with a class (see use-appearance), not
  // next-themes, so pass the resolved theme or toasts ignore the toggle.
  const { resolvedAppearance } = useAppearance()

  return (
    <Sonner
      theme={resolvedAppearance}
      // Clear the iPhone home indicator when the page runs edge to edge.
      mobileOffset={{
        bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        left: "16px",
        right: "16px",
      }}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
