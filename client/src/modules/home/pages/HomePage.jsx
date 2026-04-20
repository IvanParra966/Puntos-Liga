import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import FutureSection from '../components/FutureSection';
import CtaSection from '../components/CtaSection';

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <HeroSection />
      <FeaturesSection />
      <FutureSection />
      <CtaSection />
    </div>
  );
}