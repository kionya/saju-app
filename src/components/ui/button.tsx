import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-[var(--app-gold)]/55 focus-visible:ring-3 focus-visible:ring-[var(--app-gold)]/24 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-[var(--app-gold)]/65 bg-[linear-gradient(135deg,var(--app-gold),var(--app-gold-bright))] text-[var(--app-bg)] shadow-[0_14px_34px_rgba(210,176,114,0.23)] hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(210,176,114,0.32)]",
        outline:
          "border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 text-[var(--app-gold-text)] hover:-translate-y-0.5 hover:bg-[var(--app-gold)]/18 hover:text-[var(--app-ivory)] aria-expanded:bg-[var(--app-gold)]/18 aria-expanded:text-[var(--app-ivory)]",
        secondary:
          "border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy)] hover:-translate-y-0.5 hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)] aria-expanded:bg-[var(--app-surface-strong)] aria-expanded:text-[var(--app-ivory)]",
        ghost:
          "border-transparent bg-transparent text-[var(--app-copy-muted)] hover:bg-[var(--app-gold)]/8 hover:text-[var(--app-gold-text)] aria-expanded:bg-[var(--app-gold)]/8 aria-expanded:text-[var(--app-gold-text)]",
        destructive:
          "border-rose-300/28 bg-rose-400/12 text-rose-100 hover:-translate-y-0.5 hover:bg-rose-400/18 focus-visible:border-rose-300/45 focus-visible:ring-rose-300/20 dark:bg-rose-400/14 dark:hover:bg-rose-400/22",
        link: "rounded-none border-transparent px-0 text-[var(--app-gold-text)] underline-offset-4 hover:text-[var(--app-ivory)] hover:underline",
      },
      size: {
        default:
          "h-11 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-8 gap-1.5 px-3 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-4 text-[0.82rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 text-[0.95rem] has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-11",
        "icon-xs":
          "size-8 in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
