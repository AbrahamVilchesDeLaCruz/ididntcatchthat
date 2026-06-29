import { type ReactElement } from 'react';
import { ThemeToggle } from '@/common/components/ThemeToggle';
import { LocaleToggle } from '@/common/components/LocaleToggle';

export const SidebarHeaderControls = (): ReactElement => (
  <div className="mb-6 flex gap-2 px-3">
    <div className="flex-1">
      <LocaleToggle variant="pill" />
    </div>
    <div className="flex-1">
      <ThemeToggle variant="pill" />
    </div>
  </div>
);
