import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        // Only pass valid variant values to Toast
        const toastVariant = variant === 'success' ? 'default' : variant;
        return (
          <Toast key={id} variant={toastVariant} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action && typeof action === 'object' && action !== null && 'label' in action ? (
              <button onClick={(action as any).onClick} className="text-sm underline">
                {(action as any).label}
              </button>
            ) : (action as unknown as React.ReactNode)}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
