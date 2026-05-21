import { LandingFooter } from '@/containers/landing/components/LandingFooter';
import { LandingHero } from '@/containers/landing/components/LandingHero';
import { LandingHowItWorks } from '@/containers/landing/components/LandingHowItWorks';
import { LandingModules } from '@/containers/landing/components/LandingModules';
import { LandingNotify } from '@/containers/landing/components/LandingNotify';
import { LandingProblem } from '@/containers/landing/components/LandingProblem';

export const LandingComponent = (): JSX.Element => {
  return (
    <main className="min-h-svh bg-[var(--color-bg-base)]">
      <LandingHero />
      <LandingProblem />
      <LandingHowItWorks />
      <LandingModules />
      <LandingNotify />
      <LandingFooter />
    </main>
  );
};
