import Navigation from '@/components/landing/navigation'
import Hero from '@/components/landing/hero'
import FeaturesSection from '@/components/landing/features-section'
import SocialProof from '@/components/landing/social-proof'
import Footer from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <main className="landing-page min-h-screen text-white">
      <Navigation />
      <Hero />
      <FeaturesSection />
      <SocialProof />
      <Footer />
    </main>
  )
}
