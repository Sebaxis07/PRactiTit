# 🏡 Pensión Señora Myriam — Kit Digital & Sistema de Gestión Web

> **Sistema Web de Gestión Hospedaje & Gastronomía Casera**  
> *Caleta Paposo, Comuna de Taltal, Región de Antofagasta, Chile.*

![Next.js](https://img.shields.io/badge/Next.js-16.3.0-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma_ORM-7.9.1-2D3748?style=for-the-badge&logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38BDF8?style=for-the-badge&logo=tailwind-css)

---

## 📌 1. Sobre el Proyecto

**Pensión Señora Myriam** es un establecimiento con más de 15 años de trayectoria ubicado en la histórica **Caleta Paposo** (Comuna de Taltal, Chile). Ofrece hospedaje familiar, acogedor y rústico, con habitaciones privadas/independientes y un servicio integral de alimentación 100% casera.

Este proyecto forma parte de su **Kit Digital** y combina:
1. **Sitio Web Público (Landing Page + Portal de Reservas):** Permite a turistas y trabajadores de faena informarse sobre las instalaciones, consultar disponibilidad y realizar solicitudes de reserva en línea.
2. **Sistema Interno de Gestión (Dashboard Administrativo):** Herramienta centralizada para la administración de habitaciones, control de flujo de huéspedes, planificación de cocina (desayunos, colaciones vianda para turnos mineros y cenas), facturación y métricas de ocupación.

---

## 🚀 2. Características Principales

### 🌐 Portal Público (`/`)
- **Landing Page Promocional:** Presentación de la pensión, historia, entorno desértico-costero, instalaciones y gastronomía casera.
- **Flujo de Reserva Digital (`/reservar`):** Formulario guiado para reservas individuales o grupales (turistas y personal de faena/empresa), con selección de servicios de comida y restricciones dietarias.
- **Consulta de Reserva (`/mi-reserva`):** Módulo para que los clientes consulten el estado de su solicitud introduciendo su RUT o código de reserva.

### 🔐 Panel de Administración (`/admin`)
- **Dashboard de Métricas (`/admin`):** Visualización de KPIs en tiempo real (porcentaje de ocupación, habitaciones disponibles/ocupadas, colaciones del día e ingresos estimados) con gráficos interactivos desarrollados en Recharts.
- **Gestión Integral de Reservas (`/admin/reservas`):** Vista de tabla avanzada con filtros y calendario interactivo (**FullCalendar**), control de estados (*Pendiente, Confirmada, Cancelada, Finalizada*) y asignación de habitaciones.
- **Administración de Habitaciones (`/admin/habitaciones`):** Control de capacidad, tarifas base y estados en tiempo real (*Disponible, Ocupada, Mantenimiento, Limpieza*).
- **Módulo de Cocina y Servicios (`/admin/cocina`):** Vista optimizada para el equipo de cocina con el desglose diario de desayunos, colaciones tipo vianda para faena y cenas, incluyendo alertas de restricciones dietarias (*sin sal, vegetariano, sin gluten*).
- **Reportes y Exportación (`/admin/reportes`):** Generación e impresión de reportes ejecutivos en formato **PDF** (`jsPDF` + `autotable`) y planillas **Excel** (`XLSX`).

---

## 🛠️ 3. Stack Tecnológico

| Capa | Tecnología / Librería | Descripción |
| :--- | :--- | :--- |
| **Framework Web** | [Next.js 16 (App Router)](https://nextjs.org/) | Framework Full-Stack con React Server Components (RSC) y Server Actions. |
| **Biblioteca UI** | [React 19](https://react.dev/) | Renderizado dinámico e interactividad moderna. |
| **Lenguaje** | [TypeScript 5](https://www.typescriptlang.org/) | Tipado estático end-to-end para mayor solidez. |
| **ORM & BD** | [Prisma ORM 7.9.1](https://www.prisma.io/) + [Supabase Postgres](https://supabase.com/) | Gestión de esquemas, migraciones y adaptador SQL `@prisma/adapter-pg`. |
| **Estilos & UI** | [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) | Sistema de diseño customizado con tokens terracota, arena y marfil. |
| **Calendario** | [FullCalendar 6/7](https://fullcalendar.io/) | Vista de calendario mensual/semanal para gestión de reservas. |
| **Tablas** | [TanStack Table v9](https://tanstack.com/table/v9) | Tablas de datos de alto rendimiento con ordenamiento y paginación. |
| **Visualización** | [Recharts 3](https://recharts.org/) | Gráficos de barra, línea y dona para el Dashboard. |
| **Generación de Archivos** | [jsPDF](https://github.com/parallax/jsPDF) / [XLSX](https://github.com/SheetJS/sheetjs) | Exportación de reportes oficiales de ocupación y minutas de cocina. |

---

## 🎨 4. Sistema de Diseño y Lenguaje Visual

El diseño sigue el concepto ***Warm Organic & Earthy Modern*** (Rústico Orgánico Premium / Desértico Costero), utilizando la paleta oficial definida en `GUIA_ESTILO_SISTEMA.md`:

| Token | Código HEX | Rol y Uso en la Interfaz |
| :--- | :--- | :--- |
| `card` | `#FFFAF1` | **Fondo de Tarjetas**: Blanco marfil papel rústico |
| `sand` | `#E1DCD2` | **Fondo General**: Arena neutra del desierto de Atacama |
| `sand-deep` | `#EBDCBE` | **Fondo Secundario**: Acento de contenedores y hover |
| `terracotta` | `#D9583B` | **Color Primario / CTA**: Terracota arcilla |
| `terracotta-deep`| `#731D0A` | Hover primario y acentos oscuros |
| `cactus` | `#1EAD50` | **Verde Cacto**: Indicador de éxito, comida casera y estado disponible |
| `ink` | `#2A2418` | **Texto Principal**: Café tinta oscuro (reemplaza el negro puro) |
| `muted` | `#7A6F5A` | Texto secundario y leyendas |

---

## 📂 5. Arquitectura del Código

El proyecto sigue una arquitectura **Modular basada en Funcionalidades (Feature-First Architecture)**:

```text
prototipo-sistema-web/
├── prisma/
│   └── schema.prisma         # Esquema de la base de datos (Habitación, Cliente, Reserva, Servicio)
├── prisma.config.ts          # Configuración centralizada de Prisma ORM 7
├── public/                   # Recursos estáticos e imágenes del hospedaje
├── src/
│   ├── app/                  # Rutas y páginas de Next.js (App Router)
│   │   ├── (public)/         # Sitio público (Landing, /reservar, /mi-reserva)
│   │   └── admin/            # Panel administrativo (/admin, reservas, cocina, habitaciones, reportes)
│   ├── features/             # Módulos de negocio encapsulados
│   │   ├── auth/             # Autenticación de administradores
│   │   ├── clientes/         # Control de huéspedes (turistas y empresas de faena)
│   │   ├── configuracion/    # Ajustes del sistema
│   │   ├── dashboard/        # KPIs, métricas y gráficos
│   │   ├── habitaciones/     # Gestión de piezas, tarifas y disponibilidad
│   │   ├── landing/          # Componentes y secciones de la Landing Page
│   │   ├── reportes/         # Módulo de reportes PDF / Excel
│   │   ├── reservas/         # Lógica de reservas, calendario e itinerarios
│   │   └── servicios-comida/ # Módulo de cocina y alimentación
│   └── shared/               # Componentes y utilidades compartidas
│       ├── components/       # UI genérica (Botones, Modales, Inputs, Navbar, Footer)
│       ├── lib/              # Clientes de BD (db.ts, supabase.ts, pdf.ts)
│       └── utils/            # Formateadores CLP ($), fechas en Chile, validadores
└── GUIA_ESTILO_SISTEMA.md    # Fuente de verdad de tokens y reglas de interfaz
```

---

## ⚙️ 6. Requisitos Previos e Instalación

### Requisitos
- **Node.js**: v20.19.0 o superior
- **npm**: v10+ (o `pnpm` / `bun`)
- **Base de Datos**: Instancia de PostgreSQL (p. ej. en [Supabase](https://supabase.com/))

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/prototipo-sistema-web.git
   cd prototipo-sistema-web
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno (`.env`):**
   Crea un archivo `.env` en la raíz del proyecto basándote en el siguiente formato:
   ```env
   # Conexión a la Base de Datos PostgreSQL (Supabase Transaction Pooler)
   DATABASE_URL="postgresql://postgres.xxx:[TU-PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

   # Conexión directa a PostgreSQL (utilizada para migraciones)
   DIRECT_URL="postgresql://postgres.xxx:[TU-PASSWORD]@aws-0-us-west-2.pooler.supabase.com:5432/postgres"

   # Credenciales de Supabase
   NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
   ```

4. **Sincronizar la Base de Datos con Prisma 7:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Iniciar el Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

---

## 📜 7. Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo en local. |
| `npm run build` | Compila la aplicación para producción. |
| `npm run start` | Inicia el servidor de producción compilado. |
| `npm run lint` | Ejecuta la verificación de código con ESLint. |
| `npx prisma validate` | Valida el esquema de Prisma y la configuración en `prisma.config.ts`. |
| `npx prisma generate` | Genera el cliente de Prisma actualizado. |
| `npx prisma studio` | Abre la interfaz gráfica de Prisma para visualizar los datos. |

---

## 📄 8. Licencia & Créditos

Desarrollado para el **Kit Digital — Pensión Señora Myriam** (Caleta Paposo, Taltal, Chile).  
Todos los derechos reservados © 2026.
