// informes.js - crear sección Informes con gráficos (Chart.js)
export function renderInformes(container, dataProvider) {
  // container: nodo DOM donde renderizar
  // dataProvider: función que regresa { gastosPorCategoria, ingresosVsEgresosPorMes }
  container.innerHTML = `
    <div class="informes">
      <h2>Informes</h2>
      <div class="charts">
        <canvas id="chart-pie" width="400" height="300"></canvas>
        <canvas id="chart-bar" width="600" height="300"></canvas>
      </div>
    </div>`;

  // cargar Chart.js vía CDN si no está presente
  function loadChartJs(cb) {
    if (window.Chart) return cb();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    s.onload = cb;
    document.head.appendChild(s);
  }

  loadChartJs(() => {
    const payload = dataProvider ? dataProvider() : { gastoLabels: [], gastoValues: [], meses: [], ingresos: [], egresos: [] };
    // Pie chart: gastos por categoría
    const ctxPie = document.getElementById('chart-pie').getContext('2d');
    try {
      new Chart(ctxPie, {
        type: 'pie',
        data: {
          labels: payload.gastoLabels,
          datasets: [{ data: payload.gastoValues, label: 'Gastos' }]
        }
      });
    } catch(e) { console.warn(e); }

    // Bar chart: ingresos vs egresos por mes
    const ctxBar = document.getElementById('chart-bar').getContext('2d');
    try {
      new Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: payload.meses,
          datasets: [
            { label: 'Ingresos', data: payload.ingresos },
            { label: 'Egresos', data: payload.egresos }
          ]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
      });
    } catch(e) { console.warn(e); }
  });
}
