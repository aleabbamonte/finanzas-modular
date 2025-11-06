// ============================================================
// 🐷 ahorros.js — Componente modular de Ahorros y Metas
// ============================================================
// Finanzas Pro v3.2
//
// Renderiza la sección “Ahorros” con el formulario de metas y ahorros,
// la lista de registros, y la barra de progreso.
// La lógica de cálculo y renderizado dinámico está en app.js.
// ============================================================

export function render(container) {
  container.innerHTML = `
    <section id="tab-metas-ahorros" class="tab-content">
      <h2 style="text-align:center;font-family:'Poppins',sans-serif;font-weight:700;color:#0f172a;margin-bottom:10px;">🐷 Ahorros & Metas</h2>

      <!-- Formulario de metas -->
      <div style="margin-bottom:20px;">
        <h3 style="font-size:1rem;color:#0f172a;margin-bottom:8px;">🎯 Meta nueva</h3>
        <div class="form-grid">
          <input type="text" id="meta-nombre" placeholder="Nombre de la meta">
          <input type="text" id="meta-monto" placeholder="Monto objetivo" step="0.01">
          <button class="btn btn-primary" onclick="app.addMeta()">+ Agregar Meta</button>
        </div>
      </div>

      <!-- Formulario de ahorros -->
      <div style="margin-bottom:20px;">
        <h3 style="font-size:1rem;color:#0f172a;margin-bottom:8px;">💰 Ahorro nuevo</h3>
        <div class="form-grid">
          <input type="text" id="aho-nombre" placeholder="Nombre del ahorro">
          <input type="text" id="aho-monto" placeholder="Monto ahorrado" step="0.01">
          <button class="btn btn-primary" onclick="app.addAhorro()">+ Agregar Ahorro</button>
        </div>
      </div>

      <!-- Progreso de metas -->
      <div id="progresoAhorro" class="progreso-container"></div>

      <!-- Listado de metas y ahorros -->
      <div id="lista-aho" class="listado"></div>
    </section>
  `;

  // ============================================================
  // 🎨 Estilos internos (solo se inyectan una vez)
  // ============================================================
  if (!document.getElementById('style-ahorros')) {
    const style = document.createElement('style');
    style.id = 'style-ahorros';
    style.textContent = `
      #tab-metas-ahorros .form-grid {
        display: grid;
        gap: 8px;
        margin-bottom: 12px;
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

      .listado .item .btn-info,
      .listado .item .btn-danger {
        padding: 6px 10px;
        font-size: 12px;
        border-radius: 8px;
        cursor: pointer;
        border: none;
      }

      .btn-info {
        background: #38bdf8;
        color: white;
      }
      .btn-danger {
        background: #ef4444;
        color: white;
      }

      .progreso-container {
        background: #f1f5f9;
        padding: 10px 14px;
        border-radius: 10px;
        margin: 20px 0;
        box-shadow: inset 0 1px 4px rgba(0,0,0,0.05);
      }

      .progress-bar {
        background: #e2e8f0;
        border-radius: 10px;
        overflow: hidden;
        height: 24px;
        margin-top: 8px;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #0ea5e9, #22d3ee);
        text-align: center;
        font-size: 12px;
        color: white;
        font-weight: 700;
        line-height: 24px;
        transition: width .4s ease;
      }
    `;
    document.head.appendChild(style);
  }
}