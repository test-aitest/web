import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-theme min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="text-lg font-bold text-gray-900">
            CardLink <span className="text-sm font-normal text-gray-400">Admin</span>
          </Link>
          <Link href="/profile" target="_blank" className="text-sm text-blue-600 hover:underline">
            公開ページを見る →
          </Link>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 flex gap-6">
          <NavLink href="/admin">ダッシュボード</NavLink>
          <NavLink href="/admin/edit">プロフィール</NavLink>
          <NavLink href="/admin/links">リンク管理</NavLink>
          <NavLink href="/admin/design">デザイン</NavLink>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="py-3 text-sm text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-blue-500 transition-colors"
    >
      {children}
    </Link>
  );
}
