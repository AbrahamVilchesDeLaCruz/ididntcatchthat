import { type ReactElement, type ReactNode } from 'react';

interface ProfileSectionHeadingProps {
  id?: string;
  children: ReactNode;
}

export const ProfileSectionHeading = ({
  id,
  children,
}: ProfileSectionHeadingProps): ReactElement => (
  <h2
    id={id}
    className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
  >
    {children}
  </h2>
);
