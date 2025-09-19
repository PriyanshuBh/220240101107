import { toast } from "sonner"

interface ToastOptions {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export const useToast = () => {
  return {
    toast: (options: ToastOptions) => {
      const message = options.description || options.title || ""

      if (options.variant === "destructive") {
        return toast.error(message, {
          style: {
            background: "hsl(var(--destructive))",
            color: "hsl(var(--destructive-foreground))",
            border: "1px solid hsl(var(--destructive))",
          },
        })
      } else {
        return toast.success(message, {
          style: {
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            border: "1px solid hsl(var(--primary))",
          },
        })
      }
    },
  }
}
