import { type ReactElement, useState } from 'react';
import { LandingFooter } from '@/containers/landing/components/LandingFooter';
import { LandingHeader } from '@/containers/landing/components/LandingHeader';
import { LandingHero } from '@/containers/landing/components/LandingHero';
import { LandingTrustBar } from '@/containers/landing/components/LandingTrustBar';
import { LandingHowItWorks } from '@/containers/landing/components/LandingHowItWorks';
import { LandingModules } from '@/containers/landing/components/LandingModules';
import { LandingFinalCta } from '@/containers/landing/components/LandingFinalCta';
import { LandingProblem } from '@/containers/landing/components/LandingProblem';
import { LandingGameDemo } from '@/containers/landing/components/LandingGameDemo';
import { AuthGateModal } from '@/containers/landing/components/AuthGateModal';

export const LandingComponent = (): ReactElement => {
  const [showAuthGate, setShowAuthGate] = useState<boolean>(false);

  return (
    <main className="min-h-svh bg-[var(--color-bg-base)]">
      <LandingHeader />
      <LandingHero onPlay={() => setShowAuthGate(true)} />
      <LandingTrustBar />
      <LandingGameDemo />
      <LandingProblem />
      <LandingHowItWorks />
      <LandingModules />
      <LandingFinalCta onPlay={() => setShowAuthGate(true)} />
      <LandingFooter />
      <AuthGateModal
        open={showAuthGate}
        onClose={() => setShowAuthGate(false)}
      />
    </main>
  );
};
