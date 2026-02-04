import { client } from './sanity'

// Тип для результата запроса
type NavItem = {
  _key: string
  label: {
    uz: string
    ru: string
    en: string
  }
  link: string
}

type NavigationData = {
  items: NavItem[]
}

/**
 * Получает меню навигации из Sanity
 */
export async function getNavigation(): Promise<NavItem[]> {
  try {
    const query = `*[_type == "navigation"][0]{
      items[]{
        _key,
        label,
        link
      }
    }`

    const data = await client.fetch<NavigationData>(query)
    
    return data?.items || []
  } catch (error) {
    console.error('Ошибка при получении меню:', error)
    return []
  }
}

/**
 * Локализованные тексты для Header
 */
export async function getHeaderText() {
  return {
    menu: { uz: 'MENU', ru: 'МЕНЮ', en: 'MENU' },
    close: { uz: 'YOPISH', ru: 'ЗАКРЫТЬ', en: 'CLOSE' },
  }
}
