"use client";

import { useState, useEffect } from "react";
import { formatCLP } from "@/shared/utils/formatters";
import { 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Plus, 
  Save, 
  UserPlus, 
  UserMinus,
  UserCheck,
  Key, 
  Check, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldAlert,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Layers,
  UtensilsCrossed,
  Sliders,
  CreditCard,
  Building
} from "lucide-react";

// Default config schema
const DEFAULT_CONFIG = {
  pension: {
    nombreComercial: "Pensión Señora Myriam",
    descripcionCorta: "Hospedaje familiar con comida casera y colaciones para faena en Paposo.",
    direccion: "Caleta Paposo, Comuna de Taltal, Región de Antofagasta, Chile",
    localidadRegion: "Caleta Paposo, Región de Antofagasta",
    telefono: "+56 9 4019 9049",
    email: "contacto@pensionmyriam.cl",
    checkIn: "14:00",
    checkOut: "11:00",
    mensajeCorto: "Hospedaje familiar con comida casera y colaciones para faena."
  },
  usuarios: [
    { id: "u1", nombre: "Señora Myriam", email: "admin@pensionmyriam.cl", rol: "ADMIN", estado: "Activo" },
    { id: "u2", nombre: "Benjamin Troll", email: "staff@pensionmyriam.cl", rol: "STAFF", estado: "Activo" },
    { id: "u3", nombre: "Juan Pérez", email: "juan@pensionmyriam.cl", rol: "STAFF", estado: "Desactivado" }
  ],
  habitaciones: [
    { id: "h1", numero: "Pieza 1 — Vista Mar", capacidad: 2, precioBase: 25000, estado: "Disponible", equipamiento: ["Baño Privado", "Vista al Mar", "WiFi Faena"] },
    { id: "h2", numero: "Pieza 2 — Familiar", capacidad: 4, precioBase: 40000, estado: "Disponible", equipamiento: ["Baño Privado", "WiFi Faena"] },
    { id: "h3", numero: "Pieza 3 — Ejecutiva Faena", capacidad: 1, precioBase: 30000, estado: "Disponible", equipamiento: ["Baño Privado", "WiFi Faena", "TV Satelital"] },
    { id: "h4", numero: "Pieza 4 — Doble Paposo", capacidad: 2, precioBase: 28000, estado: "Disponible", equipamiento: ["WiFi Faena", "Entrada Independiente"] }
  ],
  clientes: {
    tipos: ["TURISTA", "TRABAJADOR_FAENA"],
    empresas: [
      { id: "emp1", nombre: "Minera Escondida", rut: "76.123.456-7", contacto: "Carlos Gómez (carlos@minera.cl)", observaciones: "Paga a fin de mes, requiere factura detallada." },
      { id: "emp2", nombre: "Obras viales del Norte", rut: "77.987.654-3", contacto: "María Rojas (mrojas@vialesnorte.cl)", observaciones: "Requiere colaciones dobles para el personal." }
    ]
  },
  alimentacion: {
    desayuno: { precio: 4000, descripcion: "Pan amasado recién hecho, huevos, café/té y jugos.", disponible: true },
    almuerzo: { precio: 6000, descripcion: "Almuerzo casero con sopa, plato de fondo y ensalada.", disponible: true },
    cena: { precio: 8000, descripcion: "Guisos caseros, pescado del día o pastel de choclo.", disponible: true },
    colacionSimple: { precio: 4000, descripcion: "Colación simple para llevar a la faena.", disponible: true },
    colacionCompleta: { precio: 6000, descripcion: "Colación completa premium para llevar a la faena.", disponible: true },
    horarios: {
      desayuno: "08:00–09:30",
      almuerzo: "13:00–15:00",
      cena: "20:00–21:30"
    }
  },
  reglas: {
    ventanaFechas: 24, // horas
    ventanaComida: 4, // horas
    politicaCancelacion: "Sin costo hasta 24h",
    capacidadMaxima: 8
  },
  pagos: {
    metodos: ["Efectivo", "Transferencia", "Cuenta empresa"],
    transferencia: {
      titular: "Myriam Pastora",
      rut: "8.123.456-7",
      banco: "Banco del Estado",
      tipoCuenta: "Cuenta RUT (Vista)",
      numeroCuenta: "8123456",
      correo: "comprobantes@pensionmyriam.cl"
    },
    plantillas: {
      logoUrl: "",
      encabezado: "Comprobante de Reserva – Pensión Señora Myriam",
      pie: "Pagos por transferencia a la cuenta indicada. Reservas sujetas a confirmación.",
      emailAsunto: "Reserva Recibida - Pensión Señora Myriam",
      emailCuerpo: "Hola {nombre},\n\nHemos recibido tu solicitud de reserva para las fechas {checkIn} al {checkOut}. Se encuentra sujeta a confirmación contra transferencia.\n\nAtentamente,\nPensión Señora Myriam"
    }
  }
};

export function AdminConfiguracionView() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>("pension");
  const [successSection, setSuccessSection] = useState<string | null>(null);

  // --- 1. Pensión state ---
  const [nombreComercial, setNombreComercial] = useState("");
  const [descripcionCorta, setDescripcionCorta] = useState("");
  const [direccion, setDireccion] = useState("");
  const [localidadRegion, setLocalidadRegion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [emailContacto, setEmailContacto] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [mensajeCorto, setMensajeCorto] = useState("");

  // --- 2. Usuarios state ---
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [newUserNombre, setNewUserNombre] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRol, setNewUserRol] = useState("STAFF");
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // --- 3. Habitaciones & Tarifas state ---
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [newRoomNumero, setNewRoomNumero] = useState("");
  const [newRoomCapacidad, setNewRoomCapacidad] = useState(2);
  const [newRoomPrecio, setNewRoomPrecio] = useState(25000);
  const [newRoomEquipamiento, setNewRoomEquipamiento] = useState<string[]>([]);
  const [newRoomEstado, setNewRoomEstado] = useState("Disponible");
  const [editingRoom, setEditingRoom] = useState<any | null>(null);

  const [tarifaDiferenciada, setTarifaDiferenciada] = useState(false);
  const [temporadaAltaBaja, setTemporadaAltaBaja] = useState(false);

  // --- 4. Clientes & Empresas state ---
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [newEmpNombre, setNewEmpNombre] = useState("");
  const [newEmpRut, setNewEmpRut] = useState("");
  const [newEmpContacto, setNewEmpContacto] = useState("");
  const [newEmpObs, setNewEmpObs] = useState("");
  const [editingEmpresa, setEditingEmpresa] = useState<any | null>(null);

  // --- 5. Alimentación state ---
  const [precioDesayuno, setPrecioDesayuno] = useState(4000);
  const [descDesayuno, setDescDesayuno] = useState("");
  const [dispDesayuno, setDispDesayuno] = useState(true);

  const [precioAlmuerzo, setPrecioAlmuerzo] = useState(6000);
  const [descAlmuerzo, setDescAlmuerzo] = useState("");
  const [dispAlmuerzo, setDispAlmuerzo] = useState(true);

  const [precioCena, setPrecioCena] = useState(8000);
  const [descCena, setDescCena] = useState("");
  const [dispCena, setDispCena] = useState(true);

  const [precioColacionSimple, setPrecioColacionSimple] = useState(4000);
  const [precioColacionCompleta, setPrecioColacionCompleta] = useState(6000);

  const [horarioDesayuno, setHorarioDesayuno] = useState("");
  const [horarioAlmuerzo, setHorarioAlmuerzo] = useState("");
  const [horarioCena, setHorarioCena] = useState("");

  // --- 6. Reglas de Negocio state ---
  const [ventanaFechas, setVentanaFechas] = useState(24);
  const [ventanaComida, setVentanaComida] = useState(4);
  const [politicaCancelacion, setPoliticaCancelacion] = useState("Sin costo hasta 24h");
  const [capacidadMaxima, setCapacidadMaxima] = useState(8);

  // --- 7. Pagos & Documentos state ---
  const [metodosPago, setMetodosPago] = useState<string[]>([]);
  const [transfTitular, setTransfTitular] = useState("");
  const [transfRut, setTransfRut] = useState("");
  const [transfBanco, setTransfBanco] = useState("");
  const [transfTipoCuenta, setTransfTipoCuenta] = useState("");
  const [transfNumeroCuenta, setTransfNumeroCuenta] = useState("");
  const [transfCorreo, setTransfCorreo] = useState("");

  const [docLogoUrl, setDocLogoUrl] = useState("");
  const [docEncabezado, setDocEncabezado] = useState("");
  const [docPie, setDocPie] = useState("");
  const [emailAsunto, setEmailAsunto] = useState("");
  const [emailCuerpo, setEmailCuerpo] = useState("");

  // --- 8. Cuenta & Seguridad (Contraseña) state ---
  const [adminEmail, setAdminEmail] = useState("admin@pensionmyriam.cl");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityMessage, setSecurityMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("pension_config");
    let config = DEFAULT_CONFIG;
    if (stored) {
      try {
        config = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      } catch (e) {
        console.error("Error parsing stored config, using defaults", e);
      }
    }

    // Initialize all states
    setNombreComercial(config.pension.nombreComercial);
    setDescripcionCorta(config.pension.descripcionCorta);
    setDireccion(config.pension.direccion);
    setLocalidadRegion(config.pension.localidadRegion);
    setTelefono(config.pension.telefono);
    setEmailContacto(config.pension.email);
    setCheckIn(config.pension.checkIn);
    setCheckOut(config.pension.checkOut);
    setMensajeCorto(config.pension.mensajeCorto);

    setUsuarios(config.usuarios);
    setHabitaciones(config.habitaciones);
    setEmpresas(config.clientes.empresas);

    setPrecioDesayuno(config.alimentacion.desayuno.precio);
    setDescDesayuno(config.alimentacion.desayuno.descripcion);
    setDispDesayuno(config.alimentacion.desayuno.disponible);

    setPrecioAlmuerzo(config.alimentacion.almuerzo.precio);
    setDescAlmuerzo(config.alimentacion.almuerzo.descripcion);
    setDispAlmuerzo(config.alimentacion.almuerzo.disponible);

    setPrecioCena(config.alimentacion.cena.precio);
    setDescCena(config.alimentacion.cena.descripcion);
    setDispCena(config.alimentacion.cena.disponible);

    setPrecioColacionSimple(config.alimentacion.colacionSimple.precio);
    setPrecioColacionCompleta(config.alimentacion.colacionCompleta.precio);

    setHorarioDesayuno(config.alimentacion.horarios.desayuno);
    setHorarioAlmuerzo(config.alimentacion.horarios.almuerzo);
    setHorarioCena(config.alimentacion.horarios.cena);

    setVentanaFechas(config.reglas.ventanaFechas);
    setVentanaComida(config.reglas.ventanaComida);
    setPoliticaCancelacion(config.reglas.politicaCancelacion);
    setCapacidadMaxima(config.reglas.capacidadMaxima);

    setMetodosPago(config.pagos.metodos);
    setTransfTitular(config.pagos.transferencia.titular);
    setTransfRut(config.pagos.transferencia.rut);
    setTransfBanco(config.pagos.transferencia.banco);
    setTransfTipoCuenta(config.pagos.transferencia.tipoCuenta);
    setTransfNumeroCuenta(config.pagos.transferencia.numeroCuenta);
    setTransfCorreo(config.pagos.transferencia.correo);

    setDocLogoUrl(config.pagos.plantillas.logoUrl);
    setDocEncabezado(config.pagos.plantillas.encabezado);
    setDocPie(config.pagos.plantillas.pie);
    setEmailAsunto(config.pagos.plantillas.emailAsunto);
    setEmailCuerpo(config.pagos.plantillas.emailCuerpo);

    setIsLoaded(true);
  }, []);

  // Save specific section helper
  const saveSection = (sectionName: string, updatedConfigData: any) => {
    const stored = localStorage.getItem("pension_config");
    let currentConfig = DEFAULT_CONFIG;
    if (stored) {
      try {
        currentConfig = JSON.parse(stored);
      } catch (e) {}
    }

    const newConfig = {
      ...currentConfig,
      ...updatedConfigData
    };

    localStorage.setItem("pension_config", JSON.stringify(newConfig));
    triggerSuccessMessage(sectionName);
  };

  const triggerSuccessMessage = (sectionName: string) => {
    setSuccessSection(sectionName);
    setTimeout(() => {
      setSuccessSection(null);
    }, 4000);
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  // --- Action handlers ---
  const handleSavePension = (e: React.FormEvent) => {
    e.preventDefault();
    saveSection("pension", {
      pension: {
        nombreComercial,
        descripcionCorta,
        direccion,
        localidadRegion,
        telefono,
        email: emailContacto,
        checkIn,
        checkOut,
        mensajeCorto
      }
    });
  };

  const handleSaveUsuarios = (e: React.FormEvent) => {
    e.preventDefault();
    saveSection("usuarios", { usuarios });
  };

  const handleCreateUser = () => {
    if (!newUserNombre || !newUserEmail) return;
    const newU = {
      id: "u_" + Date.now(),
      nombre: newUserNombre,
      email: newUserEmail,
      rol: newUserRol,
      estado: "Activo"
    };
    const updated = [...usuarios, newU];
    setUsuarios(updated);
    setNewUserNombre("");
    setNewUserEmail("");
    // Persist immediately in memory
    saveSection("usuarios", { usuarios: updated });
  };

  const handleToggleUserStatus = (id: string) => {
    const updated = usuarios.map(u => {
      if (u.id === id) {
        return { ...u, estado: u.estado === "Activo" ? "Desactivado" : "Activo" };
      }
      return u;
    });
    setUsuarios(updated);
    saveSection("usuarios", { usuarios: updated });
  };

  const handleSaveHabitaciones = (e: React.FormEvent) => {
    e.preventDefault();
    saveSection("habitaciones", { habitaciones });
  };

  const handleCreateRoom = () => {
    if (!newRoomNumero || !newRoomPrecio) return;
    const newH = {
      id: "h_" + Date.now(),
      numero: newRoomNumero,
      capacidad: newRoomCapacidad,
      precioBase: Number(newRoomPrecio),
      estado: newRoomEstado,
      equipamiento: newRoomEquipamiento
    };
    const updated = [...habitaciones, newH];
    setHabitaciones(updated);
    setNewRoomNumero("");
    setNewRoomCapacidad(2);
    setNewRoomPrecio(25000);
    setNewRoomEquipamiento([]);
    setNewRoomEstado("Disponible");
    saveSection("habitaciones", { habitaciones: updated });
  };

  const handleToggleRoomStatus = (id: string) => {
    const updated = habitaciones.map(h => {
      if (h.id === id) {
        return { ...h, estado: h.estado === "Disponible" ? "Mantenimiento" : "Disponible" };
      }
      return h;
    });
    setHabitaciones(updated);
    saveSection("habitaciones", { habitaciones: updated });
  };

  const handleRetirarRoom = (id: string) => {
    const updated = habitaciones.map(h => {
      if (h.id === id) {
        return { ...h, estado: "De Baja" };
      }
      return h;
    });
    setHabitaciones(updated);
    saveSection("habitaciones", { habitaciones: updated });
  };

  const toggleEquipamiento = (item: string) => {
    if (newRoomEquipamiento.includes(item)) {
      setNewRoomEquipamiento(newRoomEquipamiento.filter(x => x !== item));
    } else {
      setNewRoomEquipamiento([...newRoomEquipamiento, item]);
    }
  };

  const handleSaveClientesEmpresas = (e: React.FormEvent) => {
    e.preventDefault();
    saveSection("clientes", {
      clientes: {
        tipos: ["TURISTA", "TRABAJADOR_FAENA"],
        empresas
      }
    });
  };

  const handleCreateEmpresa = () => {
    if (!newEmpNombre || !newEmpRut) return;
    const newE = {
      id: "emp_" + Date.now(),
      nombre: newEmpNombre,
      rut: newEmpRut,
      contacto: newEmpContacto,
      observaciones: newEmpObs,
      activo: true
    };
    const updated = [...empresas, newE];
    setEmpresas(updated);
    setNewEmpNombre("");
    setNewEmpRut("");
    setNewEmpContacto("");
    setNewEmpObs("");
    saveSection("clientes", {
      clientes: {
        tipos: ["TURISTA", "TRABAJADOR_FAENA"],
        empresas: updated
      }
    });
  };

  const handleToggleEmpresa = (id: string) => {
    const updated = empresas.map(emp => {
      if (emp.id === id) {
        return { ...emp, activo: emp.activo === false ? true : false };
      }
      return emp;
    });
    setEmpresas(updated);
    saveSection("clientes", {
      clientes: {
        tipos: ["TURISTA", "TRABAJADOR_FAENA"],
        empresas: updated
      }
    });
  };

  const handleSaveAlimentacion = (e: React.FormEvent) => {
    e.preventDefault();
    saveSection("alimentacion", {
      alimentacion: {
        desayuno: { precio: Number(precioDesayuno), descripcion: descDesayuno, disponible: dispDesayuno },
        almuerzo: { precio: Number(precioAlmuerzo), descripcion: descAlmuerzo, disponible: dispAlmuerzo },
        cena: { precio: Number(precioCena), descripcion: descCena, disponible: dispCena },
        colacionSimple: { precio: Number(precioColacionSimple), descripcion: "Colación simple para llevar a la faena.", disponible: true },
        colacionCompleta: { precio: Number(precioColacionCompleta), descripcion: "Colación completa premium para llevar a la faena.", disponible: true },
        horarios: {
          desayuno: horarioDesayuno,
          almuerzo: horarioAlmuerzo,
          cena: horarioCena
        }
      }
    });
  };

  const handleSaveReglas = (e: React.FormEvent) => {
    e.preventDefault();
    saveSection("reglas", {
      reglas: {
        ventanaFechas: Number(ventanaFechas),
        ventanaComida: Number(ventanaComida),
        politicaCancelacion,
        capacidadMaxima: Number(capacidadMaxima)
      }
    });
  };

  const handleSavePagos = (e: React.FormEvent) => {
    e.preventDefault();
    saveSection("pagos", {
      pagos: {
        metodos: metodosPago,
        transferencia: {
          titular: transfTitular,
          rut: transfRut,
          banco: transfBanco,
          tipoCuenta: transfTipoCuenta,
          numeroCuenta: transfNumeroCuenta,
          correo: transfCorreo
        },
        plantillas: {
          logoUrl: docLogoUrl,
          encabezado: docEncabezado,
          pie: docPie,
          emailAsunto,
          emailCuerpo
        }
      }
    });
  };

  const toggleMetodoPago = (metodo: string) => {
    if (metodosPago.includes(metodo)) {
      setMetodosPago(metodosPago.filter(m => m !== metodo));
    } else {
      setMetodosPago([...metodosPago, metodo]);
    }
  };

  const handleUpdateSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setSecurityMessage({ text: "Debes ingresar tu contraseña actual.", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityMessage({ text: "La nueva contraseña y su confirmación no coinciden.", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setSecurityMessage({ text: "La nueva contraseña debe tener al menos 6 caracteres.", type: "error" });
      return;
    }

    setSecurityMessage({ text: "¡Contraseña actualizada con éxito en la cuenta!", type: "success" });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSecurityMessage(null), 4000);
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-terracotta border-sand-border animate-spin"></div>
        <p className="font-serif text-ink text-sm">Cargando módulo de ajustes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-sand-border rounded-3xl p-6 shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-terracotta bg-terracotta/10 px-3 py-1 rounded-full">
            <span>⚙️</span> Ajustes Globales
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-ink mt-2">
            Configuración del Sistema
          </h1>
          <p className="text-muted text-xs md:text-sm mt-1">
            Personaliza el comportamiento, tarifas de comida, reglas y datos públicos del portal.
          </p>
        </div>
        <span className="text-xs text-cactus bg-cactus/15 border border-cactus/20 px-3.5 py-1.5 rounded-full font-bold self-start md:self-auto">
          🟢 Sesión: Administrador
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* COLUMNA PRINCIPAL - ACORDEÓN */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* SECCIÓN 1: PENSION */}
          <div className="bg-card border border-sand-border rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("pension")}
              className="w-full flex items-center justify-between p-5 text-left border-b border-sand-border/50 hover:bg-sand-deep/15 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🏠</span>
                <div>
                  <h3 className="font-serif font-bold text-base text-ink font-semibold">Pensión</h3>
                  <p className="text-[11px] text-muted">Nombre comercial, dirección y horarios oficiales de check-in/out.</p>
                </div>
              </div>
              {activeSection === "pension" ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
            </button>

            {activeSection === "pension" && (
              <form onSubmit={handleSavePension} className="p-5 space-y-4 text-xs">
                {successSection === "pension" && (
                  <div className="p-3 bg-cactus/10 border border-cactus/20 text-cactus rounded-xl font-medium animate-fade-in">
                    ✅ Cambios guardados. Estos datos se mostrarán en el portal del huésped y en los comprobantes.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-muted mb-1">Nombre Comercial</label>
                    <input
                      type="text"
                      required
                      value={nombreComercial}
                      onChange={(e) => setNombreComercial(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-ink font-medium outline-none focus:ring-2 focus:ring-terracotta"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-muted mb-1">Teléfono Principal (WhatsApp)</label>
                    <input
                      type="text"
                      required
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-ink font-medium outline-none focus:ring-2 focus:ring-terracotta"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-muted mb-1">Descripción Corta (para la web)</label>
                    <textarea
                      rows={2}
                      value={descripcionCorta}
                      onChange={(e) => setDescripcionCorta(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-ink font-medium outline-none focus:ring-2 focus:ring-terracotta resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-muted mb-1">Dirección Física (Búsqueda en Google Maps)</label>
                    <input
                      type="text"
                      required
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-ink font-medium outline-none focus:ring-2 focus:ring-terracotta"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-muted mb-1">Localidad / Región</label>
                    <input
                      type="text"
                      required
                      value={localidadRegion}
                      onChange={(e) => setLocalidadRegion(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-ink font-medium outline-none focus:ring-2 focus:ring-terracotta"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-muted mb-1">Correo Electrónico de Contacto</label>
                    <input
                      type="email"
                      required
                      value={emailContacto}
                      onChange={(e) => setEmailContacto(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-ink font-medium outline-none focus:ring-2 focus:ring-terracotta"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-muted mb-1">Horario Entrada (Check‑in)</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. 14:00"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-ink font-medium outline-none focus:ring-2 focus:ring-terracotta"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-muted mb-1">Horario Salida (Check‑out)</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. 11:00"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-ink font-medium outline-none focus:ring-2 focus:ring-terracotta"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-muted mb-1">Mensaje Informativo Comprobantes</label>
                    <input
                      type="text"
                      value={mensajeCorto}
                      onChange={(e) => setMensajeCorto(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-ink font-medium outline-none focus:ring-2 focus:ring-terracotta"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-terracotta hover:bg-terracotta-deep text-white font-semibold rounded-full px-5 py-2.5 transition-all inline-flex items-center gap-1.5 shadow-sm hover:cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Guardar cambios
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* SECCIÓN 2: USUARIOS & ACCESO */}
          <div className="bg-card border border-sand-border rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("usuarios")}
              className="w-full flex items-center justify-between p-5 text-left border-b border-sand-border/50 hover:bg-sand-deep/15 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🔑</span>
                <div>
                  <h3 className="font-serif font-bold text-base text-ink font-semibold">Usuarios & Acceso</h3>
                  <p className="text-[11px] text-muted">Gestión de personal del sistema con control de acceso (RBAC).</p>
                </div>
              </div>
              {activeSection === "usuarios" ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
            </button>

            {activeSection === "usuarios" && (
              <div className="p-5 space-y-6 text-xs">
                {successSection === "usuarios" && (
                  <div className="p-3 bg-cactus/10 border border-cactus/20 text-cactus rounded-xl font-medium animate-fade-in">
                    ✅ Usuarios actualizados correctamente.
                  </div>
                )}

                {/* Listado en una sola columna para evitar tablas densas */}
                <div className="space-y-2">
                  <h4 className="font-bold text-ink border-b border-sand-border/50 pb-1 mb-2">Personal Autorizado</h4>
                  {usuarios.map((u) => (
                    <div
                      key={u.id}
                      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 rounded-xl border border-sand-border ${
                        u.estado === "Activo" ? "bg-white" : "bg-sand-deep/20 opacity-70"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-ink text-sm flex items-center gap-2">
                          {u.nombre}
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            u.rol === "ADMIN" ? "bg-terracotta/10 text-terracotta" : "bg-muted/15 text-muted"
                          }`}>
                            {u.rol}
                          </span>
                        </div>
                        <div className="text-muted text-[10px]">{u.email}</div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.estado === "Activo" ? "text-cactus bg-cactus/10" : "text-red-700 bg-red-50"
                        }`}>
                          {u.estado}
                        </span>

                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`p-1.5 rounded-lg border transition-colors hover:cursor-pointer ${
                            u.estado === "Activo" 
                              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" 
                              : "bg-cactus/10 text-cactus border-cactus/20 hover:bg-cactus/20"
                          }`}
                          title={u.estado === "Activo" ? "Desactivar usuario" : "Activar usuario"}
                        >
                          {u.estado === "Activo" ? <UserMinus className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Formulario de creación */}
                <div className="bg-sand-deep/20 border border-sand-border p-4 rounded-xl space-y-3">
                  <h4 className="font-bold text-ink flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-terracotta" /> Agregar Nuevo Usuario
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-muted mb-0.5">Nombre Completo</label>
                      <input
                        type="text"
                        placeholder="Ej. Benjamin Troll"
                        value={newUserNombre}
                        onChange={(e) => setNewUserNombre(e.target.value)}
                        className="w-full p-2 rounded-lg border border-sand-border bg-white text-ink outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-muted mb-0.5">Correo Electrónico</label>
                      <input
                        type="email"
                        placeholder="ejemplo@pensionmyriam.cl"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="w-full p-2 rounded-lg border border-sand-border bg-white text-ink outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-muted mb-0.5">Rol asignado</label>
                      <select
                        value={newUserRol}
                        onChange={(e) => setNewUserRol(e.target.value)}
                        className="w-full p-2 rounded-lg border border-sand-border bg-white text-ink outline-none"
                      >
                        <option value="STAFF">STAFF (Personal)</option>
                        <option value="ADMIN">ADMIN (Administrador)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleCreateUser}
                      className="bg-terracotta hover:bg-terracotta-deep text-white font-semibold rounded-lg px-4 py-2 transition-colors flex items-center gap-1.5 hover:cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Enviar enlace de activación
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECCIÓN 3: HABITACIONES & TARIFAS */}
          <div className="bg-card border border-sand-border rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("habitaciones")}
              className="w-full flex items-center justify-between p-5 text-left border-b border-sand-border/50 hover:bg-sand-deep/15 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🛌</span>
                <div>
                  <h3 className="font-serif font-bold text-base text-ink font-semibold">Habitaciones & Tarifas</h3>
                  <p className="text-[11px] text-muted">Ajusta capacidades, equipamientos y precios base de las piezas.</p>
                </div>
              </div>
              {activeSection === "habitaciones" ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
            </button>

            {activeSection === "habitaciones" && (
              <form onSubmit={handleSaveHabitaciones} className="p-5 space-y-6 text-xs">
                {successSection === "habitaciones" && (
                  <div className="p-3 bg-cactus/10 border border-cactus/20 text-cactus rounded-xl font-medium animate-fade-in">
                    ✅ Habitaciones y precios guardados con éxito.
                  </div>
                )}

                {/* Habitaciones list */}
                <div className="space-y-3">
                  <h4 className="font-bold text-ink border-b border-sand-border/50 pb-1">Distribución de Camas</h4>
                  <div className="space-y-2">
                    {habitaciones.map((h) => (
                      <div
                        key={h.id}
                        className={`p-3 rounded-xl border border-sand-border bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                          h.estado === "De Baja" ? "bg-red-50/10 opacity-50" : ""
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="font-serif font-bold text-ink text-sm flex items-center gap-2">
                            {h.numero}
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                              h.estado === "Disponible" ? "bg-cactus/10 text-cactus" : "bg-red-50 text-red-700"
                            }`}>
                              {h.estado}
                            </span>
                          </div>
                          <div className="text-muted text-[10px] flex flex-wrap gap-2">
                            <span>👥 Capacidad: {h.capacidad} {h.capacidad === 1 ? "persona" : "personas"}</span>
                            <span>•</span>
                            <span className="font-bold text-terracotta">{formatCLP(h.precioBase)} / noche</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {h.equipamiento.map((eq: string, idx: number) => (
                              <span key={idx} className="bg-sand-deep/40 text-[9px] px-1.5 py-0.5 rounded border border-sand-border/60">
                                {eq}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {h.estado !== "De Baja" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleRoomStatus(h.id)}
                                className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold hover:cursor-pointer ${
                                  h.estado === "Disponible" 
                                    ? "bg-sand-deep/20 text-muted border-sand-border hover:bg-sand-deep/50" 
                                    : "bg-cactus/15 text-cactus border-cactus/25 hover:bg-cactus/25"
                                }`}
                              >
                                {h.estado === "Disponible" ? "🔧 Mantenimiento" : "✅ Habilitar"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRetirarRoom(h.id)}
                                className="p-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-lg hover:cursor-pointer"
                                title="Dar de baja de forma histórica"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {h.estado === "De Baja" && (
                            <span className="text-[10px] text-red-700 bg-red-100 border border-red-200 px-2 py-1 rounded-lg font-bold">🚫 De Baja Histórica</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formulario Nueva Habitación */}
                <div className="bg-sand-deep/20 border border-sand-border p-4 rounded-xl space-y-3">
                  <h4 className="font-bold text-ink flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-terracotta" /> Agregar Nueva Habitación
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-muted mb-0.5">Nombre / Número de Habitación</label>
                      <input
                        type="text"
                        placeholder="Ej. Pieza 5 — Matrimonial"
                        value={newRoomNumero}
                        onChange={(e) => setNewRoomNumero(e.target.value)}
                        className="w-full p-2 rounded-lg border border-sand-border bg-white text-ink outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-muted mb-0.5">Capacidad (camas)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={newRoomCapacidad}
                        onChange={(e) => setNewRoomCapacidad(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-sand-border bg-white text-ink outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-muted mb-0.5">Precio Base por noche ($ CLP)</label>
                      <input
                        type="number"
                        placeholder="25000"
                        value={newRoomPrecio}
                        onChange={(e) => setNewRoomPrecio(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-sand-border bg-white text-ink outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-muted mb-0.5">Estado Inicial</label>
                      <select
                        value={newRoomEstado}
                        onChange={(e) => setNewRoomEstado(e.target.value)}
                        className="w-full p-2 rounded-lg border border-sand-border bg-white text-ink outline-none"
                      >
                        <option value="Disponible">Disponible</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                      </select>
                    </div>
                  </div>

                  {/* Checkboxes de Equipamiento */}
                  <div>
                    <label className="block font-bold text-muted mb-1">Equipamiento Incluido</label>
                    <div className="flex flex-wrap gap-3">
                      {["Baño Privado", "Vista al Mar", "WiFi Faena", "TV Satelital", "Entrada Independiente"].map((item) => (
                        <label key={item} className="inline-flex items-center gap-1.5 font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newRoomEquipamiento.includes(item)}
                            onChange={() => toggleEquipamiento(item)}
                            className="rounded border-sand-border text-terracotta focus:ring-terracotta"
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleCreateRoom}
                      className="bg-terracotta hover:bg-terracotta-deep text-white font-semibold rounded-lg px-4 py-2 transition-colors flex items-center gap-1.5 hover:cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar pieza
                    </button>
                  </div>
                </div>

                {/* Ajustes de Tarifas Extras */}
                <div className="border-t border-sand-border/50 pt-4 space-y-2">
                  <h4 className="font-bold text-ink">Estructuras de Tarifas Adicionales</h4>
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tarifaDiferenciada}
                        onChange={(e) => setTarifaDiferenciada(e.target.checked)}
                        className="rounded border-sand-border text-terracotta"
                      />
                      <div>
                        <span className="font-semibold">Habilitar tarifas diferenciadas por tipo de cliente</span>
                        <p className="text-[10px] text-muted">Permite definir un precio distinto para Trabajadores de Faena vs Turistas.</p>
                      </div>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={temporadaAltaBaja}
                        onChange={(e) => setTemporadaAltaBaja(e.target.checked)}
                        className="rounded border-sand-border text-terracotta"
                      />
                      <div>
                        <span className="font-semibold">Habilitar tarifas por temporada alta/baja</span>
                        <p className="text-[10px] text-muted">Permite configurar recargos automáticos en fines de semana o meses festivos.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-terracotta hover:bg-terracotta-deep text-white font-semibold rounded-full px-5 py-2.5 transition-all inline-flex items-center gap-1.5 shadow-sm hover:cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Guardar tarifas
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* SECCIÓN 4: CLIENTES & EMPRESAS */}
          <div className="bg-card border border-sand-border rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("clientes")}
              className="w-full flex items-center justify-between p-5 text-left border-b border-sand-border/50 hover:bg-sand-deep/15 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">👥</span>
                <div>
                  <h3 className="font-serif font-bold text-base text-ink font-semibold">Clientes & Empresas</h3>
                  <p className="text-[11px] text-muted">Registra y segmenta empresas de faena para facturación consolidada.</p>
                </div>
              </div>
              {activeSection === "clientes" ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
            </button>

            {activeSection === "clientes" && (
              <form onSubmit={handleSaveClientesEmpresas} className="p-5 space-y-6 text-xs">
                {successSection === "clientes" && (
                  <div className="p-3 bg-cactus/10 border border-cactus/20 text-cactus rounded-xl font-medium animate-fade-in">
                    ✅ Datos de clientes y empresas guardados correctamente.
                  </div>
                )}

                {/* Segmentación */}
                <div>
                  <h4 className="font-bold text-ink border-b border-sand-border/50 pb-1 mb-2">Tipos de Clientes Configurados</h4>
                  <div className="flex gap-2">
                    <span className="bg-card border border-sand-border text-ink px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
                      👤 TURISTA
                    </span>
                    <span className="bg-card border border-sand-border text-ink px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
                      👷 TRABAJADOR_FAENA
                    </span>
                  </div>
                  <p className="text-[10px] text-muted mt-1">Estos tipos se utilizan para segmentar los gráficos del dashboard y filtrar colaciones.</p>
                </div>

                {/* Listado de empresas */}
                <div className="space-y-3">
                  <h4 className="font-bold text-ink border-b border-sand-border/50 pb-1">Cuentas Corrientes de Empresas</h4>
                  <div className="space-y-2">
                    {empresas.map((emp) => (
                      <div
                        key={emp.id}
                        className={`p-3 rounded-xl border border-sand-border bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                          emp.activo === false ? "opacity-60 bg-sand-deep/10" : ""
                        }`}
                      >
                        <div>
                          <div className="font-serif font-bold text-ink text-sm flex items-center gap-2">
                            {emp.nombre}
                            <span className="text-[10px] text-muted font-normal font-sans">RUT: {emp.rut}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                              emp.activo !== false ? "bg-cactus/10 text-cactus" : "bg-red-50 text-red-700"
                            }`}>
                              {emp.activo !== false ? "Vigente" : "Inactiva"}
                            </span>
                          </div>
                          <div className="text-muted text-[10px] mt-0.5">📞 Contacto: {emp.contacto}</div>
                          {emp.observaciones && (
                            <div className="text-muted text-[10px] italic mt-1 bg-sand-deep/20 px-2 py-1 rounded">
                              📝 Nota: {emp.observaciones}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleEmpresa(emp.id)}
                          className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold hover:cursor-pointer ${
                            emp.activo !== false 
                              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" 
                              : "bg-cactus/15 text-cactus border-cactus/25 hover:bg-cactus/25"
                          }`}
                        >
                          {emp.activo !== false ? "Desactivar" : "Reactivar"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formulario Nueva Empresa */}
                <div className="bg-sand-deep/20 border border-sand-border p-4 rounded-xl space-y-3">
                  <h4 className="font-bold text-ink flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-terracotta" /> Registrar Nueva Empresa
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-muted mb-0.5">Nombre de la Empresa</label>
                      <input
                        type="text"
                        placeholder="Ej. Constructora del Norte"
                        value={newEmpNombre}
                        onChange={(e) => setNewEmpNombre(e.target.value)}
                        className="w-full p-2 rounded-lg border border-sand-border bg-white text-ink outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-muted mb-0.5">RUT Empresa</label>
                      <input
                        type="text"
                        placeholder="76.000.000-0"
                        value={newEmpRut}
                        onChange={(e) => setNewEmpRut(e.target.value)}
                        className="w-full p-2 rounded-lg border border-sand-border bg-white text-ink outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-muted mb-0.5">Persona de Contacto (Nombre, Correo, Fono)</label>
                      <input
                        type="text"
                        placeholder="Juanito Pérez (juan@empresa.com) +569123456"
                        value={newEmpContacto}
                        onChange={(e) => setNewEmpContacto(e.target.value)}
                        className="w-full p-2 rounded-lg border border-sand-border bg-white text-ink outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-muted mb-0.5">Observaciones de Facturación</label>
                      <input
                        type="text"
                        placeholder="Ej. Paga a 30 días, requiere orden de compra."
                        value={newEmpObs}
                        onChange={(e) => setNewEmpObs(e.target.value)}
                        className="w-full p-2 rounded-lg border border-sand-border bg-white text-ink outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleCreateEmpresa}
                      className="bg-terracotta hover:bg-terracotta-deep text-white font-semibold rounded-lg px-4 py-2 transition-colors flex items-center gap-1.5 hover:cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar empresa
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-terracotta hover:bg-terracotta-deep text-white font-semibold rounded-full px-5 py-2.5 transition-all inline-flex items-center gap-1.5 shadow-sm hover:cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Guardar empresas
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* SECCIÓN 5: ALIMENTACIÓN */}
          <div className="bg-card border border-sand-border rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("alimentacion")}
              className="w-full flex items-center justify-between p-5 text-left border-b border-sand-border/50 hover:bg-sand-deep/15 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🍽️</span>
                <div>
                  <h3 className="font-serif font-bold text-base text-ink font-semibold">Alimentación</h3>
                  <p className="text-[11px] text-muted">Precios base de viandas, colaciones y horarios de comedor diario.</p>
                </div>
              </div>
              {activeSection === "alimentacion" ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
            </button>

            {activeSection === "alimentacion" && (
              <form onSubmit={handleSaveAlimentacion} className="p-5 space-y-6 text-xs">
                {successSection === "alimentacion" && (
                  <div className="p-3 bg-cactus/10 border border-cactus/20 text-cactus rounded-xl font-medium animate-fade-in">
                    ✅ Precios y horarios de alimentación actualizados correctamente.
                  </div>
                )}

                {/* Planes de comida */}
                <div className="space-y-4">
                  <h4 className="font-bold text-ink border-b border-sand-border/50 pb-1">Estructura de Tarifas y Servicios</h4>
                  
                  <div className="space-y-3">
                    {/* Desayuno */}
                    <div className="p-3 bg-white rounded-xl border border-sand-border grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                      <div className="font-semibold text-ink sm:col-span-1">🥐 Desayuno Casero</div>
                      <div className="grid grid-cols-3 gap-2 sm:col-span-3">
                        <div className="col-span-1">
                          <label className="block text-[10px] text-muted mb-0.5">Precio ($ CLP)</label>
                          <input
                            type="number"
                            value={precioDesayuno}
                            onChange={(e) => setPrecioDesayuno(Number(e.target.value))}
                            className="w-full p-2 border border-sand-border rounded-lg outline-none bg-white text-ink font-bold"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-between gap-2">
                          <div>
                            <label className="block text-[10px] text-muted mb-0.5">¿Habilitar en portal?</label>
                            <label className="inline-flex items-center gap-1.5 cursor-pointer mt-1">
                              <input
                                type="checkbox"
                                checked={dispDesayuno}
                                onChange={(e) => setDispDesayuno(e.target.checked)}
                                className="rounded border-sand-border text-terracotta"
                              />
                              <span className="font-bold">{dispDesayuno ? "Sí" : "No"}</span>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] text-muted mb-0.5">Descripción en la minuta</label>
                        <input
                          type="text"
                          value={descDesayuno}
                          onChange={(e) => setDescDesayuno(e.target.value)}
                          className="w-full p-2 border border-sand-border rounded-lg outline-none bg-white text-ink"
                        />
                      </div>
                    </div>

                    {/* Almuerzo */}
                    <div className="p-3 bg-white rounded-xl border border-sand-border grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                      <div className="font-semibold text-ink sm:col-span-1">🍲 Almuerzo Tradicional</div>
                      <div className="grid grid-cols-3 gap-2 sm:col-span-3">
                        <div>
                          <label className="block text-[10px] text-muted mb-0.5">Precio ($ CLP)</label>
                          <input
                            type="number"
                            value={precioAlmuerzo}
                            onChange={(e) => setPrecioAlmuerzo(Number(e.target.value))}
                            className="w-full p-2 border border-sand-border rounded-lg outline-none bg-white text-ink font-bold"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] text-muted mb-0.5">¿Habilitar?</label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer mt-1">
                            <input
                              type="checkbox"
                              checked={dispAlmuerzo}
                              onChange={(e) => setDispAlmuerzo(e.target.checked)}
                              className="rounded border-sand-border text-terracotta"
                            />
                            <span className="font-bold">{dispAlmuerzo ? "Sí" : "No"}</span>
                          </label>
                        </div>
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] text-muted mb-0.5">Descripción en la minuta</label>
                        <input
                          type="text"
                          value={descAlmuerzo}
                          onChange={(e) => setDescAlmuerzo(e.target.value)}
                          className="w-full p-2 border border-sand-border rounded-lg outline-none bg-white text-ink"
                        />
                      </div>
                    </div>

                    {/* Cena */}
                    <div className="p-3 bg-white rounded-xl border border-sand-border grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                      <div className="font-semibold text-ink sm:col-span-1">🍛 Cena Tradicional</div>
                      <div className="grid grid-cols-3 gap-2 sm:col-span-3">
                        <div>
                          <label className="block text-[10px] text-muted mb-0.5">Precio ($ CLP)</label>
                          <input
                            type="number"
                            value={precioCena}
                            onChange={(e) => setPrecioCena(Number(e.target.value))}
                            className="w-full p-2 border border-sand-border rounded-lg outline-none bg-white text-ink font-bold"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] text-muted mb-0.5">¿Habilitar?</label>
                          <label className="inline-flex items-center gap-1.5 cursor-pointer mt-1">
                            <input
                              type="checkbox"
                              checked={dispCena}
                              onChange={(e) => setDispCena(e.target.checked)}
                              className="rounded border-sand-border text-terracotta"
                            />
                            <span className="font-bold">{dispCena ? "Sí" : "No"}</span>
                          </label>
                        </div>
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] text-muted mb-0.5">Descripción en la minuta</label>
                        <input
                          type="text"
                          value={descCena}
                          onChange={(e) => setDescCena(e.target.value)}
                          className="w-full p-2 border border-sand-border rounded-lg outline-none bg-white text-ink"
                        />
                      </div>
                    </div>

                    {/* Colaciones */}
                    <div className="p-3 bg-white rounded-xl border border-sand-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-muted mb-0.5">🥪 Colación Simple (CLP $)</label>
                        <input
                          type="number"
                          value={precioColacionSimple}
                          onChange={(e) => setPrecioColacionSimple(Number(e.target.value))}
                          className="w-full p-2 border border-sand-border rounded-lg outline-none bg-white text-ink font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-muted mb-0.5">🍱 Colación Completa Premium (CLP $)</label>
                        <input
                          type="number"
                          value={precioColacionCompleta}
                          onChange={(e) => setPrecioColacionCompleta(Number(e.target.value))}
                          className="w-full p-2 border border-sand-border rounded-lg outline-none bg-white text-ink font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Horarios */}
                <div className="space-y-3">
                  <h4 className="font-bold text-ink border-b border-sand-border/50 pb-1">Horarios de Comedor Referenciales</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-muted mb-1">Horario Desayuno</label>
                      <input
                        type="text"
                        value={horarioDesayuno}
                        onChange={(e) => setHorarioDesayuno(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-muted mb-1">Horario Almuerzo</label>
                      <input
                        type="text"
                        value={horarioAlmuerzo}
                        onChange={(e) => setHorarioAlmuerzo(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-muted mb-1">Horario Cena</label>
                      <input
                        type="text"
                        value={horarioCena}
                        onChange={(e) => setHorarioCena(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted">Estos horarios se muestran en el portal del huésped para que coordine la bajada de faena.</p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-terracotta hover:bg-terracotta-deep text-white font-semibold rounded-full px-5 py-2.5 transition-all inline-flex items-center gap-1.5 shadow-sm hover:cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Guardar precios y horarios
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* SECCIÓN 6: REGLAS DE NEGOCIO */}
          <div className="bg-card border border-sand-border rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("reglas")}
              className="w-full flex items-center justify-between p-5 text-left border-b border-sand-border/50 hover:bg-sand-deep/15 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">⚖️</span>
                <div>
                  <h3 className="font-serif font-bold text-base text-ink font-semibold">Reglas de Negocio</h3>
                  <p className="text-[11px] text-muted">Configura plazos de anulación y topes de personas para reservas.</p>
                </div>
              </div>
              {activeSection === "reglas" ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
            </button>

            {activeSection === "reglas" && (
              <form onSubmit={handleSaveReglas} className="p-5 space-y-4 text-xs">
                {successSection === "reglas" && (
                  <div className="p-3 bg-cactus/10 border border-cactus/20 text-cactus rounded-xl font-medium animate-fade-in">
                    ✅ Reglas de negocio actualizadas. Se aplican en las validaciones de reserva.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-muted mb-1">Ventana de cambios de fechas (horas antes)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={ventanaFechas}
                        onChange={(e) => setVentanaFechas(Number(e.target.value))}
                        className="w-20 p-2.5 rounded-lg border border-sand-border bg-white text-ink font-bold text-center"
                      />
                      <span className="font-medium text-muted">horas antes del Check-in.</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-muted mb-1">Ventana de cambios de comidas (horas antes)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={ventanaComida}
                        onChange={(e) => setVentanaComida(Number(e.target.value))}
                        className="w-20 p-2.5 rounded-lg border border-sand-border bg-white text-ink font-bold text-center"
                      />
                      <span className="font-medium text-muted">horas antes de la comida.</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-muted mb-1">Política de Cancelación por Defecto</label>
                    <select
                      value={politicaCancelacion}
                      onChange={(e) => setPoliticaCancelacion(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink outline-none"
                    >
                      <option value="Sin costo hasta 24h">Sin costo hasta 24 horas antes del Check-in.</option>
                      <option value="Sin costo hasta 48h">Sin costo hasta 48 horas antes del Check-in.</option>
                      <option value="No reembolsable">No reembolsable.</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-muted mb-1">Capacidad máxima por reserva pública</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={capacidadMaxima}
                        onChange={(e) => setCapacidadMaxima(Number(e.target.value))}
                        className="w-20 p-2.5 rounded-lg border border-sand-border bg-white text-ink font-bold text-center"
                      />
                      <span className="font-medium text-muted">huéspedes por reserva.</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-terracotta hover:bg-terracotta-deep text-white font-semibold rounded-full px-5 py-2.5 transition-all inline-flex items-center gap-1.5 shadow-sm hover:cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Guardar reglas
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* SECCIÓN 7: PAGOS & DOCUMENTOS */}
          <div className="bg-card border border-sand-border rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection("pagos")}
              className="w-full flex items-center justify-between p-5 text-left border-b border-sand-border/50 hover:bg-sand-deep/15 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">💳</span>
                <div>
                  <h3 className="font-serif font-bold text-base text-ink font-semibold">Pagos & Documentos</h3>
                  <p className="text-[11px] text-muted">Ajusta datos de transferencia bancaria y textos del PDF.</p>
                </div>
              </div>
              {activeSection === "pagos" ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
            </button>

            {activeSection === "pagos" && (
              <form onSubmit={handleSavePagos} className="p-5 space-y-6 text-xs">
                {successSection === "pagos" && (
                  <div className="p-3 bg-cactus/10 border border-cactus/20 text-cactus rounded-xl font-medium animate-fade-in">
                    ✅ Parámetros de pagos y comprobantes guardados correctamente.
                  </div>
                )}

                {/* Metodos */}
                <div>
                  <h4 className="font-bold text-ink border-b border-sand-border/50 pb-1 mb-2">Métodos de Pago Habilitados</h4>
                  <div className="flex flex-wrap gap-4">
                    {["Efectivo", "Transferencia", "Depósito", "Cuenta empresa (crédito)", "Webpay (futuro)"].map((metodo) => (
                      <label key={metodo} className="inline-flex items-center gap-1.5 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={metodo.includes("futuro")}
                          checked={metodosPago.includes(metodo)}
                          onChange={() => toggleMetodoPago(metodo)}
                          className="rounded border-sand-border text-terracotta focus:ring-terracotta"
                        />
                        <span className={metodo.includes("futuro") ? "text-muted/65 italic" : ""}>{metodo}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Transferencia */}
                <div className="space-y-4">
                  <h4 className="font-bold text-ink border-b border-sand-border/50 pb-1">Datos Bancarios para Transferencia</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-muted mb-1">Nombre del Titular</label>
                      <input
                        type="text"
                        value={transfTitular}
                        onChange={(e) => setTransfTitular(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-muted mb-1">RUT del Titular</label>
                      <input
                        type="text"
                        value={transfRut}
                        onChange={(e) => setTransfRut(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-muted mb-1">Banco</label>
                      <input
                        type="text"
                        value={transfBanco}
                        onChange={(e) => setTransfBanco(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-muted mb-1">Tipo de Cuenta</label>
                      <input
                        type="text"
                        value={transfTipoCuenta}
                        onChange={(e) => setTransfTipoCuenta(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-muted mb-1">Número de Cuenta</label>
                      <input
                        type="text"
                        value={transfNumeroCuenta}
                        onChange={(e) => setTransfNumeroCuenta(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-muted mb-1">Correo Electrónico Comprobantes</label>
                      <input
                        type="email"
                        value={transfCorreo}
                        onChange={(e) => setTransfCorreo(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink"
                      />
                    </div>
                  </div>
                </div>

                {/* Comprobantes PDF */}
                <div className="space-y-4">
                  <h4 className="font-bold text-ink border-b border-sand-border/50 pb-1">Plantilla de Comprobante PDF</h4>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block font-semibold text-muted mb-1">URL Logo Corporativo (para el PDF)</label>
                      <input
                        type="text"
                        placeholder="https://pensionmyriam.cl/logo.png"
                        value={docLogoUrl}
                        onChange={(e) => setDocLogoUrl(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-muted mb-1">Encabezado de Comprobante PDF</label>
                      <input
                        type="text"
                        value={docEncabezado}
                        onChange={(e) => setDocEncabezado(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-muted mb-1">Nota al pie de Comprobante PDF</label>
                      <textarea
                        rows={2}
                        value={docPie}
                        onChange={(e) => setDocPie(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Correo Base */}
                <div className="space-y-4">
                  <h4 className="font-bold text-ink border-b border-sand-border/50 pb-1">Plantilla de Correo de Confirmación</h4>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block font-semibold text-muted mb-1">Asunto del Correo (Subject)</label>
                      <input
                        type="text"
                        value={emailAsunto}
                        onChange={(e) => setEmailAsunto(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-muted mb-1">Cuerpo base del Correo</label>
                      <textarea
                        rows={4}
                        value={emailCuerpo}
                        onChange={(e) => setEmailCuerpo(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink font-mono text-[10px]"
                      />
                      <p className="text-[10px] text-muted italic">Variables permitidas: {"{nombre}, {checkIn}, {checkOut}"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-terracotta hover:bg-terracotta-deep text-white font-semibold rounded-full px-5 py-2.5 transition-all inline-flex items-center gap-1.5 shadow-sm hover:cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Guardar plantilla y banco
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* COLUMNA LATERAL - INFORMACIÓN Y SEGURIDAD */}
        <div className="space-y-6">
          
          {/* BLOQUE INFORMATIVO */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs text-xs text-amber-900 space-y-2">
            <h4 className="font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              Aviso de Configuración
            </h4>
            <p className="leading-relaxed">
              Estos ajustes afectan directamente la forma en que se muestran los datos a los huéspedes y regulan el funcionamiento de las validaciones en línea.
            </p>
            <p className="font-semibold text-[11px]">
              ¡Úselos con cuidado! Cualquier cambio erróneo en los precios o en los datos de transferencia puede ocasionar problemas con los pagos.
            </p>
          </div>

          {/* MI CUENTA & SEGURIDAD */}
          <div className="bg-card border border-sand-border rounded-2xl p-5 shadow-xs text-xs space-y-4">
            <h4 className="font-serif font-bold text-base text-ink border-b border-sand-border/50 pb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-terracotta" /> Mi Cuenta & Seguridad
            </h4>

            {securityMessage && (
              <div className={`p-3 rounded-lg border font-medium animate-fade-in ${
                securityMessage.type === "success" 
                  ? "bg-cactus/10 border-cactus/20 text-cactus" 
                  : "bg-red-50 border-red-100 text-red-700"
              }`}>
                {securityMessage.text}
              </div>
            )}

            <form onSubmit={handleUpdateSecurity} className="space-y-3">
              <div>
                <label className="block font-bold text-muted mb-0.5">Correo de la Cuenta</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-muted mb-0.5">Contraseña Actual</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div className="border-t border-sand-border/40 pt-3">
                <label className="block font-bold text-muted mb-0.5">Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block font-bold text-muted mb-0.5">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-sand-border bg-white text-ink outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-terracotta hover:bg-terracotta-deep text-white font-semibold rounded-xl py-3.5 transition-colors flex items-center justify-center gap-2 shadow-xs hover:cursor-pointer"
              >
                <Key className="w-4 h-4" /> Actualizar Contraseña
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
