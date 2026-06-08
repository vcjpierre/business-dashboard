import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  LogOut,
  Store,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { useAuth } from "../../contexts/AuthContext"

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/incomes", label: "Ingresos", icon: TrendingUp },
  { to: "/expenses", label: "Gastos", icon: TrendingDown },
  { to: "/customers", label: "Clientes", icon: Users },
  { to: "/reports", label: "Reportes", icon: FileText },
]

export function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex items-center gap-2 border-b px-6 py-5">
        <Store className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-bold">Mi Negocio</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }: { isActive: boolean }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t px-4 py-4">
        <div className="mb-3 truncate text-sm font-medium text-gray-700">
          {user?.business_name}
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}
