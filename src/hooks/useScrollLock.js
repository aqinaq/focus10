import { useEffect } from 'react'

/**
 * Беттің скроллын құлыптайды. Бірнеше қабат (мобиль меню + модаль) бір мезгілде
 * ашылса да дұрыс жұмыс істеуі үшін ашық қабаттарды санап отырады — біреуі
 * жабылғанда скролл мезгілсіз қайта қосылып кетпейді.
 *
 * iOS Safari-де `overflow: hidden` жеткіліксіз: бет саусақпен бәрібір
 * жылжиды. Сондықтан body-ді `position: fixed` етіп бекітеміз де, ағымдағы
 * скролл орнын `top`-қа теріс мәнмен жазып қоямыз — көзге бет орнында
 * тұрғандай көрінеді. Босатқанда сол орынға қайтарамыз.
 */
let locks = 0
let scrollY = 0
let previous = null

export default function useScrollLock(active) {
  useEffect(() => {
    if (!active) return

    if (locks === 0) {
      const { style } = document.body
      scrollY = window.scrollY
      previous = {
        position: style.position,
        top: style.top,
        left: style.left,
        right: style.right,
        overflow: style.overflow,
      }

      style.position = 'fixed'
      style.top = `-${scrollY}px`
      style.left = '0'
      style.right = '0'
      style.overflow = 'hidden'
    }
    locks += 1

    return () => {
      locks -= 1
      if (locks > 0) return

      Object.assign(document.body.style, previous)
      previous = null
      // Бекітуден босаған бет жоғарыға секіріп кетпеуі үшін.
      // `instant` — әйтпесе html-дегі `scroll-behavior: smooth` салдарынан
      // қалпына келу баяу анимациямен жүреді.
      window.scrollTo({ top: scrollY, behavior: 'instant' })
    }
  }, [active])
}
