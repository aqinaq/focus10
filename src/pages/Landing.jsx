import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Pricing from '../components/Pricing'
import UseCases from '../components/UseCases'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main id="main">
        <Hero />
        <Features />
        <Pricing />
        <UseCases />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
