import { Navigation, Hero, FeaturesSection, SocialProof, Footer } from './_components'

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
