// ============================================================
// 🧭 tabs.js — Componente de pestañas principales y subtabs
// ============================================================
// Finanzas Pro v3.2
//
// Responsable de renderizar las pestañas de navegación principal
// (Resumen, Gestión, Metas, Historial) y sus subpestañas.
//
// Está sincronizado con el objeto `app.tabs` en app.js
// y delega la lógica de cambio de pestañas a las funciones de app.js.
// ============================================================

export function render(container) {
  // Crear estructura base del contenedor de pestañas
  container.innerHTML = `
    <nav id="tabsContainer" style="
      display: flex;
      overflow-x: auto;
      background: white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      border-bottom: 1px solid #e5e7eb;
      scrollbar-width: none;
    ">
    </nav>
    <div id="subtabsContainer" style="
      background: #f8fafc;
      padding: 4px 0;
      overflow-x: auto;
      display: flex;
      border-bottom: 1px solid #e2e8f0;
      scrollbar-width: none;
    "></div>
  `;

  // Los elementos reales (botones de pestañas) los genera app.crearTabs()
  // al inicializar la app. Este módulo solo define la estructura base.

  // Estilos internos para los botones
  const style = document.createElement('style');
  style.textContent = `
    /* === Tabs principales === */
    #tabsContainer {
      -webkit-overflow-scrolling: touch;
    }
    #tabsContainer::-webkit-scrollbar,
    #subtabsContainer::-webkit-scrollbar {
      display: none;
    }
    .tab {
      flex: 0 0 auto;
      padding: 10px 14px;
      font-weight: 600;
      color: #475569;
      border: none;
      background: transparent;
      cursor: pointer;
      font-family: 'Poppins', sans-serif;
      font-size: 0.95rem;
      transition: color .2s ease, border-bottom .2s ease;
    }
    .tab.active {
      color: #0ea5e9;
      border-bottom: 3px solid #0ea5e9;
    }

    /* === Subtabs === */
    .subtabs {
      display: none;
      flex-wrap: nowrap;
      overflow-x: auto;
      gap: 6px;
      padding: 8px 12px;
    }
    .subtabs.active { display: flex; }

    .subtab {
      flex: 0 0 auto;
      padding: 6px 10px;
      border-radius: 8px;
      background: #e2e8f0;
      color: #334155;
      border: none;
      font-weight: 500;
      cursor: pointer;
      transition: background .2s ease, color .2s ease;
    }
    .subtab.active {
      background: #0ea5e9;
      color: white;
    }

    /* Tooltip informativo para deslizar subtabs */
    .subtabs-tooltip {
      background: #e0f2fe;
      color: #0369a1;
      font-size: 0.8rem;
      padding: 6px 10px;
      border-radius: 6px;
      margin: 4px 12px;
      text-align: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }
  `;
  document.head.appendChild(style);
}