/**
 * Layout for (auth) route group — login, forgot-password, etc.
 * No sidebar. Just passes children through.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
