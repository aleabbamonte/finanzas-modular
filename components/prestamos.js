// ============================================================
// 🏦 prestamos.js — Componente modular de Préstamos
// ============================================================
// Finanzas Pro v3.2
//
// Renderiza la sección “Préstamos” con sus modos Completo y Rápido,
// incluyendo el selector desplegable "Tipo" (Personal, Hipotecario, etc.).
// Toda la lógica de agregar, editar y eliminar está en app.js.
// ============================================================

export function render(container) {
  container.innerHTML = `
    <section id="tab-gestion-prestamos" class="tab-content">
      <h2 style="text-align:center;font-family:'Poppins',sans-serif;font-weight:700;color:#0f172a;margin-bottom:10px;">🏦 Préstamos</h2>

      <!-- Selector de modo -->
      <div class="card-mode-switch">
        <button class="mode-btn active" onclick="app.cambiarModoPrestamo('completo', event)">Modo Completo</button>
        <button class="mode-btn" onclick="app.cambiarModoPrestamo('rapido', event)">Modo Rápido</button>
      </div>

      <!-- === MODO COMPLETO === -->
      <div id="prestamoModoCompleto">
        <div class="form-grid">
          <input type="text" id="prestamo-nombre" placeholder="Nombre del préstamo">
          <select id="prestamo-tipo">
            <option value="">Tipo</option>
            <option value="Personal">💰 Personal</option>
            <option value="Hipotecario">🏠 Hipotecario</option>
            <option value="Financiera">🏦 Financiera</option>
            <option value="Familiar">👨‍👩‍👧‍👦 Familiar</option>
            <option value="Amigo">🤝 Amigo</option>
            <option value="Otro">📌 Otro</option>
          </select>
          <input type="text" id="prestamo-monto" placeholder="Monto total" step="0.01">
          <input type="number" id="prestamo-cuotas" placeholder="Total cuotas" min="1">
          <input type="date" id="prestamo-fecha">
          <button class="btn btn-primary" onclick="app.agregarPrestamoCompleto()">+ Agregar</button>
        </div>
      </div>

      <!-- === MODO RÁPIDO === -->
      <div id="prestamoModoRapido" style="display: none;">
        <div class="form-grid">
          <input type="text" id="prestamo-nombre-rapido" placeholder="Nombre del préstamo">
          <select id="prestamo-tipo-rapido">
            <option value="">Tipo</option>
            <option value="Personal">💰 Personal</option>
            <option value="Hipotecario">🏠 Hipotecario</option>
            <option value="Financiera">🏦 Financiera</option>
            <option value="Familiar">👨‍👩‍👧‍👦 Familiar</option>
            <option value="Amigo">🤝 Amigo</option>
            <option value="Otro">📌 Otro</option>
          </select>
          <input type="text" id="prestamo-cuota-rapido" placeholder="Valor cuota" step="0.01">
          <input type="number" id="prestamo-cuotas-rapido" placeholder="Total cuotas" min="1">
          <input type="number" id="prestamo-actual-rapido" placeholder="Cuota actual" min="1">
          <button class="btn btn-primary" onclick="app.agregarPrestamoRapido()">+ Agregar</button>
        </div>
      </div>

      <!-- Listado de préstamos -->
      <div id="listaPrestamos" class="listado"></div>
    </section>
  `;

  // ============================================================
  // 🎨 Estilos internos (solo se inyectan una vez)
  // ============================================================
  if (!document.getElementById('style-prestamos')) {
    const style = document.createElement('style');
    style.id = 'style-prestamos';
    style.textContent = `
      #tab-gestion-prestamos .form-grid {
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

      select {
        padding: 10px;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        background: #f8fafc;
        font-family: 'Poppins', sans-serif;
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