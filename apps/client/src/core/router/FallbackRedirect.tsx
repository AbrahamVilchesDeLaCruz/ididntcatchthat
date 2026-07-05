import { type ReactElement } from 'react';
import { NotFoundPage } from './NotFoundPage';

/** @deprecated Use NotFoundPage — kept as route alias for existing imports. */
export const FallbackRedirect = (): ReactElement => {
  return <NotFoundPage />;
};
