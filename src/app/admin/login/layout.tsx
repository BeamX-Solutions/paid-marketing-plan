export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No auth check for the login page
  return <>{children}</>;
}
