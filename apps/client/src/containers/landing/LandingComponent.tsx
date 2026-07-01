import { type ReactElement, useState } from 'react';
import { LandingFooter } from '@/containers/landing/components/LandingFooter';
import { LandingHero } from '@/containers/landing/components/LandingHero';
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
      <LandingHero onPlay={() => setShowAuthGate(true)} />
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
