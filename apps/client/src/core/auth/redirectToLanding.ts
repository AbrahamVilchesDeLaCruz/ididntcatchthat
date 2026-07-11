/**
 * Ruta de la landing — único punto de verdad para "después de logout".
 *
 * Usar `redirectToLanding()` cuando el código NO vive dentro del contexto de
 * React Router (p.ej. interceptores de axios, bootstrap de auth) o cuando el
 * guard de AppShell podría capturar el navigate y mandar a /auth/login antes
 * de que aterricemos en la landing. Hace una hard navigation que descarta
 * todo el árbol de React y evita ese problema.
 *
 * En componentes con acceso a `useNavigate` es preferible soft navigation:
 * `navigate('/', { replace: true })`.
 */
export const LANDING_PATH = '/';

export function redirectToLanding(): void {
  window.location.replace(LANDING_PATH);
}
