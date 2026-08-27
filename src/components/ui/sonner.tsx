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
      className="toaster group top-4 right-4 max-sm:left-4 max-sm:right-4 w-96 max-w-[90vw]"
      icons={{
        success: <CircleCheck className="h-5 w-5 text-teal shrink-0" />,
        info: <Info className="h-5 w-5 text-amber-gold shrink-0" />,
        warning: <TriangleAlert className="h-5 w-5 text-orange-400 shrink-0" />,
        error: <OctagonX className="h-5 w-5 text-rose-400 shrink-0" />,
        loading: <LoaderCircle className="h-5 w-5 text-amber-gold shrink-0 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-3xl !p-5 !gap-4 !items-start !bg-card !backdrop-blur-xl !border !border-border !border-t-2 !border-t-amber-gold/60 !shadow-xl !text-foreground transition-all duration-200",
          title: "!text-foreground !font-semibold !text-sm !tracking-wide",
          description: "!text-muted-foreground !text-sm !leading-relaxed !max-w-xs",
          actionButton:
            "!bg-amber-gold hover:!bg-amber-gold-hover !text-primary-foreground !font-bold !rounded-full !px-5 !py-2 !text-xs !shadow-md hover:!scale-[1.02] active:!scale-95 transition-all duration-200 !border-none cursor-pointer mt-2",
          cancelButton:
            "!bg-secondary hover:!bg-accent !text-secondary-foreground !rounded-full !px-4 !py-2 !text-xs transition-colors !border-none cursor-pointer mt-2",
        },
      }}
      {...props}
      richColors={false}
    />
  )
}

export { Toaster }
