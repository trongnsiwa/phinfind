"use client"

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group top-4 right-4 max-sm:left-4 w-96 max-w-[90vw]"
      icons={{
        success: <CircleCheck className="h-5 w-5 text-green-400 shrink-0" />,
        info: <Info className="h-5 w-5 text-amber-gold shrink-0" />,
        warning: <TriangleAlert className="h-5 w-5 text-orange-400 shrink-0" />,
        error: <OctagonX className="h-5 w-5 text-rose-400 shrink-0" />,
        loading: <LoaderCircle className="h-5 w-5 text-amber-gold shrink-0 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast rounded-2xl p-4 gap-3 items-start bg-dark-bg/80 backdrop-blur-xl border border-amber-gold/20 shadow-2xl shadow-black/30 shadow-amber-gold/5 transition-all duration-200 text-cream-white",
          title: "text-cream-white font-sans font-semibold text-sm",
          description: "text-soft-beige/90 text-xs",
          actionButton:
            "bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-lg px-3 py-1.5 text-xs transition-colors",
          cancelButton:
            "bg-dark-roast/80 hover:bg-white/10 text-soft-beige rounded-lg px-3 py-1.5 text-xs transition-colors",
        },
      }}
      {...props}
      richColors={false}
    />
  )
}

export { Toaster }
