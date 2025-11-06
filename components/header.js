// header.js — Componente de encabezado (Finanzas Pro v3.2)
export function render(container) {
  container.innerHTML = `
    <header style="
      background: linear-gradient(90deg, #0d47a1, #00d4ff);
      color: white;
      padding: 16px 20px;
      font-family: 'Poppins', sans-serif;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    ">
      <div style="display:flex; align-items:center; gap:10px;">
        <img src="./img/logo.png" alt="Finanzas Pro" style="height:36px; width:auto; border-radius:8px;">
        <span style="font-weight:700; font-size:1.2rem;">Finanzas Pro</span>
      </div>
      <div style="font-size:0.9rem; opacity:0.85;">v3.2</div>
    </header>
  `;
}