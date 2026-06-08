import * as RadixTabs from "@radix-ui/react-tabs"
import { cn } from "../../lib/utils"

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  tabs: { value: string; label: string }[]
  children?: React.ReactNode
  className?: string
}

export function Tabs({ value, onValueChange, tabs, children, className }: TabsProps) {
  return (
    <RadixTabs.Root value={value} onValueChange={onValueChange} className={cn("w-full", className)}>
      <RadixTabs.List className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors hover:text-gray-900",
              "data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600",
              "text-gray-500"
            )}
          >
            {tab.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  )
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  return (
    <RadixTabs.Content value={value} className={cn("mt-4", className)}>
      {children}
    </RadixTabs.Content>
  )
}
