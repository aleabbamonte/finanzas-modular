// ============================================================
// 📜 historial.js — Componente modular de Historial de Actividad
// ============================================================
// Finanzas Pro v3.2
//
// Renderiza la sección “Historial” con su encabezado informativo
// y el listado de eventos registrados automáticamente por la app.
//
// La lógica de carga (mostrarHist) está implementada en app.js.
// Este módulo solo define la estructura y los estilos.
// ============================================================

export function render(container) {
  container.innerHTML = `
    <div id="tab-historial" class="tab-content">
      <!-- Banner descriptivo -->
      <div class="info-banner">
        <div>📜</div>
        <div>
          <h3>Historial de Actividad</h3>
          <p>📅 Registro automático de todas tus operaciones con fecha y hora.</p>
        </div>
      </div>

      <!-- Sección principal -->
      <div class="section">
        <div id="listaHistorial"></div>
      </div>
    </div>
  `;

  // ============================================================
  // 🎨 Estilos internos (solo se inyectan una vez)
  // ============================================================
  if (!document.getElementById('style-historial')) {
    const style = document.createElement('style');
    style.id = 'style-historial';
    style.textContent = `
      #tab-historial .info-banner {
        display: flex;
        align-items: center;
        gap: 12px;
        background: linear-gradient(90deg, #0d47a1, #00d4ff);
        color: white;
        padding: 16px 18px;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        margin-bottom: 18px;
      }

      #tab-historial .info-banner h3 {
        font-family: 'Poppins', sans-serif;
        font-weight: 700;
        font-size: 1.1rem;
        margin: 0;
      }

      #tab-historial .info-banner p {
        margin: 2px 0 0 0;
        font-size: 0.9rem;
        opacity: 0.9;
      }

      #tab-historial .section {
        background: transparent;
        padding: 10px;
      }

      #listaHistorial {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      #listaHistorial .item {
        background: white;
        padding: 12px 14px;
        border-radius: 10px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        border-left: 4px solid var(--primary, #0ea5e9);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }

      #listaHistorial .item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0,0,0,0.12);
      }

      #listaHistorial .item .fecha {
        font-size: 11px;
        color: #94a3b8;
        margin-bottom: 3px;
      }

      #listaHistorial .item .texto {
        font-size: 13px;
        color: #0f172a;
      }

      /* Animación suave al entrar */
      @keyframes fadeInHist {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      #listaHistorial .item {
        animation: fadeInHist 0.25s ease;
      }
    `;
    document.head.appendChild(style);
  }
}