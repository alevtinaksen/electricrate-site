export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden select-none z-50">
      {children}
    </div>
  );
}
