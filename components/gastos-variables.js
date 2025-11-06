// ============================================================
// 🛒 gastos-variables.js — Componente modular de Gastos Variables
// ============================================================
// Finanzas Pro v3.2
//
// Renderiza la sección “Gastos Variables” con su formulario,
// selector de color, selector de moneda y lista de registros.
// Usa la misma lógica central de app.js (add, editar, eliminar).
// ============================================================

export function render(container) {
  container.innerHTML = `
    <section id="tab-gestion-variables" class="tab-content">
      <h2 style="text-align:center;font-family:'Poppins',sans-serif;font-weight:700;color:#0f172a;margin-bottom:10px;">🛒 Gastos Variables</h2>

      <!-- Formulario de gastos variables -->
      <div class="form-grid">
        <input type="text" id="var-nombre" placeholder="Nombre del gasto">
        <input type="text" id="var-monto" placeholder="Monto" step="0.01">
        <select id="var-cat"></select>

        <!-- Selector de color -->
        <input type="hidden" id="var-color" value="#0ea5e9">
        <div class="color-picker">
          <div class="color-option" style="background:#0ea5e9;" onclick="app.seleccionarColor('var','#0ea5e9',event)"></div>
          <div class="color-option" style="background:#22c55e;" onclick="app.seleccionarColor('var','#22c55e',event)"></div>
          <div class="color-option" style="background:#f59e0b;" onclick="app.seleccionarColor('var','#f59e0b',event)"></div>
          <div class="color-option" style="background:#e11d48;" onclick="app.seleccionarColor('var','#e11d48',event)"></div>
          <div class="color-option" style="background:#6366f1;" onclick="app.seleccionarColor('var','#6366f1',event)"></div>
        </div>

        <select id="var-moneda">
          <option value="ARS">ARS</option>
          <option value="USD">USD</option>
        </select>

        <button class="btn btn-primary" onclick="app.add('var')">+ Agregar</button>
      </div>

      <!-- Lista de gastos variables -->
      <div id="lista-var" class="listado"></div>
    </section>
  `;

  // Inserta estilos internos si no existen aún
  if (!document.getElementById('style-variables')) {
    const style = document.createElement('style');
    style.id = 'style-variables';
    style.textContent = `
      #tab-gestion-variables .form-grid {
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