import { useEffect } from 'react'

/**
 * Беттің скроллын құлыптайды. Бірнеше қабат (мобиль меню + модаль) бір мезгілде
 * ашылса да дұрыс жұмыс істеуі үшін ашық қабаттарды санап отырады — біреуі
 * жабылғанда скролл мезгілсіз қайта қосылып кетпейді.
 */
let locks = 0
let previousOverflow = ''

export default function useScrollLock(active) {
  useEffect(() => {
    if (!active) return

    if (locks === 0) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    locks += 1

    return () => {
      locks -= 1
      if (locks === 0) document.body.style.overflow = previousOverflow
    }
  }, [active])
}
