import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import ProductProof from '../components/ProductProof'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div className="min-h-dvh bg-white dark:bg-slate-950">
      <Navbar />
      <main id="main">
        <Hero />
        <Features />
        <ProductProof />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
