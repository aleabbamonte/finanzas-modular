// resumen.js — Componente “Resumen” temporal (v3.2)
export function render(container) {
  container.innerHTML = `
    <div style="
      padding: 40px;
      text-align: center;
      color: #0f172a;
      font-family: 'Poppins', sans-serif;
    ">
      <h2 style="font-weight:700;">📊 Panel de Resumen</h2>
      <p style="color:#64748b;">
        Tu resumen mensual aparecerá aquí una vez que los módulos se sincronicen correctamente.
      </p>
    </div>
  `;
}
