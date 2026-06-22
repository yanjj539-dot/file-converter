export type DrawerAction = {
  slug: string
  title: string
  collection: string
}

export const useActionDrawer = () => {
  const isOpen = useState<boolean>('green-civic-drawer-open', () => false)
  const actions = useState<DrawerAction[]>('green-civic-drawer-actions', () => [])

  const openDrawer = () => {
    isOpen.value = true
  }

  const closeDrawer = () => {
    isOpen.value = false
  }

  const addAction = (action: DrawerAction) => {
    if (!actions.value.some((item) => item.slug === action.slug)) {
      actions.value = [...actions.value, action]
    }
    openDrawer()
  }

  const removeAction = (slug: string) => {
    actions.value = actions.value.filter((item) => item.slug !== slug)
  }

  const clearActions = () => {
    actions.value = []
  }

  return {
    isOpen,
    actions,
    openDrawer,
    closeDrawer,
    addAction,
    removeAction,
    clearActions
  }
}
