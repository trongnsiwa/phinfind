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
      className="toaster group top-4 right-4 max-sm:left-4 max-sm:right-4 w-96 max-w-[90vw]"
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
            "group toast !rounded-3xl !p-5 !gap-4 !items-start !bg-gradient-to-br !from-[#101010] !to-[#141414] !backdrop-blur-xl !border !border-amber-gold/20 !border-t-2 !border-t-amber-gold/60 !shadow-[0_12px_40px_rgba(0,0,0,0.6)] !shadow-amber-gold/10 !text-white transition-all duration-200",
          title: "!text-white !font-semibold !text-sm !tracking-wide",
          description: "!text-[#D0D0D0]/80 !text-sm !leading-relaxed !max-w-xs",
          actionButton:
            "!bg-amber-gold hover:!bg-amber-gold-hover !text-[#101010] !font-bold !rounded-full !px-5 !py-2 !text-xs !shadow-md hover:!scale-[1.02] active:!scale-95 transition-all duration-200 !border-none cursor-pointer mt-2",
          cancelButton:
            "!bg-[#141414]/80 hover:!bg-white/10 !text-[#D0D0D0] !rounded-full !px-4 !py-2 !text-xs transition-colors !border-none cursor-pointer mt-2",
        },
      }}
      {...props}
      richColors={false}
    />
  )
}

export { Toaster }
