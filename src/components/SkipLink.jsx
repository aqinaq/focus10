/**
 * Пернетақтамен жүретін қолданушы навигацияны әр жолы аралап отырмауы үшін
 * бірінші Tab-та шығатын сілтеме.
 */
export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-brand-600 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
    >
      Негізгі мазмұнға өту
    </a>
  )
}
