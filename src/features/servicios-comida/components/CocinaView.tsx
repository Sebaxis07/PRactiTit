"use client";

import { useState, useEffect } from "react";
import {
  guardarMenuDiario,
  duplicarMenuParaMananaAction,
  toggleDisponibilidadPlatoAction,
  actualizarEstadoServicioAction,
} from "../actions/cocina";
import { formatDateCL } from "@/shared/utils/formatters";
import {
  saveLocalMenu,
  getLocalMenu,
  saveLocalPlanificador,
  getLocalPlanificador,
  enqueueOfflineAction,
  getSyncQueue,
  dequeueOfflineAction,
} from "@/shared/lib/indexedDb";

interface CocinaViewProps {
  planificador: any;
  menuInicial?: any;
}

export function CocinaView({ planificador, menuInicial }: CocinaViewProps) {
  const [diaOffset, setDiaOffset] = useState<number>(0);
  const [tabServicio, setTabServicio] = useState<"DESAYUNO" | "ALMUERZO" | "CENA" | "COLACIONES">("DESAYUNO");
  const [showPrevisionSemanal, setShowPrevisionSemanal] = useState<boolean>(false);
  const [showRegistrarMenuModal, setShowRegistrarMenuModal] = useState<boolean>(false);

  // Estados locales sincronizados
  const [localPlanificador, setLocalPlanificadorState] = useState<any>(planificador);
  const [localMenu, setLocalMenuState] = useState<any>(menuInicial);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [pendingChangesCount, setPendingChangesCount] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Campos del Menú Administrable
  const [horarioDesayuno, setHorarioDesayuno] = useState("08:00 - 09:30");
  const [horarioAlmuerzo, setHorarioAlmuerzo] = useState("13:00 - 15:00");
  const [horarioCena, setHorarioCena] = useState("20:00 - 21:30");

  const [desayunoTexto, setDesayunoTexto] = useState("Pan amasado casero, huevos revueltos de campo, mantequilla y té/café.");
  const [desayunoImagen, setDesayunoImagen] = useState("");
  const [desayunoDisponible, setDesayunoDisponible] = useState<boolean>(true);

  const [almuerzoOpcion1, setAlmuerzoOpcion1] = useState("Cazuela de pollo criolla con choclo y zapallo.");
  const [almuerzoOpcion1Imagen, setAlmuerzoOpcion1Imagen] = useState("");
  const [almuerzoOpcion1Disponible, setAlmuerzoOpcion1Disponible] = useState<boolean>(true);

  const [almuerzoOpcion2, setAlmuerzoOpcion2] = useState("Pescado frito del día con ensalada a la chilena y arroz casero.");
  const [almuerzoOpcion2Imagen, setAlmuerzoOpcion2Imagen] = useState("");
  const [almuerzoOpcion2Disponible, setAlmuerzoOpcion2Disponible] = useState<boolean>(true);

  const [cenaOpcion1, setCenaOpcion1] = useState("Consomé de ave o Sopa casera + pan amasado.");
  const [cenaOpcion1Imagen, setCenaOpcion1Imagen] = useState("");
  const [cenaOpcion1Disponible, setCenaOpcion1Disponible] = useState<boolean>(true);

  const [cenaOpcion2, setCenaOpcion2] = useState("Plato ligero: Arroz primavera con pechuga de pollo a la plancha.");
  const [cenaOpcion2Imagen, setCenaOpcion2Imagen] = useState("");
  const [cenaOpcion2Disponible, setCenaOpcion2Disponible] = useState<boolean>(true);

  const [colacionTexto, setColacionTexto] = useState("Sándwich ave mayo casero + fruta fresca + jugo/agua mineral.");
  const [colacionImagen, setColacionImagen] = useState("");
  const [colacionDisponible, setColacionDisponible] = useState<boolean>(true);

  const [isLoadingMenu, setIsLoadingMenu] = useState<boolean>(false);
  const [menuGuardadoExito, setMenuGuardadoExito] = useState<boolean>(false);
  const [duplicadoExito, setDuplicadoExito] = useState<boolean>(false);

  // Estados táctiles en 1 clic para pedidos de cocina
  const [pedidosEstado, setPedidosEstado] = useState<{ [key: string]: "PENDIENTE" | "EN_PREPARACION" | "SERVIDO" | "NO_SHOW" }>({});

  const applyMenuToState = (m: any) => {
    if (!m) return;
    setHorarioDesayuno(m.horarioDesayuno || "08:00 - 09:30");
    setHorarioAlmuerzo(m.horarioAlmuerzo || "13:00 - 15:00");
    setHorarioCena(m.horarioCena || "20:00 - 21:30");
    setDesayunoTexto(m.desayunoTexto || "");
    setDesayunoImagen(m.desayunoImagen || "");
    setDesayunoDisponible(m.desayunoDisponible ?? true);
    setAlmuerzoOpcion1(m.almuerzoOpcion1 || "");
    setAlmuerzoOpcion1Imagen(m.almuerzoOpcion1Imagen || "");
    setAlmuerzoOpcion1Disponible(m.almuerzoOpcion1Disponible ?? true);
    setAlmuerzoOpcion2(m.almuerzoOpcion2 || "");
    setAlmuerzoOpcion2Imagen(m.almuerzoOpcion2Imagen || "");
    setAlmuerzoOpcion2Disponible(m.almuerzoOpcion2Disponible ?? true);
    setCenaOpcion1(m.cenaOpcion1 || "");
    setCenaOpcion1Imagen(m.cenaOpcion1Imagen || "");
    setCenaOpcion1Disponible(m.cenaOpcion1Disponible ?? true);
    setCenaOpcion2(m.cenaOpcion2 || "");
    setCenaOpcion2Imagen(m.cenaOpcion2Imagen || "");
    setCenaOpcion2Disponible(m.cenaOpcion2Disponible ?? true);
    setColacionTexto(m.colacionTexto || "");
    setColacionImagen(m.colacionImagen || "");
    setColacionDisponible(m.colacionDisponible ?? true);
  };

  const triggerSync = async () => {
    if (typeof window === "undefined" || !navigator.onLine) return;
    setSyncing(true);
    try {
      const queue = await getSyncQueue();
      setPendingChangesCount(queue.length);
      
      for (const action of queue) {
        let success = false;
        try {
          if (action.type === "UPDATE_MEAL_STATUS") {
            const { servicioId, tipoServicio, nuevoEstado } = action.payload;
            const res = await actualizarEstadoServicioAction(servicioId, tipoServicio, nuevoEstado);
            if (res.success) success = true;
          } else if (action.type === "SAVE_MENU") {
            const res = await guardarMenuDiario(action.payload);
            if (res.success) success = true;
          } else if (action.type === "TOGGLE_AVAILABILITY") {
            const { fechaStr, campo, estado } = action.payload;
            const res = await toggleDisponibilidadPlatoAction(fechaStr, campo, estado);
            if (res.success) success = true;
          } else if (action.type === "DUPLICATE_MENU") {
            const res = await duplicarMenuParaMananaAction(action.payload.fechaBaseStr);
            if (res.success) success = true;
          }
        } catch (err) {
          console.error("Error executing sync action in background:", err);
        }
        
        if (success && action.id !== undefined) {
          await dequeueOfflineAction(action.id);
        } else {
          break;
        }
      }
      
      const newQueue = await getSyncQueue();
      setPendingChangesCount(newQueue.length);
      
      if (newQueue.length === 0 && queue.length > 0) {
        // Recargar datos frescos del servidor
        window.location.reload();
      }
    } catch (e) {
      console.error("Sync process failed:", e);
    } finally {
      setSyncing(false);
    }
  };

  // Carga inicial local e inicio de listeners de red
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        triggerSync();
      };
      const handleOffline = () => {
        setIsOnline(false);
      };
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      const initLocalData = async () => {
        const todayStr = new Date().toISOString().split("T")[0];
        const queue = await getSyncQueue();
        setPendingChangesCount(queue.length);

        if (navigator.onLine) {
          await saveLocalPlanificador(todayStr, planificador);
          if (menuInicial) {
            await saveLocalMenu(todayStr, menuInicial);
          }
          setLocalPlanificadorState(planificador);
          setLocalMenuState(menuInicial);
          applyMenuToState(menuInicial);
          
          if (queue.length > 0) {
            triggerSync();
          }
        } else {
          const cachedPlan = await getLocalPlanificador(todayStr);
          const cachedMenu = await getLocalMenu(todayStr);
          if (cachedPlan) setLocalPlanificadorState(cachedPlan);
          if (cachedMenu) {
            setLocalMenuState(cachedMenu);
            applyMenuToState(cachedMenu);
          }
        }
      };

      initLocalData();

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [planificador, menuInicial]);

  // Sincronizar pedidosEstado con detalles de raciones locales
  useEffect(() => {
    const initialStates: { [key: string]: "PENDIENTE" | "EN_PREPARACION" | "SERVIDO" | "NO_SHOW" } = {};
    const servicios = localPlanificador?.detallesServicios || [];
    servicios.forEach((item: any) => {
      initialStates[`desayuno-${item.id}`] = (item.estadoDesayuno || "PENDIENTE") as any;
      initialStates[`colacion-${item.id}`] = (item.estadoColacion || "PENDIENTE") as any;
      initialStates[`cena-${item.id}`] = (item.estadoCena || "PENDIENTE") as any;
    });
    setPedidosEstado(initialStates);
  }, [localPlanificador]);

  // Compresión automática client-side mediante Canvas para fotos pesadas de celulares
  const handleCargarImagenDispositivo = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
        setter(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const cambiarEstadoPedido = async (id: string, nuevoEstado: "PENDIENTE" | "EN_PREPARACION" | "SERVIDO" | "NO_SHOW") => {
    // 1. Modificar interfaz inmediatamente
    setPedidosEstado((prev) => ({ ...prev, [id]: nuevoEstado }));

    const parts = id.split("-");
    const tipoServicio = parts[0] as "desayuno" | "colacion" | "cena";
    const servicioId = parts.slice(1).join("-");

    // 2. Modificar en base de datos local IndexedDB
    const todayStr = new Date().toISOString().split("T")[0];
    const cachedPlan = await getLocalPlanificador(todayStr) || localPlanificador;
    if (cachedPlan && cachedPlan.detallesServicios) {
      cachedPlan.detallesServicios = cachedPlan.detallesServicios.map((item: any) => {
        if (item.id === servicioId) {
          const field = tipoServicio === "desayuno" ? "estadoDesayuno" : tipoServicio === "colacion" ? "estadoColacion" : "estadoCena";
          return { ...item, [field]: nuevoEstado };
        }
        return item;
      });
      await saveLocalPlanificador(todayStr, cachedPlan);
      setLocalPlanificadorState(cachedPlan);
    }

    // 3. Sincronizar o encolar
    if (navigator.onLine) {
      const res = await actualizarEstadoServicioAction(servicioId, tipoServicio, nuevoEstado);
      if (!res.success) {
        await enqueueOfflineAction("UPDATE_MEAL_STATUS", { servicioId, tipoServicio, nuevoEstado });
        const queue = await getSyncQueue();
        setPendingChangesCount(queue.length);
      }
    } else {
      await enqueueOfflineAction("UPDATE_MEAL_STATUS", { servicioId, tipoServicio, nuevoEstado });
      const queue = await getSyncQueue();
      setPendingChangesCount(queue.length);
    }
  };

  const getEstadoActual = (id: string, estadoInicial: string = "PENDIENTE") => {
    return pedidosEstado[id] || (estadoInicial as any);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const handleGuardarMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingMenu(true);

    const payload = {
      fechaStr: todayStr,
      horarioDesayuno,
      horarioAlmuerzo,
      horarioCena,
      desayunoTexto,
      desayunoImagen,
      desayunoDisponible,
      almuerzoOpcion1,
      almuerzoOpcion1Imagen,
      almuerzoOpcion1Disponible,
      almuerzoOpcion2,
      almuerzoOpcion2Imagen,
      almuerzoOpcion2Disponible,
      cenaOpcion1,
      cenaOpcion1Imagen,
      cenaOpcion1Disponible,
      cenaOpcion2,
      cenaOpcion2Imagen,
      cenaOpcion2Disponible,
      colacionTexto,
      colacionImagen,
      colacionDisponible,
    };

    // Actualizar local
    await saveLocalMenu(todayStr, payload);
    setLocalMenuState(payload);

    if (navigator.onLine) {
      const res = await guardarMenuDiario(payload);
      setIsLoadingMenu(false);
      if (res.success) {
        setMenuGuardadoExito(true);
        setShowRegistrarMenuModal(false);
        setTimeout(() => setMenuGuardadoExito(false), 3000);
      } else {
        await enqueueOfflineAction("SAVE_MENU", payload);
        const queue = await getSyncQueue();
        setPendingChangesCount(queue.length);
        setMenuGuardadoExito(true);
        setShowRegistrarMenuModal(false);
        setTimeout(() => setMenuGuardadoExito(false), 3000);
      }
    } else {
      await enqueueOfflineAction("SAVE_MENU", payload);
      const queue = await getSyncQueue();
      setPendingChangesCount(queue.length);
      setIsLoadingMenu(false);
      setMenuGuardadoExito(true);
      setShowRegistrarMenuModal(false);
      setTimeout(() => setMenuGuardadoExito(false), 3000);
    }
  };

  const handleDuplicarMenu = async () => {
    setIsLoadingMenu(true);
    
    // Simular en local
    const tomDate = new Date();
    tomDate.setDate(tomDate.getDate() + 1);
    const tomStr = tomDate.toISOString().split("T")[0];
    const currentMenu = await getLocalMenu(todayStr) || localMenu;
    if (currentMenu) {
      await saveLocalMenu(tomStr, { ...currentMenu, fechaStr: tomStr });
    }

    if (navigator.onLine) {
      const res = await duplicarMenuParaMananaAction(todayStr);
      setIsLoadingMenu(false);
      if (res.success) {
        setDuplicadoExito(true);
        setTimeout(() => setDuplicadoExito(false), 3000);
      } else {
        await enqueueOfflineAction("DUPLICATE_MENU", { fechaBaseStr: todayStr });
        const queue = await getSyncQueue();
        setPendingChangesCount(queue.length);
        setDuplicadoExito(true);
        setTimeout(() => setDuplicadoExito(false), 3000);
      }
    } else {
      await enqueueOfflineAction("DUPLICATE_MENU", { fechaBaseStr: todayStr });
      const queue = await getSyncQueue();
      setPendingChangesCount(queue.length);
      setIsLoadingMenu(false);
      setDuplicadoExito(true);
      setTimeout(() => setDuplicadoExito(false), 3000);
    }
  };

  const handleToggleDisponibilidad = async (campo: string, estadoActual: boolean) => {
    const nuevoEstado = !estadoActual;
    if (campo === "almuerzoOpcion1Disponible") setAlmuerzoOpcion1Disponible(nuevoEstado);
    if (campo === "almuerzoOpcion2Disponible") setAlmuerzoOpcion2Disponible(nuevoEstado);
    if (campo === "cenaOpcion1Disponible") setCenaOpcion1Disponible(nuevoEstado);
    if (campo === "cenaOpcion2Disponible") setCenaOpcion2Disponible(nuevoEstado);

    // Actualizar local
    const cachedMenu = await getLocalMenu(todayStr) || localMenu;
    if (cachedMenu) {
      const updatedMenu = { ...cachedMenu, [campo]: nuevoEstado };
      await saveLocalMenu(todayStr, updatedMenu);
      setLocalMenuState(updatedMenu);
    }

    if (navigator.onLine) {
      const res = await toggleDisponibilidadPlatoAction(todayStr, campo, nuevoEstado);
      if (!res.success) {
        await enqueueOfflineAction("TOGGLE_AVAILABILITY", { fechaStr: todayStr, campo, estado: nuevoEstado });
        const queue = await getSyncQueue();
        setPendingChangesCount(queue.length);
      }
    } else {
      await enqueueOfflineAction("TOGGLE_AVAILABILITY", { fechaStr: todayStr, campo, estado: nuevoEstado });
      const queue = await getSyncQueue();
      setPendingChangesCount(queue.length);
    }
  };

  // Pedidos por tab
  const detallesServicios = localPlanificador?.detallesServicios || [];

  const pedidosTab = detallesServicios.filter((item: any) => {
    if (tabServicio === "DESAYUNO") return item.desayunosCant > 0 && !item.renunciaDesayuno;
    if (tabServicio === "ALMUERZO") return (item.desayunosCant > 0 || item.cenasCant > 0) && !item.renunciaAlmuerzo;
    if (tabServicio === "CENA") return item.cenasCant > 0 && !item.renunciaCena;
    if (tabServicio === "COLACIONES") return item.colacionesCant > 0;
    return true;
  });

  const totalDesayunos = localPlanificador?.totales?.desayunos || 0;
  const totalColaciones = localPlanificador?.totales?.colaciones || 0;
  const totalCenas = localPlanificador?.totales?.cenas || 0;
  const totalAlmuerzos = Math.max(totalDesayunos, totalCenas);

  const servidosDesayunos = detallesServicios.filter((i: any) => getEstadoActual(`desayuno-${i.id}`) === "SERVIDO").length;
  const servidosColaciones = detallesServicios.filter((i: any) => getEstadoActual(`colacion-${i.id}`) === "SERVIDO").length;
  const servidosCenas = detallesServicios.filter((i: any) => getEstadoActual(`cena-${i.id}`) === "SERVIDO").length;
  const [themeMode, setThemeMode] = useState<"desierto" | "bruma">("desierto");
  const [modalTab, setModalTab] = useState<"horarios" | "desayuno" | "almuerzo" | "cena">("horarios");

  const isDes = themeMode === "desierto";
  const themeCard = isDes ? "bg-[#FFFAF1] border-[#DDD0B3]" : "bg-[#F8FAFC] border-[#CBD5E1]";
  const themeText = isDes ? "text-[#2A2418]" : "text-[#0F172A]";
  const themeMuted = isDes ? "text-[#7A6F5A]" : "text-[#475569]";
  const themeBgDeep = isDes ? "bg-[#EBDCBE]/30" : "bg-[#E2E8F0]/50";
  const themeBorder = isDes ? "border-[#DDD0B3]/70" : "border-[#E2E8F0]";
  const themeAccent = isDes ? "bg-[#D9583B] text-white hover:bg-[#731D0A]" : "bg-[#0284C7] text-white hover:bg-[#0369A1]";
  const themeAccentText = isDes ? "text-[#D9583B]" : "text-[#0284C7]";
  const themeAccentBg = isDes ? "bg-[#D9583B]/10" : "bg-[#0284C7]/10";
  const themeBadge = isDes ? "bg-amber-100/50 text-amber-900 border-amber-200" : "bg-sky-100/50 text-sky-900 border-sky-200";

  return (
    <div className={`space-y-8 select-none transition-colors duration-500`}>
      {/* ── HEADER DE CONTROL Y CONFIGURACIÓN DEL SISTEMA (GLASSMORPHISM) ────────────────── */}
      <div className={`backdrop-blur-md bg-card/85 p-6 rounded-3xl border-2 ${themeBorder} shadow-lg transition-all duration-500`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: isDes ? "#7A6F5A" : "#64748B" }}>
              <span>Administración</span><span>›</span>
              <span className={themeAccentText}>Panel de Cocina</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <h1 className={`text-3xl font-serif font-black tracking-tight ${themeText}`}>
                Cocina Señora Myriam 🍳
              </h1>
              
              {/* INDICADOR DE SINCRONIZACIÓN Y ESTADO OFFLINE */}
              <div className="flex items-center">
                {!isOnline ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Modo sin conexión
                  </span>
                ) : pendingChangesCount > 0 ? (
                  <button 
                    onClick={triggerSync}
                    disabled={syncing}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-all cursor-pointer shadow-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-spin"></span>
                    {syncing ? "Sincronizando..." : `${pendingChangesCount} cambios pendientes`}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Sincronizado
                  </span>
                )}
              </div>
            </div>
            <p className={`text-xs ${themeMuted}`}>
              Caleta Paposo, Chile · Gestión diaria de comandas e ingredientes.
            </p>
          </div>

          {/* SELECTORES DE ACCIÓN Y TEMA DINÁMICO */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* SWITCH DE TEMA PREMIUM */}
            <div className="flex items-center bg-sand-deep/20 border border-sand-border/40 p-1 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setThemeMode("desierto")}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  themeMode === "desierto"
                    ? "bg-[#D9583B] text-white shadow-md"
                    : "text-ink/70 hover:bg-sand-deep/30"
                }`}
              >
                ☀️ Sol de Paposo
              </button>
              <button
                type="button"
                onClick={() => setThemeMode("bruma")}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  themeMode === "bruma"
                    ? "bg-[#0284C7] text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                🌫️ Bruma Costera
              </button>
            </div>

            <button
              onClick={() => setShowRegistrarMenuModal(true)}
              className={`font-bold text-xs px-5 py-3 rounded-2xl shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer ${themeAccent}`}
            >
              <span>📝 Editar Menú</span>
            </button>

            <button
              onClick={handleDuplicarMenu}
              disabled={isLoadingMenu}
              className={`font-bold text-xs px-4 py-3 rounded-2xl border transition-all cursor-pointer bg-card ${themeText} ${themeBorder} hover:bg-sand-deep/20`}
              title="Duplica la minuta de hoy para mañana"
            >
              📋 Duplicar Menú
            </button>

            <button
              onClick={() => setShowPrevisionSemanal(!showPrevisionSemanal)}
              className={`border text-xs font-bold px-4 py-3 rounded-2xl transition-all cursor-pointer bg-card ${themeText} ${themeBorder} hover:bg-sand-deep/20`}
            >
              {showPrevisionSemanal ? "📊 Ocultar Previsión" : "📊 Previsión"}
            </button>
          </div>
        </div>
      </div>

      {menuGuardadoExito && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs animate-fade-in">
          ✅ El menú, sus fotos y sus horarios han sido publicados exitosamente en la nube.
        </div>
      )}

      {duplicadoExito && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold shadow-xs animate-fade-in">
          📋 Se ha duplicado correctamente el menú de hoy para el día de mañana.
        </div>
      )}

      {/* ── PREVISIÓN DE COMPRAS Y KPI (ESTILO MODERNO DE TARJETA FLUIDA) ────────────────── */}
      {showPrevisionSemanal && (
        <div className={`border-2 ${themeCard} rounded-3xl p-6 shadow-xl space-y-4 animate-scale-in transition-all duration-500`}>
          <div>
            <h2 className={`text-xl font-serif font-black ${themeText}`}>📊 Previsión de Compras (Sugerencias)</h2>
            <p className={`text-xs ${themeMuted}`}>Cálculo sugerido de insumos para la jornada según comensales activos.</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { label: "Huevos de Campo", qty: `${totalDesayunos * 2} u.`, desc: "2 por desayuno", icon: "🥚" },
              { label: "Pan Masita", qty: `${Math.round((totalDesayunos + totalColaciones) * 1.5)} u.`, desc: "Promedio desayuno/vianda", icon: "🍞" },
              { label: "Carnes / Proteínas", qty: `${totalAlmuerzos + totalCenas} porc.`, desc: "Almuerzo + Cena", icon: "🥩" },
              { label: "Fruta Estación", qty: `${totalColaciones} u.`, desc: "1 por colación", icon: "🍎" },
              { label: "Café / Té / Azúcar", qty: `${totalDesayunos} raciones`, desc: "Servicio de desayuno", icon: "☕" }
            ].map((insumo, index) => (
              <div 
                key={index}
                className="bg-card/50 border border-sand-border/50 rounded-2xl p-4 flex flex-col justify-between hover:border-terracotta/40 hover:-translate-y-0.5 transition-all duration-300 shadow-xs"
              >
                <span className="text-3xl">{insumo.icon}</span>
                <div className="mt-4">
                  <div className={`text-[10px] uppercase font-bold ${themeMuted}`}>{insumo.label}</div>
                  <div className="font-serif font-bold text-xl text-terracotta mt-0.5">{insumo.qty}</div>
                  <div className="text-[9px] text-muted italic mt-0.5">{insumo.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MINUTA DEL DÍA (EXHIBIDOR PREMIUM DE PLATOS CON FOTO O GRADIENTE) ────────────────── */}
      <div className={`border-2 ${themeCard} rounded-3xl p-6 shadow-xl space-y-6 transition-all duration-500`}>
        <div className="flex items-center justify-between border-b border-sand-border/60 pb-4">
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-terracotta block">
              Menú Publicado · {formatDateCL(new Date())}
            </span>
            <h2 className={`text-2xl font-serif font-bold ${themeText} mt-0.5`}>
              Platos y Opciones Disponibles para Hoy
            </h2>
          </div>
          <button
            onClick={() => setShowRegistrarMenuModal(true)}
            className="text-xs font-extrabold text-terracotta hover:underline cursor-pointer flex items-center gap-1"
          >
            ✏️ Modificar Platos
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TARJETA DESAYUNO */}
          <div className="bg-[#FAF7F0] border border-amber-200/80 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
            <div className="relative h-44 w-full bg-gradient-to-tr from-amber-100 to-yellow-50 flex items-center justify-center overflow-hidden">
              {desayunoImagen ? (
                <img src={desayunoImagen} alt="Desayuno" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
              ) : (
                <div className="text-center p-4">
                  <span className="text-5xl block animate-bounce" style={{ animationDuration: "3s" }}>🥐</span>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mt-2 block">Menú Tradicional</span>
                </div>
              )}
              <span className="absolute top-3 right-3 font-mono text-[9px] font-bold bg-[#2A2418] text-white px-2.5 py-1 rounded-full shadow-md">
                ⏰ {horarioDesayuno}
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <span className="text-[9px] font-black uppercase text-amber-700 tracking-wider">Servicio Desayuno</span>
                <h3 className="font-serif font-bold text-lg text-[#2A2418]">Desayuno Costero</h3>
                <p className="text-xs text-[#7A6F5A] leading-relaxed font-medium">{desayunoTexto}</p>
              </div>
              <div className="flex items-center justify-between border-t border-sand-border/40 pt-3">
                <span className="text-[10px] font-bold text-muted">Estado</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Disponible
                </span>
              </div>
            </div>
          </div>

          {/* TARJETA ALMUERZO */}
          <div className="bg-[#FFF5F2] border border-orange-200/80 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
            <div className="relative h-44 w-full bg-gradient-to-tr from-orange-100 to-amber-50 flex items-center justify-center overflow-hidden">
              {almuerzoOpcion1Imagen || almuerzoOpcion2Imagen ? (
                <img src={almuerzoOpcion1Imagen || almuerzoOpcion2Imagen} alt="Almuerzo" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
              ) : (
                <div className="text-center p-4">
                  <span className="text-5xl block animate-bounce" style={{ animationDuration: "3s" }}>🍲</span>
                  <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider mt-2 block">2 Opciones de Plato</span>
                </div>
              )}
              <span className="absolute top-3 right-3 font-mono text-[9px] font-bold bg-[#2A2418] text-white px-2.5 py-1 rounded-full shadow-md">
                ⏰ {horarioAlmuerzo}
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase text-orange-700 tracking-wider block">Almuerzo Casero</span>
                
                {/* Opción 1 */}
                <div className="p-3 rounded-2xl bg-white border border-orange-100 flex items-center justify-between gap-3 shadow-xs">
                  <div className="text-xs text-ink leading-tight font-medium flex-1">
                    <span className="font-bold text-orange-950 block text-[10px] mb-0.5">Opción 1:</span>
                    {almuerzoOpcion1}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleDisponibilidad("almuerzoOpcion1Disponible", almuerzoOpcion1Disponible)}
                    className={`text-[9px] px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer border ${
                      almuerzoOpcion1Disponible 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    {almuerzoOpcion1Disponible ? "✓ Disp" : "✕ Agotado"}
                  </button>
                </div>

                {/* Opción 2 */}
                <div className="p-3 rounded-2xl bg-white border border-orange-100 flex items-center justify-between gap-3 shadow-xs">
                  <div className="text-xs text-ink leading-tight font-medium flex-1">
                    <span className="font-bold text-orange-950 block text-[10px] mb-0.5">Opción 2:</span>
                    {almuerzoOpcion2}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleDisponibilidad("almuerzoOpcion2Disponible", almuerzoOpcion2Disponible)}
                    className={`text-[9px] px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer border ${
                      almuerzoOpcion2Disponible 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    {almuerzoOpcion2Disponible ? "✓ Disp" : "✕ Agotado"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TARJETA CENA */}
          <div className="bg-[#FFF2F2] border border-red-200/80 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
            <div className="relative h-44 w-full bg-gradient-to-tr from-red-100 to-rose-50 flex items-center justify-center overflow-hidden">
              {cenaOpcion1Imagen || cenaOpcion2Imagen ? (
                <img src={cenaOpcion1Imagen || cenaOpcion2Imagen} alt="Cena" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
              ) : (
                <div className="text-center p-4">
                  <span className="text-5xl block animate-bounce" style={{ animationDuration: "3s" }}>🍽️</span>
                  <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider mt-2 block">Minuta de Noche</span>
                </div>
              )}
              <span className="absolute top-3 right-3 font-mono text-[9px] font-bold bg-[#2A2418] text-white px-2.5 py-1 rounded-full shadow-md">
                ⏰ {horarioCena}
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase text-red-700 tracking-wider block">Cena Familiar</span>
                
                {/* Opción 1 */}
                <div className="p-3 rounded-2xl bg-white border border-red-100 flex items-center justify-between gap-3 shadow-xs">
                  <div className="text-xs text-ink leading-tight font-medium flex-1">
                    <span className="font-bold text-red-950 block text-[10px] mb-0.5">Opción 1:</span>
                    {cenaOpcion1}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleDisponibilidad("cenaOpcion1Disponible", cenaOpcion1Disponible)}
                    className={`text-[9px] px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer border ${
                      cenaOpcion1Disponible 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    {cenaOpcion1Disponible ? "✓ Disp" : "✕ Agotado"}
                  </button>
                </div>

                {/* Opción 2 */}
                <div className="p-3 rounded-2xl bg-white border border-red-100 flex items-center justify-between gap-3 shadow-xs">
                  <div className="text-xs text-ink leading-tight font-medium flex-1">
                    <span className="font-bold text-red-950 block text-[10px] mb-0.5">Opción 2:</span>
                    {cenaOpcion2}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleDisponibilidad("cenaOpcion2Disponible", cenaOpcion2Disponible)}
                    className={`text-[9px] px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer border ${
                      cenaOpcion2Disponible 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    {cenaOpcion2Disponible ? "✓ Disp" : "✕ Agotado"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABLERO DE COMANDAS TÁCTIL (GRID DE TICKETS CON ALTURA DINÁMICA) ────────────────── */}
      <div className={`border-2 ${themeCard} rounded-3xl p-6 shadow-xl space-y-8 transition-all duration-500`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 border-b border-sand-border/60 pb-5">
          <div>
            <h2 className={`text-2xl font-serif font-black ${themeText}`}>Tablero de Comandas</h2>
            <p className={`text-xs ${themeMuted} mt-0.5`}>Haga clic en los estados para marcar el progreso de las raciones en cocina.</p>
          </div>
          
          {/* TAB SELECTOR TIPO PILL */}
          <div className="flex flex-wrap bg-sand-deep/20 p-1.5 rounded-2xl border border-sand-border/40 w-full lg:w-auto">
            {(["DESAYUNO", "ALMUERZO", "CENA", "COLACIONES"] as const).map((tab) => {
              const isActive = tabServicio === tab;
              const labels = {
                DESAYUNO: `🥐 Desayuno (${totalDesayunos})`,
                ALMUERZO: `🍲 Almuerzo (${totalAlmuerzos})`,
                CENA: `🍽️ Cena (${totalCenas})`,
                COLACIONES: `🥪 Vianda (${totalColaciones})`
              };
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTabServicio(tab)}
                  className={`flex-1 lg:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? "bg-terracotta text-white shadow-md scale-[1.01]" 
                      : "text-ink/80 hover:bg-sand-deep/30"
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTADORES KPI DE ENTREGA CON BARRA DE PROGRESO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Desayunos Entregados", icon: "🥐", active: servidosDesayunos, total: totalDesayunos, color: "bg-amber-500" },
            { label: "Viandas de Faena Entregadas", icon: "🥪", active: servidosColaciones, total: totalColaciones, color: "bg-emerald-600" },
            { label: "Cenas Entregadas", icon: "🍽️", active: servidosCenas, total: totalCenas, color: "bg-red-500" }
          ].map((kpi, idx) => {
            const pct = kpi.total > 0 ? (kpi.active / kpi.total) * 100 : 0;
            return (
              <div key={idx} className="bg-card border border-sand-border/50 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="text-xl">{kpi.icon}</span>
                  <span className="font-serif font-black text-ink text-base">{kpi.active} / {kpi.total}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold block mb-1">{kpi.label}</span>
                  <div className="w-full bg-sand-deep/40 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${kpi.color} transition-all duration-500`} 
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* LISTADO DE TICKETS DE GUEST */}
        {pedidosTab.length === 0 ? (
          <div className="text-center py-16 bg-sand-deep/10 border-2 border-dashed border-sand-border/60 rounded-3xl">
            <span className="text-4xl block mb-2 animate-pulse">🍽️</span>
            <p className="text-sm font-bold text-ink/70">No hay comandas registradas para este servicio hoy.</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Las solicitudes de los huéspedes se listarán en esta área de forma automática.<br/>
              Asegúrate de registrar huéspedes en el portal.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pedidosTab.map((item: any) => {
              const cliente = item.reserva?.cliente || {};
              const habitacion = item.reserva?.habitacion || {};
              
              let cant = 0;
              let tipoKey = "";
              let pref = "";
              
              if (tabServicio === "DESAYUNO") {
                cant = item.desayunosCant;
                tipoKey = `desayuno-${item.id}`;
              } else if (tabServicio === "ALMUERZO") {
                cant = Math.max(item.desayunosCant, item.cenasCant);
                tipoKey = `almuerzo-${item.id}`;
                pref = item.preferenciaAlmuerzo || "Minuta del día (Cazuela de pollo / Pescado frito)";
              } else if (tabServicio === "CENA") {
                cant = item.cenasCant;
                tipoKey = `cena-${item.id}`;
                pref = item.preferenciaCena || "Cena del día (Consomé de ave / Plato ligero)";
              } else if (tabServicio === "COLACIONES") {
                cant = item.colacionesCant;
                tipoKey = `colacion-${item.id}`;
              }

              const estadoActual = getEstadoActual(tipoKey, "PENDIENTE");

              // Borde izquierdo grueso (estilo comanda cocina industrial)
              const stateColors = {
                PENDIENTE: "border-l-[#DDD0B3] bg-card",
                EN_PREPARACION: "border-l-orange-500 bg-orange-50/5",
                SERVIDO: "border-l-emerald-600 bg-green-50/10",
                NO_SHOW: "border-l-red-500 bg-red-50/5 opacity-70"
              }[estadoActual];

              return (
                <div 
                  key={item.id} 
                  className={`border border-sand-border/80 border-l-8 rounded-3xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between space-y-4 ${stateColors}`}
                >
                  <div className="space-y-3.5">
                    {/* CABECERA GUEST TICKET */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-serif font-black text-ink text-base leading-tight">
                          {cliente.nombre}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          {cliente.tipo === "TRABAJADOR_FAENA" ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
                              👷 Faena · {cliente.empresa || "Minera"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
                              ✈️ Turista
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono text-xs font-black bg-terracotta/10 text-terracotta px-3 py-1.5 rounded-xl border border-terracotta/20">
                        Pieza {habitacion.numero || "S/N"}
                      </span>
                    </div>

                    {/* DETALLE TICKET */}
                    <div className="bg-[#FFFAF1]/80 border border-sand-border/30 p-3 rounded-2xl text-xs space-y-2.5">
                      <div className="flex justify-between font-bold text-ink border-b border-sand-border/20 pb-2">
                        <span>Ración Solicitada:</span>
                        <span className="text-terracotta font-serif font-bold text-sm">${cant} Ración(es)</span>
                      </div>
                      
                      {pref && (
                        <div className="text-ink/80 text-[11px] font-medium leading-relaxed italic mt-1">
                          🍴 Opción: {pref}
                        </div>
                      )}
                      
                      {item.restriccionDietaria && (
                        <div className="bg-red-50 text-red-800 p-2.5 rounded-xl border border-red-200 font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1 animate-pulse">
                          <span>⚠️ Alerta:</span>
                          <span>{item.restriccionDietaria}</span>
                        </div>
                      )}
                      
                      {item.solicitudExtraNotas && (
                        <div className="text-muted text-[10px] leading-relaxed italic pt-1 border-t border-dashed border-sand-border/60 mt-1">
                          Nota: "{item.solicitudExtraNotas}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CONTROLES DE CAMBIO DE ESTADO TÁCTILES */}
                  <div className="space-y-2 pt-2 border-t border-sand-border/40">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#7A6F5A] block mb-1">Estado de Entrega:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: "PENDIENTE", label: "⏳ Espera", activeColor: "bg-[#DDD0B3] border-[#DDD0B3] text-[#2A2418]", inactiveColor: "hover:bg-sand-deep/20 text-[#7A6F5A] border-sand-border/40" },
                        { key: "EN_PREPARACION", label: "🍳 Cocinando", activeColor: "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10", inactiveColor: "hover:bg-orange-50 text-orange-600 border-orange-200" },
                        { key: "SERVIDO", label: "✓ Servido", activeColor: "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10", inactiveColor: "hover:bg-emerald-50 text-emerald-600 border-emerald-200" },
                        { key: "NO_SHOW", label: "✕ No Show", activeColor: "bg-red-600 border-red-600 text-white shadow-md shadow-red-500/10", inactiveColor: "hover:bg-red-50 text-red-600 border-red-200" }
                      ].map((btn) => {
                        const isSel = estadoActual === btn.key;
                        return (
                          <button
                            key={btn.key}
                            type="button"
                            onClick={() => cambiarEstadoPedido(tipoKey, btn.key as any)}
                            className={`border text-[10px] font-bold py-2 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer ${
                              isSel ? btn.activeColor + " scale-[0.98]" : btn.inactiveColor
                            }`}
                          >
                            {btn.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL CON SELECCIÓN Y COMPRESIÓN DE IMÁGENES (DISEÑO PREMIUM CONTROL CENTER) ────────────────── */}      {showRegistrarMenuModal && (
        <div className="fixed inset-0 z-50 bg-[#1E1B16]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border-2 border-sand-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-ink relative animate-scale-in">
            {/* BOTÓN CERRAR */}
            <button 
              onClick={() => setShowRegistrarMenuModal(false)} 
              className="absolute top-4 right-4 text-ink hover:text-terracotta text-2xl font-bold bg-sand-deep/45 w-10 h-10 rounded-full grid place-items-center transition-colors cursor-pointer"
            >
              ✕
            </button>
            
            {/* CABECERA */}
            <div className="border-b border-sand-border/60 pb-4">
              <span className="text-[9px] uppercase font-black text-terracotta tracking-wider">
                Módulo Administrable
              </span>
              <h3 className="font-serif font-black text-2xl text-ink mt-0.5">📝 Definir Menú del Día</h3>
              <p className="text-xs text-muted">Configura los horarios y redacta los menús de hoy. Las fotos se optimizan automáticamente.</p>
            </div>

            {/* SEGMENTED TAB SELECTOR INSIDE MODAL */}
            <div className="flex bg-sand-deep/20 p-1 rounded-2xl border border-sand-border/40 gap-1">
              {[
                { id: "horarios", label: "⏰ Horarios" },
                { id: "desayuno", label: "🥐 Desayuno/Vianda" },
                { id: "almuerzo", label: "🍲 Almuerzos" },
                { id: "cena", label: "🍽️ Cenas" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setModalTab(tab.id as any)}
                  className={
                    "flex-1 py-2 text-center rounded-xl text-[11px] font-extrabold transition-all cursor-pointer " +
                    (modalTab === tab.id
                      ? "bg-white text-ink shadow-sm scale-[1.01]"
                      : "text-ink/60 hover:bg-white/40")
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleGuardarMenu} className="space-y-6 text-xs font-medium">
              
              {/* CONTENIDO TAB HORARIOS */}
              {modalTab === "horarios" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-5 rounded-2xl bg-sand-deep/25 border border-sand-border/40 space-y-4">
                    <span className="font-bold text-ink text-sm block">Horarios de Atención al Huésped</span>
                    <p className="text-muted leading-relaxed text-[11px]">
                      Establezca el rango de hora en que la Señora Myriam servirá las comidas en el comedor local.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-muted font-bold">Rango Desayuno</label>
                        <input
                          type="text"
                          value={horarioDesayuno}
                          onChange={(e) => setHorarioDesayuno(e.target.value)}
                          placeholder="08:00 - 09:30"
                          className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none focus:border-terracotta transition-colors shadow-2xs font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-muted font-bold">Rango Almuerzo</label>
                        <input
                          type="text"
                          value={horarioAlmuerzo}
                          onChange={(e) => setHorarioAlmuerzo(e.target.value)}
                          placeholder="13:00 - 15:00"
                          className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none focus:border-terracotta transition-colors shadow-2xs font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-muted font-bold">Rango Cena</label>
                        <input
                          type="text"
                          value={horarioCena}
                          onChange={(e) => setHorarioCena(e.target.value)}
                          placeholder="20:00 - 21:30"
                          className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none focus:border-terracotta transition-colors shadow-2xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENIDO TAB DESAYUNO / VIANDA */}
              {modalTab === "desayuno" && (
                <div className="space-y-5 animate-fade-in">
                  {/* Desayuno */}
                  <div className="space-y-3 p-4 bg-amber-50/10 border border-amber-200/50 rounded-2xl">
                    <span className="font-serif font-black text-amber-900 text-sm block">🥐 Desayuno de la Casa</span>
                    <textarea
                      rows={3}
                      value={desayunoTexto}
                      onChange={(e) => setDesayunoTexto(e.target.value)}
                      placeholder="Ej. Pan amasado recién cocinado, huevos revueltos de campo, mantequilla y té/café..."
                      className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none focus:border-terracotta transition-colors leading-relaxed shadow-2xs"
                    />

                    {/* Custom File Uploader Card */}
                    <div className="space-y-1.5">
                      <span className="block font-bold text-ink text-[11px]">Foto del Desayuno</span>
                      {desayunoImagen ? (
                        <div className="relative group rounded-2xl overflow-hidden h-36 border border-sand-border shadow-xs">
                          <img src={desayunoImagen} alt="Desayuno" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-[#2A2418]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                            <button 
                              type="button" 
                              onClick={() => setDesayunoImagen("")}
                              className="bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-[10px] hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                            >
                              🗑️ Eliminar Foto
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-sand-border hover:border-terracotta/40 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-sand-deep/5 group">
                          <span className="text-3xl group-hover:scale-110 transition-transform">📷</span>
                          <span className="font-bold text-[11px] text-ink mt-2">Cargar foto del Desayuno</span>
                          <span className="text-[9px] text-muted mt-0.5">Saca una foto con tu celular o selecciona un archivo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCargarImagenDispositivo(e, setDesayunoImagen)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Colación / Vianda */}
                  <div className="space-y-3 p-4 bg-emerald-50/10 border border-emerald-200/50 rounded-2xl">
                    <span className="font-serif font-black text-emerald-900 text-sm block">🥪 Colación / Vianda de Trabajo</span>
                    <p className="text-muted text-[10px] leading-relaxed">
                      Este es el almuerzo para llevar (colación fría) que se entrega temprano a los trabajadores de faena.
                    </p>
                    <textarea
                      rows={2}
                      value={colacionTexto}
                      onChange={(e) => setColacionTexto(e.target.value)}
                      placeholder="Ej. Sandwich de pollo palta en pan casero, manzana fresca, galletitas de avena y jugo de fruta..."
                      className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none focus:border-terracotta transition-colors leading-relaxed shadow-2xs"
                    />
                  </div>
                </div>
              )}

              {/* CONTENIDO TAB ALMUERZO */}
              {modalTab === "almuerzo" && (
                <div className="space-y-5 animate-fade-in">
                  <span className="font-serif font-black text-orange-900 text-sm block">🍲 Opciones de Almuerzo para Huéspedes</span>
                  
                  {/* Opción 1 */}
                  <div className="space-y-3 p-4 bg-orange-50/15 border border-orange-200/50 rounded-2xl">
                    <label className="block font-bold text-orange-950 text-xs">🍲 Almuerzo - Opción Principal 1</label>
                    <input
                      type="text"
                      value={almuerzoOpcion1}
                      onChange={(e) => setAlmuerzoOpcion1(e.target.value)}
                      placeholder="Ej. Cazuela de pollo de campo caliente"
                      className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none focus:border-terracotta transition-colors shadow-2xs font-semibold"
                    />

                    {/* Uploader Opción 1 */}
                    <div className="space-y-1.5">
                      <span className="block font-bold text-ink text-[11px]">Foto Opción 1</span>
                      {almuerzoOpcion1Imagen ? (
                        <div className="relative group rounded-2xl overflow-hidden h-32 border border-sand-border shadow-xs">
                          <img src={almuerzoOpcion1Imagen} alt="Almuerzo 1" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-[#2A2418]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                            <button 
                              type="button" 
                              onClick={() => setAlmuerzoOpcion1Imagen("")}
                              className="bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-[10px] hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                            >
                              🗑️ Eliminar Foto
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-sand-border hover:border-terracotta/40 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all bg-sand-deep/5 group">
                          <span className="text-2xl group-hover:scale-110 transition-transform">📷</span>
                          <span className="font-bold text-[10.5px] text-ink mt-2">Cargar foto de Opción 1</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCargarImagenDispositivo(e, setAlmuerzoOpcion1Imagen)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Opción 2 */}
                  <div className="space-y-3 p-4 bg-orange-50/15 border border-orange-200/50 rounded-2xl">
                    <label className="block font-bold text-orange-950 text-xs">🍲 Almuerzo - Opción Alternativa 2</label>
                    <input
                      type="text"
                      value={almuerzoOpcion2}
                      onChange={(e) => setAlmuerzoOpcion2(e.target.value)}
                      placeholder="Ej. Pescado frito fresco del puerto con puré picante"
                      className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none focus:border-terracotta transition-colors shadow-2xs font-semibold"
                    />

                    {/* Uploader Opción 2 */}
                    <div className="space-y-1.5">
                      <span className="block font-bold text-ink text-[11px]">Foto Opción 2</span>
                      {almuerzoOpcion2Imagen ? (
                        <div className="relative group rounded-2xl overflow-hidden h-32 border border-sand-border shadow-xs">
                          <img src={almuerzoOpcion2Imagen} alt="Almuerzo 2" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-[#2A2418]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                            <button 
                              type="button" 
                              onClick={() => setAlmuerzoOpcion2Imagen("")}
                              className="bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-[10px] hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                            >
                              🗑️ Eliminar Foto
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-sand-border hover:border-terracotta/40 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all bg-sand-deep/5 group">
                          <span className="text-2xl group-hover:scale-110 transition-transform">📷</span>
                          <span className="font-bold text-[10.5px] text-ink mt-2">Cargar foto de Opción 2</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCargarImagenDispositivo(e, setAlmuerzoOpcion2Imagen)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENIDO TAB CENA */}
              {modalTab === "cena" && (
                <div className="space-y-5 animate-fade-in">
                  <span className="font-serif font-black text-red-900 text-sm block">🍽️ Opciones de Cena para Huéspedes</span>
                  
                  {/* Opción 1 */}
                  <div className="space-y-3 p-4 bg-red-50/15 border border-red-200/50 rounded-2xl">
                    <label className="block font-bold text-red-950 text-xs">🍽️ Cena - Opción Principal 1</label>
                    <input
                      type="text"
                      value={cenaOpcion1}
                      onChange={(e) => setCenaOpcion1(e.target.value)}
                      placeholder="Ej. Consomé casero caliente con pancito amasado"
                      className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none focus:border-terracotta transition-colors shadow-2xs font-semibold"
                    />

                    {/* Uploader Cena 1 */}
                    <div className="space-y-1.5">
                      <span className="block font-bold text-ink text-[11px]">Foto Opción 1</span>
                      {cenaOpcion1Imagen ? (
                        <div className="relative group rounded-2xl overflow-hidden h-32 border border-sand-border shadow-xs">
                          <img src={cenaOpcion1Imagen} alt="Cena 1" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-[#2A2418]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                            <button 
                              type="button" 
                              onClick={() => setCenaOpcion1Imagen("")}
                              className="bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-[10px] hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                            >
                              🗑️ Eliminar Foto
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-sand-border hover:border-terracotta/40 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all bg-sand-deep/5 group">
                          <span className="text-2xl group-hover:scale-110 transition-transform">📷</span>
                          <span className="font-bold text-[10.5px] text-ink mt-2">Cargar foto de Opción 1</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCargarImagenDispositivo(e, setCenaOpcion1Imagen)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Opción 2 */}
                  <div className="space-y-3 p-4 bg-red-50/15 border border-red-200/50 rounded-2xl">
                    <label className="block font-bold text-red-950 text-xs">🍽️ Cena - Opción Alternativa 2</label>
                    <input
                      type="text"
                      value={cenaOpcion2}
                      onChange={(e) => setCenaOpcion2(e.target.value)}
                      placeholder="Ej. Pechuga a la plancha con arroz de verduras"
                      className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none focus:border-terracotta transition-colors shadow-2xs font-semibold"
                    />

                    {/* Uploader Cena 2 */}
                    <div className="space-y-1.5">
                      <span className="block font-bold text-ink text-[11px]">Foto Opción 2</span>
                      {cenaOpcion2Imagen ? (
                        <div className="relative group rounded-2xl overflow-hidden h-32 border border-sand-border shadow-xs">
                          <img src={cenaOpcion2Imagen} alt="Cena 2" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-[#2A2418]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                            <button 
                              type="button" 
                              onClick={() => setCenaOpcion2Imagen("")}
                              className="bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-[10px] hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                            >
                              🗑️ Eliminar Foto
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-sand-border hover:border-terracotta/40 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all bg-sand-deep/5 group">
                          <span className="text-2xl group-hover:scale-110 transition-transform">📷</span>
                          <span className="font-bold text-[10.5px] text-ink mt-2">Cargar foto de Opción 2</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCargarImagenDispositivo(e, setCenaOpcion2Imagen)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* PIE DE FORMULARIO SIEMPRE VISIBLE */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-sand-border/40 mt-4">
                <div className="flex items-center gap-2 text-muted font-bold text-[10px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  IndexedDB Respaldo Activo
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowRegistrarMenuModal(false)}
                    className="flex-1 sm:flex-none bg-sand-deep/30 hover:bg-sand-deep text-ink font-semibold py-3 px-6 rounded-2xl text-xs cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoadingMenu}
                    className="flex-1 sm:flex-none bg-terracotta hover:bg-terracotta-deep text-white font-bold py-3 px-8 rounded-2xl shadow-md text-xs cursor-pointer transition-all hover:-translate-y-0.5"
                  >
                    {isLoadingMenu ? "Publicando..." : "✨ Guardar y Publicar"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
