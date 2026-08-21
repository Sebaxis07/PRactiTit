import Link from "next/link";
import { Navbar } from "@/shared/components/Navbar";
import { Footer } from "@/shared/components/Footer";

export const metadata = {
  title: "Términos y Condiciones · Pensión Señora Myriam",
  description: "Términos y condiciones de reserva, estadía y alimentación en Caleta Paposo, Región de Antofagasta, Chile.",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-sand text-ink flex flex-col justify-between font-sans selection:bg-terracotta selection:text-white">
      {/* Navbar Header */}
      <Navbar />

      <main className="w-full max-w-4xl mx-auto pt-28 pb-16 px-4 sm:px-6">
        <div className="bg-card border border-sand-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
          
          {/* Cabecera de la Página */}
          <div className="border-b border-sand-border/60 pb-6 text-center sm:text-left space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-terracotta bg-terracotta/10 px-3 py-1 rounded-full">
              Pensión Señora Myriam
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-ink">
              Términos y Condiciones de Reserva y Estadía
            </h1>
            <p className="text-[#7A6F5A] text-xs sm:text-sm font-medium">
              Caleta Paposo, Región de Antofagasta, Chile · Última actualización: Agosto 2026
            </p>
          </div>

          {/* Cuerpo del Contenido */}
          <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-ink/90 font-normal">
            
            <section className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-ink">1. Objeto del servicio</h2>
              <p>
                La Pensión Señora Myriam ofrece servicios de hospedaje en piezas privadas e independientes, así como alimentación casera (desayunos, almuerzos, cenas y colaciones para faena).
              </p>
              <p>
                El sistema web de reservas permite a los clientes solicitar estadías, asociar servicios de alimentación y consultar el estado de sus reservas en línea, sin reemplazar la atención directa de la Sra. Myriam.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-ink">2. Uso del sistema de reservas</h2>
              <p className="font-semibold text-ink">2.1. El sistema web permite:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ver disponibilidad aproximada de piezas por fecha.</li>
                <li>Registrar solicitudes de reserva de hospedaje.</li>
                <li>Seleccionar o asociar planes de alimentación casera.</li>
                <li>Descargar comprobantes de reserva en formato PDF.</li>
                <li>Consultar el estado de la reserva mediante código único.</li>
              </ul>
              <p>
                <strong>2.2.</strong> La confirmación definitiva de la reserva se realiza cuando la Sra. Myriam valida la solicitud (por sistema o por contacto directo). Hasta ese momento, la reserva tiene estado “Pendiente”.
              </p>
              <p>
                <strong>2.3.</strong> La información de disponibilidad se actualiza en función de las reservas registradas. Sin embargo, en caso de discrepancias por situaciones imprevistas (por ejemplo, fallas de conectividad o cambios de último minuto), prevalece la confirmación que entregue la administración de la pensión.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-ink">3. Código de reserva y portal del huésped</h2>
              <p>
                <strong>3.1.</strong> Cada reserva confirmada cuenta con un código único de reserva en formato <span className="font-mono font-bold text-terracotta">RES-AAAA-XXXXXX</span>.
              </p>
              <p className="font-semibold text-ink">3.2. El cliente debe conservar ese código, ya que permite:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Consultar detalles de la estadía (fechas, habitación, servicios incluidos).</li>
                <li>Ver el menú del día asociado a su estadía.</li>
                <li>Enviar solicitudes de cambio dentro de las reglas establecidas.</li>
                <li>Re-descargar el comprobante PDF.</li>
              </ul>
              <p>
                <strong>3.3.</strong> El acceso al portal del huésped se realiza mediante código de reserva y datos de contacto (por ejemplo, teléfono o nombre). El cliente es responsable de no compartir esos datos con terceros no autorizados.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-ink">4. Cambios y cancelaciones de reserva</h2>
              <p className="font-semibold text-ink">4.1. Cambios de fechas de estadía:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Pueden solicitarse hasta 24 horas antes del horario de check‑in original.</li>
                <li>Cambios posteriores a ese plazo deben coordinarse directamente con la Sra. Myriam por teléfono o WhatsApp y quedan sujetos a disponibilidad y acuerdo entre las partes.</li>
              </ul>
              <p className="font-semibold text-ink">4.2. Cancelaciones:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Las cancelaciones realizadas con al menos 24 horas de anticipación al check‑in no generan cobro por penalidad.</li>
                <li>Las cancelaciones dentro de las 24 horas previas al check‑in pueden implicar cobro parcial o total de la primera noche, según acuerdo con la administración.</li>
              </ul>
              <p className="font-semibold text-ink">4.3. No presentación (no show):</p>
              <p>
                En caso de que el cliente no se presente en la fecha acordada sin aviso previo, la pieza puede ser liberada para otros huéspedes, y la pensión se reserva el derecho de aplicar cobros por los servicios comprometidos.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-ink">5. Gestión de alimentación casera</h2>
              <p className="font-semibold text-ink">5.1. El sistema permite asociar a la reserva servicios de alimentación, tales como:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Desayuno.</li>
                <li>Almuerzo casero.</li>
                <li>Cena.</li>
                <li>Colaciones/viandas para faena.</li>
              </ul>
              <p>
                <strong>5.2.</strong> El menú del día es definido por la Sra. Myriam y puede incluir diferentes opciones (por ejemplo, cazuela de pollo, pescado frito, sopa casera), sujetas a disponibilidad de insumos.
              </p>
              <p className="font-semibold text-ink">5.3. El cliente puede:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ver el menú disponible para los días de su estadía.</li>
                <li>Expresar preferencias entre las opciones ofrecidas.</li>
                <li>Renunciar a ciertos servicios (ej. “no cenaré hoy”) para evitar desperdicios.</li>
              </ul>
              <p className="font-semibold text-ink">5.4. Cambios en servicios de comida:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Deben registrarse con al menos 4 horas de anticipación al horario del servicio correspondiente (desayuno, almuerzo, cena).</li>
                <li>Solicitudes posteriores pueden ser registradas como mensaje, pero su cumplimiento queda sujeto a la capacidad de la cocina en ese momento.</li>
              </ul>
              <p>
                <strong>5.5.</strong> Por la naturaleza de la cocina casera y la disponibilidad local de insumos, el menú puede variar sin previo aviso. Ante cambios de plato principal, se ofrecerá siempre una alternativa razonable del mismo valor o similar.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-ink">6. Responsabilidades del cliente</h2>
              <p className="font-semibold text-ink">6.1. El cliente se compromete a:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Entregar datos reales y actualizados al realizar la reserva (nombre, teléfono, empresa si aplica).</li>
                <li>Respetar los horarios de check‑in y check‑out informados.</li>
                <li>Avisar con anticipación si no va a utilizar un servicio de comida incluido.</li>
                <li>Tratar las instalaciones y habitaciones con cuidado, y respetar normas básicas de convivencia.</li>
              </ul>
              <p>
                <strong>6.2.</strong> En caso de daños significativos a las instalaciones o mobiliario, la pensión podrá acordar cobros adicionales para cubrir reparaciones.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-ink">7. Responsabilidades de la Pensión Señora Myriam</h2>
              <p className="font-semibold text-ink">7.1. La pensión se compromete a:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Entregar la habitación en condiciones de limpieza adecuadas.</li>
                <li>Ofrecer los servicios de alimentación contratados, en los horarios y condiciones informadas, dentro de lo razonablemente posible.</li>
                <li>Informar oportunamente de cambios relevantes (por ejemplo, problemas de agua, luz o acceso).</li>
              </ul>
              <p>
                <strong>7.2.</strong> Dado el contexto rural y costero, pueden presentarse situaciones fuera del control directo de la pensión (cortes de energía, problemas de conectividad, dificultades climáticas). En esos casos, se intentará siempre buscar soluciones de buena fe con el huésped.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-ink">8. Uso del sistema web y limitaciones</h2>
              <p>
                <strong>8.1.</strong> El sistema web se ofrece como apoyo digital para facilitar la reserva y gestión operativa, pero no reemplaza el contacto humano ni la capacidad de decisión final de la administración.
              </p>
              <p>
                <strong>8.2.</strong> En caso de discrepancias entre lo que refleja el sistema y la realidad operativa (por ejemplo, disponibilidad de insumos o habitaciones), prevalecerá la información que entregue la Sra. Myriam.
              </p>
              <p>
                <strong>8.3.</strong> La pensión no garantiza disponibilidad ininterrumpida del sistema web, especialmente considerando la conectividad inestable de la localidad. Ante fallas técnicas, se recomienda contactar directamente por teléfono o WhatsApp.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-ink">9. Tratamiento de datos personales</h2>
              <p className="font-semibold text-ink">9.1. Los datos ingresados en el sistema (nombre, teléfono, correo, empresa, RUT/pasaporte) se utilizan exclusivamente para:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Gestionar reservas de hospedaje y alimentación.</li>
                <li>Generar comprobantes y/o cuentas para empresas.</li>
                <li>Facilitar comunicación directa con el cliente (recordatorios, aclaraciones).</li>
              </ul>
              <p>
                <strong>9.2.</strong> La pensión no vende ni comparte estos datos con terceros ajenos a la operación del negocio, salvo obligación legal o petición expresa del cliente (por ejemplo, reporte a empresa contratista).
              </p>
              <p>
                <strong>9.3.</strong> El cliente puede solicitar la modificación o eliminación de sus datos de contacto del sistema, siempre que no existan obligaciones pendientes (reservas activas, cobros no resueltos).
              </p>
            </section>

            <section id="cookies" className="space-y-3 bg-sand-deep/20 p-5 rounded-2xl border border-sand-border/80 scroll-mt-28">
              <h2 className="text-lg font-serif font-bold text-ink flex items-center gap-2">
                <span>🍪</span> 10. Política de Cookies y Almacenamiento Local
              </h2>
              <p>
                <strong>10.1. Cookies estrictamente necesarias:</strong> Nuestro sistema web utiliza cookies técnicas esenciales (tales como identificadores de sesión cifrados para el acceso administrativo) con el único fin de permitir el funcionamiento seguro y la autenticación autorizada de la plataforma.
              </p>
              <p>
                <strong>10.2. Almacenamiento local (PWA e IndexedDB):</strong> Para garantizar la continuidad operativa en la zona costera de Caleta Paposo ante eventuales interrupciones de conectividad a internet, el sistema utiliza almacenamiento local en el navegador del dispositivo para almacenar minutas de cocina, planificación de colaciones y sincronización en segundo plano.
              </p>
              <p>
                <strong>10.3. Ausencia de rastreo publicitario:</strong> Pensión Señora Myriam no emplea cookies de terceros con propósitos publicitarios, seguimiento entre sitios ni venta de información a redes comerciales.
              </p>
              <p>
                <strong>10.4. Gestión de preferencias:</strong> El usuario puede configurar o eliminar las cookies y datos locales directamente desde la configuración de su navegador web en cualquier momento.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-ink">11. Acceso administrativo</h2>
              <p>
                <strong>11.1.</strong> El acceso al panel administrativo está limitado al personal autorizado de la pensión (Sra. Myriam y las personas que ella designe).
              </p>
              <p>
                <strong>11.2.</strong> El sistema utiliza credenciales de acceso (correo y contraseña), y las cuentas administrativas no deben compartirse con personas externas.
              </p>
              <p>
                <strong>11.3.</strong> La administración puede, en cualquier momento, actualizar tarifas, menús, reglas de cambio y disponibilidad de habitaciones desde el panel, sin necesidad de modificar el código fuente del sistema.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-serif font-bold text-ink">12. Aceptación de los Términos</h2>
              <p>
                <strong>12.1.</strong> Al realizar una reserva mediante el sistema web, al confirmar una reserva por teléfono/WhatsApp usando los datos generados por el sistema, o al hacer uso de los servicios de hospedaje y alimentación, el cliente declara haber leído y aceptado estos Términos y Condiciones.
              </p>
              <p>
                <strong>12.2.</strong> La pensión puede actualizar estos términos para reflejar cambios en políticas, regulación aplicable o funcionamiento del sistema. Las versiones actualizadas se publicarán en el sitio web.
              </p>
            </section>

          </div>

          {/* Botón de Retorno */}
          <div className="pt-6 border-t border-sand-border/60 flex justify-center">
            <Link
              href="/"
              className="bg-terracotta hover:bg-terracotta-deep text-white font-semibold px-8 py-3 rounded-full shadow-md text-xs sm:text-sm transition-all"
            >
              🏠 Volver al Inicio
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
