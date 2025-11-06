// ============================================================
// 🏠 gastos-fijos.js — Componente modular de Gastos Fijos
// ============================================================
// Finanzas Pro v3.2
//
// Renderiza la sección de “Gastos Fijos” con su formulario, color picker,
// selector de moneda y lista de registros. 
//
// El componente define solo la estructura visual;
// la lógica sigue delegada en app.js (add, editar, eliminar, etc.)
// ============================================================

export function render(container) {
  container.innerHTML = `
    <section id="tab-gestion-fijos" class="tab-content">
      <h2 style="text-align:center;font-family:'Poppins',sans-serif;font-weight:700;color:#0f172a;margin-bottom:10px;">🏠 Gastos Fijos</h2>

      <!-- Formulario de gastos fijos -->
      <div class="form-grid">
        <input type="text" id="fij-nombre" placeholder="Nombre del gasto">
        <input type="text" id="fij-monto" placeholder="Monto" step="0.01">
        <select id="fij-cat"></select>

        <!-- Selector de color -->
        <input type="hidden" id="fij-color" value="#0ea5e9">
        <div class="color-picker">
          <div class="color-option" style="background:#0ea5e9;" onclick="app.seleccionarColor('fij','#0ea5e9',event)"></div>
          <div class="color-option" style="background:#22c55e;" onclick="app.seleccionarColor('fij','#22c55e',event)"></div>
          <div class="color-option" style="background:#f59e0b;" onclick="app.seleccionarColor('fij','#f59e0b',event)"></div>
          <div class="color-option" style="background:#e11d48;" onclick="app.seleccionarColor('fij','#e11d48',event)"></div>
          <div class="color-option" style="background:#6366f1;" onclick="app.seleccionarColor('fij','#6366f1',event)"></div>
        </div>

        <select id="fij-moneda">
          <option value="ARS">ARS</option>
          <option value="USD">USD</option>
        </select>

        <button class="btn btn-primary" onclick="app.add('fij')">+ Agregar</button>
      </div>

      <!-- Lista de gastos fijos -->
      <div id="lista-fij" class="listado"></div>
    </section>
  `;

  // Inserta estilos internos si no existen aún
  if (!document.getElementById('style-fijos')) {
    const style = document.createElement('style');
    style.id = 'style-fijos';
    style.textContent = `
      #tab-gestion-fijos .form-grid {
        display: grid;
        gap: 8px;
        margin-bottom: 16px;
      }

      .color-picker {
        display: flex;
        gap: 6px;
        justify-content: center;
        padding: 4px 0;
      }

      .color-option {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: transform .15s ease, box-shadow .15s ease;
      }

      .color-option:hover {
        transform: scale(1.1);
        box-shadow: 0 0 0 3px rgba(0,0,0,0.15);
      }

      .color-option.selected {
        box-shadow: 0 0 0 3px #0ea5e9;
      }

      .btn.btn-primary {
        background: #0ea5e9;
        color: white;
        border: none;
        padding: 10px 14px;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        font-family: 'Poppins', sans-serif;
        transition: background .2s ease, transform .1s ease;
      }

      .btn.btn-primary:hover {
        background: #0284c7;
        transform: translateY(-1px);
      }

      .listado .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: white;
        padding: 10px 12px;
        border-radius: 8px;
        margin-bottom: 8px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      }

      .item-amount {
        font-weight: 700;
        color: #0f172a;
      }
    `;
    document.head.appendChild(style);
  }
}