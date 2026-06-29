import { useState, type ReactElement } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  BookOpen,
  Headphones,
  Home,
  Layers,
  LineChart,
  Menu,
  Trophy,
  Users,
} from 'lucide-react';
import { useI18n } from '@/core/i18n';
import { useCurrentUser } from '@/core/auth/useCurrentUser';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/common/components/ui/sheet';
import { BrandWordmark } from '@/common/components/BrandWordmark';
import { Button } from '@/common/components/ui/button';
import { SidebarFooter } from '@/common/layout/SidebarFooter';

const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-[var(--color-brand-dim)] text-[var(--color-brand)]'
      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]'
  }`;

const navIconClass = 'h-[18px] w-[18px] shrink-0';

interface SidebarContentProps {
  onNavigate?: () => void;
}

const SidebarContent = ({ onNavigate }: SidebarContentProps): ReactElement => {
  const { t } = useI18n();
  const s = t.sidebar;
  const {
    canAccessBackoffice,
    canAccessObservability,
    canManageFlashcards,
    isUser,
    isAdmin,
    canStudy,
  } = useCurrentUser();

  return (
    <>
      <Link to="/home" onClick={onNavigate} className="mb-8 block px-3">
        <BrandWordmark className="text-lg" />
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        <div className="mb-2">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            {s.sections.game}
          </p>
          <NavLink to="/home" className={navLinkClass} onClick={onNavigate}>
            <Home className={navIconClass} aria-hidden />
            {s.nav.home}
          </NavLink>
          <NavLink to="/game" className={navLinkClass} onClick={onNavigate}>
            <Headphones className={navIconClass} aria-hidden />
            {s.nav.play}
          </NavLink>
        </div>

        {canStudy && (
          <div className="mb-2">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {s.sections.study}
            </p>
            <NavLink to="/study" className={navLinkClass} onClick={onNavigate}>
              <BookOpen className={navIconClass} aria-hidden />
              {s.nav.study}
            </NavLink>
          </div>
        )}

        {(isUser || isAdmin || canAccessBackoffice) && (
          <div className="mb-2">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {s.sections.progress}
            </p>
            <NavLink to="/stats" className={navLinkClass} onClick={onNavigate}>
              <LineChart className={navIconClass} aria-hidden />
              {s.nav.stats}
            </NavLink>
            {isUser ? (
              <NavLink
                to="/ranking"
                className={navLinkClass}
                onClick={onNavigate}
              >
                <Trophy className={navIconClass} aria-hidden />
                {s.nav.ranking}
              </NavLink>
            ) : null}
          </div>
        )}

        {canAccessBackoffice && (
          <div className="mb-2">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {s.sections.backoffice}
            </p>
            <NavLink
              to="/backoffice/games"
              className={navLinkClass}
              onClick={onNavigate}
            >
              <BarChart3 className={navIconClass} aria-hidden />
              {s.nav.gameMetrics}
            </NavLink>
            <NavLink
              to="/backoffice/users"
              className={navLinkClass}
              onClick={onNavigate}
            >
              <Users className={navIconClass} aria-hidden />
              {s.nav.userMetrics}
            </NavLink>
            {canManageFlashcards && (
              <NavLink
                to="/backoffice/flashcards"
                className={navLinkClass}
                onClick={onNavigate}
              >
                <Layers className={navIconClass} aria-hidden />
                {s.nav.flashcards}
              </NavLink>
            )}
          </div>
        )}

        {canAccessObservability && (
          <div className="mb-2">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {s.sections.system}
            </p>
            <NavLink
              to="/backoffice/observability"
              className={navLinkClass}
              onClick={onNavigate}
            >
              <Activity className={navIconClass} aria-hidden />
              {s.nav.observability}
            </NavLink>
          </div>
        )}
      </nav>

      <SidebarFooter onNavigate={onNavigate} />
    </>
  );
};

export const AppSidebar = (): ReactElement => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden md:flex w-60 h-svh sticky top-0 bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] flex-col px-4 py-6 shrink-0 overflow-y-auto">
        <SidebarContent />
      </aside>

      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-[var(--color-bg-surface)] border border-[var(--color-border)]"
            >
              <Menu className="h-5 w-5 text-[var(--color-text-primary)]" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-60 bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] flex flex-col px-4 py-6 p-0"
          >
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};
