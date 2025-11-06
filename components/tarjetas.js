// ============================================================
// 💳 tarjetas.js — Componente modular de Tarjetas
// ============================================================
// Finanzas Pro v3.2
//
// Renderiza la sección “Tarjetas” con sus dos modos:
//  - Completo: carga total y cuotas
//  - Rápido: ingreso simplificado
//
// La lógica de cálculo, cuotas y almacenamiento está en app.js.
// ============================================================

export function render(container) {
  container.innerHTML = `
    <section id="tab-gestion-tarjetas" class="tab-content">
      <h2 style="text-align:center;font-family:'Poppins',sans-serif;font-weight:700;color:#0f172a;margin-bottom:10px;">💳 Tarjetas</h2>

      <!-- Selector de modo -->
      <div class="card-mode-switch">
        <button class="mode-btn active" onclick="app.cambiarModoTarjeta('completo', event)">Modo Completo</button>
        <button class="mode-btn" onclick="app.cambiarModoTarjeta('rapido', event)">Modo Rápido</button>
      </div>

      <!-- === MODO COMPLETO === -->
      <div id="tarjetaModoCompleto">
        <div class="form-grid">
          <input type="text" id="tarjeta-nombre" placeholder="Nombre del consumo">
          <input type="text" id="tarjeta-tarjeta" placeholder="Tarjeta">
          <input type="text" id="tarjeta-monto" placeholder="Monto total" step="0.01">
          <input type="number" id="tarjeta-cuotas" placeholder="Total cuotas" min="1">
          <input type="date" id="tarjeta-fecha">
          <button class="btn btn-primary" onclick="app.agregarTarjetaCompleto()">+ Agregar</button>
        </div>
      </div>

      <!-- === MODO RÁPIDO === -->
      <div id="tarjetaModoRapido" style="display: none;">
        <div class="form-grid">
          <input type="text" id="tarjeta-nombre-rapido" placeholder="Nombre del consumo">
          <input type="text" id="tarjeta-tarjeta-rapido" placeholder="Tarjeta">
          <input type="text" id="tarjeta-cuota-rapido" placeholder="Valor cuota" step="0.01">
          <input type="number" id="tarjeta-cuotas-rapido" placeholder="Total cuotas" min="1">
          <input type="number" id="tarjeta-actual-rapido" placeholder="Cuota actual" min="1">
          <button class="btn btn-primary" onclick="app.agregarTarjetaRapido()">+ Agregar</button>
        </div>
      </div>

      <!-- Listado de tarjetas -->
      <div id="listaTarjetas" class="listado"></div>
    </section>
  `;

  // ============================================================
  // 🎨 Estilos internos (solo se inyectan una vez)
  // ============================================================
  if (!document.getElementById('style-tarjetas')) {
    const style = document.createElement('style');
    style.id = 'style-tarjetas';
    style.textContent = `
      #tab-gestion-tarjetas .form-grid {
        display: grid;
        gap: 8px;
        margin-bottom: 16px;
      }

      .card-mode-switch {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-bottom: 12px;
      }

      .mode-btn {
        background: #e2e8f0;
        color: #334155;
        border: none;
        border-radius: 8px;
        padding: 8px 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background .2s ease, transform .1s ease;
      }

      .mode-btn.active {
        background: #0ea5e9;
        color: white;
      }

      .mode-btn:hover {
        transform: translateY(-1px);
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