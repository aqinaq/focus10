import { createContext, useContext } from 'react'

export const UIContext = createContext(null)

/**
 * Беттегі барлық батырма осы контекст арқылы жұмыс істейді:
 * тіркелу/кіру модалі, демо модалі және toast хабарламалары.
 */
export function useUI() {
  const context = useContext(UIContext)
  if (!context) {
    throw new Error('useUI тек <UIProvider> ішінде қолданылады')
  }
  return context
}
