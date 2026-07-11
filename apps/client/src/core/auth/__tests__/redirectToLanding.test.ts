import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { redirectToLanding, LANDING_PATH } from '../redirectToLanding';

describe('redirectToLanding', () => {
  let replaceSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    replaceSpy = vi.fn();
    vi.stubGlobal('location', { replace: replaceSpy });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('expone LANDING_PATH como "/"', () => {
    expect(LANDING_PATH).toBe('/');
  });

  it('llama window.location.replace con la ruta de landing', () => {
    redirectToLanding();
    expect(replaceSpy).toHaveBeenCalledWith('/');
    expect(replaceSpy).toHaveBeenCalledOnce();
  });
});
