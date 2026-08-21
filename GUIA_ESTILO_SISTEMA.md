# 📖 GUÍA DE ESTILO Y CONTEXTO DEL PROYECTO
## Pensión Señora Myriam — Sistema de Gestión & Landing Web

> **Nota para el Asistente AI / Desarrollador:**  
> Este documento sirve como la **fuente de verdad indiscutible** para el contexto del negocio, la filosofía de diseño y el sistema de tokens visuales. Cada nuevo módulo, componente, dashboard o widget desarrollado en **Next.js** debe respetar rigurosamente las pautas aquí descritas para garantizar coherencia estética total entre el sitio landing y el sistema interno.

---

## 📍 1. Contexto General y Propósito del Proyecto

### **El Negocio**
* **Nombre:** Pensión Señora Myriam
* **Ubicación:** Caleta Paposo, Comuna de Taltal, Región de Antofagasta, Chile.
* **Propuesta de Valor:** Hospedaje rústico, acogedor y familiar con más de 15 años de servicio. Ofrece piezas privadas e independientes, baño compartido imponente y comida 100% casera (desayuno, almuerzo, cena y colaciones vianda para trabajadores).

### **Público Objetivo**
1. **Trabajadores y Contratistas:** Personal técnico y operativo en obras, faenas mineras, portuarias o viales en la zona de Paposo/Taltal.
2. **Viajeros y Turistas:** Visitantes atraídos por la biodiversidad costera, el fenómeno del Desierto Florido y la tranquilidad del desierto de Atacama.

### **El Sistema (Dashboard + Widget)**
Complementando la landing page informativa, se construye un **Sistema de Gestión de Pensiones y Reservas** que permite gestionar huéspedes, disponibilidad de habitaciones, menús diarios, colaciones entregadas, facturación/reportes y métricas de ocupación.

---

## 🌿 2. Filosofía y Lenguaje de Diseño

**Estilo Visual:** *Warm Organic & Earthy Modern* (Rústico Orgánico Premium / Desértico Costero).

* **Sensación:** Calidez humana, tradición, tranquilidad desértica y limpieza profesional.
* **Geometría:** Esquinas suavizadas y muy redondeadas (`border-radius: 1rem` a `1.5rem`), siluetas *pill* para botones (`rounded-pill`) e inclinaciones sutiles (`-2deg`) en marcos decorativos.
* **Texturas:** Uso de grano rústico imitando papel kraft / tierra (`grain` mediante turbulencia SVG), desenfoques traslúcidos (*glassmorphism*) y sombras cálidas elevadas con matices rojizos/terracota.

---

## 🎨 3. Tokens de Diseño y Paleta de Colores

Cualquier nuevo componente en Tailwind CSS o CSS puro debe utilizar las siguientes equivalencias exactas:

### **Tabla de Colores Oficiales**

| Token / Variable | Código HEX | Rol y Uso en la Interfaz | Configuración en Tailwind (`tailwind.config.ts`) |
| :--- | :--- | :--- | :--- |
| `sand` | `#E1DCD2` | Fondo principal neutro de la aplicación | `colors.sand: '#E1DCD2'` |
| `sand-deep` | `#EBDCBE` | Fondo alternativo/tarjetas secundarias | `colors['sand-deep']: '#EBDCBE'` |
| `terracotta` | `#D9583B` | **Primario de Acento**: Botones principales, CTAs, estados activos | `colors.terracotta: '#D9583B'` |
| `terracotta-deep`| `#731D0A` | Hover de botones primarios y acentos oscuros | `colors['terracotta-deep']: '#731D0A'` |
| `cactus` | `#1EAD50` | Verde ecológico: Tags de "Casero", estados positivos, éxito | `colors.cactus: '#1EAD50'` |
| `ink` | `#2A2418` | **Texto Primario**: Tinta café oscura (sustituye el negro puro) | `colors.ink: '#2A2418'` |
| `card` | `#FFFAF1` | **Fondo de Tarjetas**: Blanco marfil papel | `colors.card: '#FFFAF1'` |
| `border-color` | `#DDD0B3` | Bordes suaves de contenedores y divisores | `colors['sand-border']: '#DDD0B3'` |
| `muted` | `#7A6F5A` | Texto secundario, subtítulos y leyendas | `colors.muted: '#7A6F5A'` |

---

## 🔤 4. Sistema Tipográfico

El sistema utiliza una pareja tipográfica de alto contraste para mantener el equilibrio entre tradición y legibilidad digital:

1. **Titulares / Serif (`Font Display`):** `Fraunces` o `Georgia`
   * **Uso:** Encabezados (`h1`, `h2`, `h3`), números KPI principales, nombres de secciones y menús del día.
   * **Estilo:** `font-weight: 600`, toque rústico, elegante y artesanal.

2. **Cuerpo e Interfaz (`Font Sans-Serif`):** `DM Sans` o `Inter`
   * **Uso:** Textos de lectura, tablas de datos, botones, inputs de formularios y navegación.
   * **Estilo:** Limpio, highly legible en dispositivos móviles.

---

## 🛠️ 5. Guía de Componentes para el Sistema (Next.js + Tailwind)

### **A. Botones**
* **Primario:** `bg-terracotta hover:bg-terracotta-deep text-white font-semibold rounded-full px-5 py-2.5 shadow-md transition-all hover:-translate-y-0.5`
* **Secundario / Outline:** `border border-sand-border bg-card hover:bg-sand-deep text-ink font-semibold rounded-full px-5 py-2.5 transition-all`
* **Acción de Tabla / Ícono:** `w-10 h-10 rounded-xl bg-terracotta/10 hover:bg-terracotta hover:text-white transition-colors grid place-items-center text-terracotta`

### **B. Tarjetas (Cards & Contenedores)**
* **Estilo Base:** `bg-card border border-sand-border rounded-2xl p-6 shadow-sm`
* **Tarjetas KPI:** `bg-card border border-sand-border rounded-2xl p-5 hover:border-terracotta/40 transition-all` con el número en `font-serif text-2xl text-terracotta font-bold`.

### **C. Adaptación de Módulos Específicos**

1. **Calendario de Reservas (FullCalendar):**
   * Estilar los bloques de evento con tonos `terracotta` (reservado) y `cactus` (disponible).
   * Bordes redondeados `rounded-lg` en los eventos del día.
   * Encabezado de fechas con tipografía `Fraunces`.

2. **Tablas de Gestión (TanStack Table):**
   * Encabezados de tabla con fondo `sand-deep/40`, texto `muted` en uppercase de 11px.
   * Filas intercaladas o hover suave con `hover:bg-sand-deep/20`.
   * Bordes inferiores de fila punteados o sutiles `border-b border-sand-border/60`.

3. **Gráficos y KPIs (Recharts):**
   * Colores de serie: `terracotta` (`#D9583B`), `cactus` (`#1EAD50`), y dorado arena.
   * Tooltips de gráfico estilizados con el contenedor `bg-card border-sand-border rounded-xl shadow-lg text-ink`.

4. **Reportes y Facturas PDF (jsPDF / PDFKit):**
   * Mantener los mismos colores corporativos: Encabezados en café tinta (`#2A2418`), acentos en terracota (`#D9583B`) y fondos de celda en marfil (`#FFFAF1`).

---

## 📌 6. Regla de Oro para el Desarrollo

> **"Antes de crear o modificar cualquier vista, formulario, tabla o widget en el sistema, consulta este archivo `GUIA_ESTILO_SISTEMA.md`. Nunca utilices colores neutros como gris puro (#6b7280), azul genérico (#3b82f6) o negro puro (#000000). Siempre utiliza los tokens marfil, tierra, terracota y cacto definidos."**

---

## 🏗️ 7. Arquitectura del Código por Funcionalidad (Modular)

El código del proyecto `prototipo-sistema-web` se organiza estrictamente **por funcionalidad/feature**:

* **`src/features/`**: Cada módulo de negocio vive en su propia carpeta aislada:
  - `src/features/auth/` (Login, gestión de sesiones)
  - `src/features/habitaciones/` (Piezas, estados, capacidad)
  - `src/features/clientes/` (Turistas, trabajadores de faena, empresas)
  - `src/features/reservas/` (FullCalendar, check-in, check-out)
  - `src/features/servicios-comida/` (Desayunos, almuerzos, cenas, colaciones)
  - `src/features/dashboard/` (KPIs, Recharts, reportes jsPDF)
  *Cada feature contiene sus componentes, hooks, servicios y tipos TypeScript de forma encapsulada.*

* **`src/shared/`**: Contiene elementos transversales compartidos:
  - `shared/components/` (Botones, Inputs, Modales con el diseño desértico)
  - `shared/lib/` (Instancias de Prisma `db.ts`, Supabase `supabase.ts`, utilidades PDF)
  - `shared/utils/` (Formateador de pesos CLP `$`, fechas en Chile, RUT)

* **`src/app/`**: Define únicamente las rutas, layouts y endpoints API de Next.js App Router, los cuales importan y ensamblan los módulos de `src/features/`.

