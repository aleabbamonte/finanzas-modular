// ============================================================
// 🎯 presupuestos.js — Componente modular de Presupuestos
// ============================================================
// Finanzas Pro v3.2
//
// Renderiza la sección “Presupuestos” dentro del grupo “Metas”.
// Incluye formulario para agregar presupuestos y lista de categorías
// con progreso y alertas visuales.
// ============================================================

export function render(container) {
  container.innerHTML = `
    <section id="tab-metas-presupuestos" class="tab-content">
      <h2 style="text-align:center;font-family:'Poppins',sans-serif;font-weight:700;color:#0f172a;margin-bottom:10px;">🎯 Presupuestos</h2>

      <!-- Formulario de presupuestos -->
      <div class="form-grid">
        <select id="pres-cat"></select>
        <input type="text" id="pres-monto" placeholder="Monto límite" step="0.01">
        <button class="btn btn-primary" onclick="app.addPresupuesto()">+ Agregar Presupuesto</button>
      </div>

      <!-- Listado de presupuestos -->
      <div id="listaPresupuestos" class="listado"></div>
    </section>
  `;

  // ============================================================
  // 🎨 Estilos internos (solo se inyectan una vez)
  // ============================================================
  if (!document.getElementById('style-presupuestos')) {
    const style = document.createElement('style');
    style.id = 'style-presupuestos';
    style.textContent = `
      #tab-metas-presupuestos .form-grid {
        display: grid;
        gap: 8px;
        margin-bottom: 16px;
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
        background: white;
        padding: 14px;
        border-radius: 10px;
        margin-bottom: 10px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        position: relative;
      }

      .progress-bar {
        background: #e2e8f0;
        border-radius: 10px;
        overflow: hidden;
        height: 20px;
        margin-top: 8px;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #0ea5e9, #22d3ee);
        color: white;
        font-weight: 700;
        font-size: 12px;
        text-align: center;
        line-height: 20px;
        transition: width .4s ease;
      }

      .btn-info, .btn-danger {
        padding: 6px 10px;
        font-size: 12px;
        border-radius: 8px;
        cursor: pointer;
        border: none;
      }
      .btn-info { background: #38bdf8; color: white; }
      .btn-danger { background: #ef4444; color: white; }
    `;
    document.head.appendChild(style);
  }
}