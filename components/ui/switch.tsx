"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  const [isChecked, setIsChecked] = React.useState(props.checked || props.defaultChecked || false);

  React.useEffect(() => {
    if (props.checked !== undefined) {
      setIsChecked(props.checked);
    }
  }, [props.checked]);

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "relative overflow-hidden transition-all duration-300 ease-out cursor-pointer",
        "data-[state=unchecked]:bg-bg-hover",
        className
      )}
      onCheckedChange={(checked) => {
        setIsChecked(checked);
        props.onCheckedChange?.(checked);
      }}
      {...props}
    >
      {/* 渐变背景层 - 使用 opacity 过渡 */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-r from-[#C721FF] to-[#FF3466]",
          "transition-opacity duration-300 ease-out",
          isChecked ? "opacity-100" : "opacity-0"
        )}
      />

      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-all duration-300 ease-out relative z-10",
          "data-[state=checked]:translate-x-5",
          "data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
