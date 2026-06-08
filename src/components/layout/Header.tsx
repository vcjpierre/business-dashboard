import { Bell } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"

export function Header() {
  const { user } = useAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Panel de Control</h1>
        <p className="text-sm text-gray-500">Bienvenido de vuelta, {user?.business_name}</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  )
}
