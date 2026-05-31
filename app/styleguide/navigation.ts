export interface NavItem {
  name: string
  href: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navigation: NavSection[] = [
  {
    title: "Foundation",
    items: [
      { name: "Design Tokens", href: "/styleguide" },
    ],
  },
  {
    title: "Components",
    items: [
      { name: "Form", href: "/styleguide/components/form" },
      { name: "Label", href: "/styleguide/components/label" },
      { name: "Select", href: "/styleguide/components/select" },
      { name: "Dialog", href: "/styleguide/components/dialog" },
      { name: "Table", href: "/styleguide/components/table" },
      { name: "Progress", href: "/styleguide/components/progress" },
      { name: "Tabs", href: "/styleguide/components/tabs" },
      { name: "Separator", href: "/styleguide/components/separator" },
      { name: "Avatar", href: "/styleguide/components/avatar" },
      { name: "Dropdown Menu", href: "/styleguide/components/dropdown-menu" },
      { name: "Chart", href: "/styleguide/components/chart" },
      { name: "Slider", href: "/styleguide/components/slider" },
      { name: "Tooltip", href: "/styleguide/components/tooltip" },
      { name: "Skeleton", href: "/styleguide/components/skeleton" },
      { name: "Scroll Area", href: "/styleguide/components/scroll-area" },
    ],
  },
]
