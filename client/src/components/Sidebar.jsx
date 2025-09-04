import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="px-6 py-4 text-2xl font-bold border-b border-gray-700">
        Dashboard
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link
          to="/"
          className={`block rounded-lg px-4 py-2 transition ${
            pathname === "/" ? "bg-gray-700 font-semibold" : "hover:bg-gray-700"
          }`}
        >
          Products
        </Link>
        <Link
          to="/categories"
          className={`block rounded-lg px-4 py-2 transition ${
            pathname === "/categories"
              ? "bg-gray-700 font-semibold"
              : "hover:bg-gray-700"
          }`}
        >
          Categories
        </Link>
      </nav>
    </aside>
  );
}
