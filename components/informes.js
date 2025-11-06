// ============================================================
// 📊 informes.js — Componente modular de Informes
// ============================================================
// Finanzas Pro v3.2
//
// Renderiza la sección “Informes” con gráficos de torta y barras.
// Usa Chart.js desde CDN y recibe los datos mediante un dataProvider().
// ============================================================

export function renderInformes(container, dataProvider) {
  container.innerHTML = `
    <section id="tab-informes" class="tab-content informes">
      <h2 style="text-align:center;font-family:'Poppins',sans-serif;
          font-weight:700;color:#0f172a;margin-bottom:10px;">📊 Informes</h2>

      <p style="text-align:center;color:#475569;margin-bottom:20px;">
        Visualizá tus ingresos y gastos de forma clara y comparativa.
      </p>

      <div class="charts">
        <div class="chart-card">
          <h3>Distribución de gastos por categoría</h3>
          <canvas id="chart-pie" width="380" height="280"></canvas>
        </div>

        <div class="chart-card">
          <h3>Ingresos vs Egresos por mes</h3>
          <canvas id="chart-bar" width="520" height="300"></canvas>
        </div>
      </div>
    </section>
  `;

  // ------------------------------------------------------------
  // 🎨 Estilos internos (solo una vez)
  // ------------------------------------------------------------
  if (!document.getElementById('style-informes')) {
    const style = document.createElement('style');
    style.id = 'style-informes';
    style.textContent = `
      .informes {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        padding-bottom: 30px;
      }

      .charts {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 30px;
        width: 100%;
      }

      .chart-card {
        background: white;
        padding: 20px;
        border-radius: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        max-width: 520px;
        width: 100%;
        transition: transform .2s ease;
      }

      .chart-card:hover {
        transform: translateY(-3px);
      }

      .chart-card h3 {
        text-align: center;
        font-size: 1rem;
        color: #0f172a;
        margin-bottom: 10px;
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }

  // ------------------------------------------------------------
  // 📦 Cargar Chart.js desde CDN si no está presente
  // ------------------------------------------------------------
  function loadChartJs(cb) {
    if (window.Chart) return cb();
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = cb;
    document.head.appendChild(script);
  }

  // ------------------------------------------------------------
  // 🧮 Renderizado de gráficos
  // ------------------------------------------------------------
  loadChartJs(() => {
    const payload = dataProvider
      ? dataProvider()
      : { gastoLabels: [], gastoValues: [], meses: [], ingresos: [], egresos: [] };

    // === Pie chart: gastos por categoría ===
    const ctxPie = document.getElementById('chart-pie')?.getContext('2d');
    if (ctxPie) {
      try {
        new Chart(ctxPie, {
          type: 'doughnut',
          data: {
            labels: payload.gastoLabels,
            datasets: [{
              data: payload.gastoValues,
              backgroundColor: [
                '#0ea5e9','#22c55e','#f59e0b','#e11d48','#6366f1','#9333ea','#14b8a6'
              ],
              borderWidth: 1
            }]
          },
          options: {
            plugins: {
              legend: { position: 'bottom' }
            }
          }
        });
      } catch (e) { console.warn('Pie chart error:', e); }
    }

    // === Bar chart: ingresos vs egresos por mes ===
    const ctxBar = document.getElementById('chart-bar')?.getContext('2d');
    if (ctxBar) {
      try {
        new Chart(ctxBar, {
          type: 'bar',
          data: {
            labels: payload.meses,
            datasets: [
              {
                label: 'Ingresos',
                data: payload.ingresos,
                backgroundColor: 'rgba(14,165,233,0.7)'
              },
              {
                label: 'Egresos',
                data: payload.egresos,
                backgroundColor: 'rgba(239,68,68,0.7)'
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true, grid: { color: '#e2e8f0' } },
              x: { grid: { display: false } }
            },
            plugins: {
              legend: { position: 'bottom' },
              tooltip: { mode: 'index', intersect: false }
            }
          }
        });
      } catch (e) { console.warn('Bar chart error:', e); }
    }
  });
}