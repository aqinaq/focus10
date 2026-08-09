import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import UseCases from '../components/UseCases'
import About from '../components/About'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div className="min-h-dvh bg-white">
      <Navbar />
      <main id="main">
        <Hero />
        <Features />
        <UseCases />
        <About />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
