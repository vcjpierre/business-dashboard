# Panel de Control para Pequeños Negocios

Dashboard completo para dueños de pequeños negocios que permite realizar seguimiento de **ingresos**, **gastos** y **crecimiento de clientes**. Incluye gráficos interactivos, filtros por fecha/categoría y exportación de informes en CSV.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Vite 8 + React 19 + TypeScript 6 |
| **Backend** | Express + TursoDB |
| **Estilos** | TailwindCSS 3 + Framer Motion |
| **UI Primitives** | Radix UI (Dialog, Select, Tabs, DropdownMenu) |
| **Íconos** | Lucide React |
| **Gráficos** | Recharts (Bar, Line, Area, Pie) |
| **Autenticación** | JWT + bcryptjs |
| **Base de datos** | TursoDB / SQLite local |
| **Deploy** | Vercel (frontend + serverless functions) |

## Requisitos

- Node.js 20+
- npm 9+

## Instalación

```bash
git clone <repo-url> business-dashboard
cd business-dashboard
npm install
```

## Configuración

Crear archivo `.env` en la raíz:

```env
VITE_API_URL=http://localhost:3001/api
TURSO_DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=
JWT_SECRET=tu-secreto-jwt-cambiar-en-produccion
```

> Para usar **TursoDB remoto**, cambiá `TURSO_DATABASE_URL` por la URL de tu base Turso y agregá el `TURSO_AUTH_TOKEN`.

## Seed de Datos de Ejemplo

```bash
npm run seed
```

Crea un usuario de prueba:

```
Email:    admin@demo.com
Password: admin123
```

## Ejecución Local

```bash
# Todo junto (servidor + frontend)
npm run dev

# O por separado:
npm run dev:client   # Frontend en http://localhost:5173
npm run dev:server   # Servidor en http://localhost:3001
```


## Estructura del Proyecto

```
business-dashboard/
├── api/
│   └── index.ts              → Entry point serverless para Vercel
├── src/
│   ├── components/
│   │   ├── ui/               → Button, Card, Input, Select, Dialog, Tabs, Badge
│   │   ├── charts/           → OverviewChart, IncomeExpenseChart, ClientGrowthChart, CategoryPieChart
│   │   ├── layout/           → Sidebar, Header, DashboardLayout
│   │   ├── filters/          → FilterBar (rango de fechas + categoría/fuente)
│   │   └── export/           → ExportButton + exportToCSV()
│   ├── pages/
│   │   ├── Login.tsx         → Inicio de sesión
│   │   ├── Register.tsx      → Registro de usuario
│   │   ├── Dashboard.tsx     → Panel principal con resumen y gráficos
│   │   ├── Incomes.tsx       → CRUD de ingresos con filtros
│   │   ├── Expenses.tsx      → CRUD de gastos con filtros
│   │   ├── Customers.tsx     → CRUD de clientes
│   │   └── Reports.tsx       → Reportes con tabs (financiero, clientes, categorías)
│   ├── contexts/
│   │   └── AuthContext.tsx    → Contexto de autenticación
│   ├── lib/
│   │   ├── api.ts            → Cliente HTTP con token JWT
│   │   └── utils.ts          → cn(), formatCurrency(), formatDate()
│   ├── types/
│   │   └── index.ts          → Interfaces compartidas
│   ├── App.tsx               → Router con rutas protegidas
│   └── main.tsx              → Entry point
├── server/
│   └── src/
│       ├── index.ts          → Servidor Express (local) / exporta createApp()
│       ├── db.ts             → Cliente TursoDB: HTTP directo (Vercel) o @libsql/client (local)
│       ├── auth.ts           → Helpers de JWT y bcrypt
│       ├── seed.ts           → Datos de ejemplo
│       ├── middleware/
│       │   └── auth.ts       → Middleware de autenticación
│       └── routes/
│           ├── auth.ts       → POST /api/auth/login, /api/auth/register
│           ├── incomes.ts    → CRUD /api/incomes
│           ├── expenses.ts   → CRUD /api/expenses
│           ├── customers.ts  → CRUD /api/customers
│           └── dashboard.ts  → GET /api/dashboard/summary, /chart, /category-breakdown
├── vercel.json               → Configuración de deploy
├── .env                      → Variables de entorno locales
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## API Endpoints

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión |

### Dashboard (requiere token)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/dashboard/summary` | Resumen (ingresos, gastos, ganancia neta, clientes) |
| GET | `/api/dashboard/chart?months=6` | Datos para gráficos por mes |
| GET | `/api/dashboard/category-breakdown` | Gastos agrupados por categoría |

### Ingresos, Gastos, Clientes (requiere token)
CRUD completo con filtros por fecha, fuente (ingresos) y categoría (gastos).

## Funcionalidades

- **Autenticación**: Registro e inicio de sesión con JWT
- **Dashboard**: Cards de resumen con métricas clave + gráficos interactivos
- **Ingresos**: CRUD con filtros por fecha y fuente de ingreso
- **Gastos**: CRUD con filtros por fecha y categoría
- **Clientes**: CRUD con datos de contacto e ingresos generados
- **Reportes**: Vista detallada con tabs (financiero, clientes, categorías)
- **Exportación**: Export a CSV desde cualquier sección
- **Animaciones**: Transiciones suaves con Framer Motion
- **Responsive**: Diseño adaptable con TailwindCSS
