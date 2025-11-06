// ============================================================
// 📘 app.js — Núcleo principal de Finanzas Pro v3.2
// ============================================================

import { formatearPesos, parseMonto, attachCurrencyFormatters } from './formatters.js';
import { guardarDatos, cargarDatos, exportarJSON } from './storage.js';
import { renderInformes } from '../components/informes.js';

const app = {
  meses: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  cat: {
    ing: ['💼 Sueldo','💻 Freelance','📈 Inversiones','🏠 Alquiler','🛍️ Ventas','🎁 Regalo','💰 Otros'],
    fij: ['🏠 Vivienda','💡 Servicios','📺 Suscripciones','🛡️ Seguros','🚗 Transporte','📚 Educación','📌 Otros'],
    var: ['🍽️ Alimentación','🚌 Transporte','🎬 Entretenimiento','⚕️ Salud','👕 Ropa','💄 Belleza','🐾 Mascotas','🎁 Regalos','🛍️ Otros']
  },
  tabs: [
    { id:'resumen', name:'📊 Resumen', subs:null },
    { id:'gestion', name:'💰 Gestión', subs:[
      {id:'ingresos', name:'💵 Ingresos'},
      {id:'fijos', name:'🏠 Gastos Fijos'},
      {id:'variables', name:'🛒 Gastos Variables'},
      {id:'tarjetas', name:'💳 Tarjetas'},
      {id:'prestamos', name:'🏦 Préstamos'}
    ]},
    { id:'metas', name:'🎯 Metas', subs:[
      {id:'ahorros', name:'🐷 Ahorros'},
      {id:'presupuestos', name:'🎯 Presupuestos'}
    ]},
    { id:'informes', name:'📈 Informes', subs:null },
    { id:'historial', name:'📜 Historial', subs:null }
  ],
  activeTab: 'resumen',
  datos: { ing:{}, fij:{}, var:{}, tarjetas:[], prestamos:[], metas:{}, aho:{}, pres:{}, hist:[], tipoCambio: 1350 },

  // ============================================================
  // 🔢 Manejadores de valores y formato
  // ============================================================
  formatearPesos, parseMonto,

  attachCurrencyFormatters() {
    attachCurrencyFormatters([
      'ing-monto','fij-monto','var-monto','tarjeta-monto','tarjeta-cuota-rapido',
      'prestamo-monto','prestamo-cuota-rapido','meta-monto','aho-monto','pres-monto'
    ]);
  },

  convertirARS(monto, moneda) {
    return (moneda === 'USD') ? monto * this.datos.tipoCambio : monto;
  },

  guardarTipoCambio() {
    const input = document.getElementById('tipoCambio');
    if (!input) return;
    const tc = parseFloat(input.value);
    if (tc && tc > 0) {
      this.datos.tipoCambio = tc;
      this.guardar();
      if (this.actualizar) this.actualizar();
    }
  },

  async actualizarDolar() {
    const btn = event?.target;
    if (btn) { btn.innerHTML = '⏳'; btn.disabled = true; }
    try {
      const res = await fetch('https://dolarapi.com/v1/dolares/blue');
      if (!res.ok) throw new Error('Error al obtener cotización');
      const data = await res.json();
      const valor = data.venta;
      const input = document.getElementById('tipoCambio');
      if (input) input.value = valor;
      this.datos.tipoCambio = valor;
      this.guardar();
      if (this.actualizar) this.actualizar();
      alert(`✅ Dólar actualizado: $${valor.toFixed(2)}`);
    } catch (err) {
      alert('❌ No se pudo obtener el valor del dólar.');
      console.error(err);
    } finally {
      if (btn) { btn.innerHTML = '🔄'; btn.disabled = false; }
    }
  },

  // ============================================================
  // 🗓️ Selects
  // ============================================================
  llenarSelects() {
    const mSel = document.getElementById('mesActual');
    if (mSel) this.meses.forEach((m,i)=>{ const o=document.createElement('option'); o.value=i;o.textContent=m;mSel.appendChild(o); });
    const aSel = document.getElementById('anioActual');
    if (aSel) for(let y=2020;y<=2050;y++){ const o=document.createElement('option');o.value=y;o.textContent=y;aSel.appendChild(o); }
  },

  // ============================================================
  // 📊 Informes
  // ============================================================
  obtenerDatosParaGraficos() {
    const mk = this.getMes?.() || '';
    const varData = this.datos.var[mk] || [];
    const gastosPorCat = {};
    varData.forEach(v => {
      gastosPorCat[v.cat] = (gastosPorCat[v.cat]||0) + this.convertirARS(v.monto, v.moneda||'ARS');
    });
    const gastoLabels = Object.keys(gastosPorCat);
    const gastoValues = Object.values(gastosPorCat);
    const meses = Object.keys(this.datos.ing);
    const ingresos = meses.map(m => (this.datos.ing[m]||[]).reduce((s,i)=>s+i.monto,0));
    const egresos = meses.map(m => {
      const f=(this.datos.fij[m]||[]).reduce((s,i)=>s+i.monto,0);
      const v=(this.datos.var[m]||[]).reduce((s,i)=>s+i.monto,0);
      return f+v;
    });
    return { gastoLabels,gastoValues,meses,ingresos,egresos };
  },

  // ============================================================
  // 📜 Historial
  // ============================================================
  mostrarHist() {
    const c = document.getElementById('listaHistorial');
    if (!c) return;
    if (!this.datos.hist || this.datos.hist.length === 0) {
      c.innerHTML = `<p style="text-align:center;color:var(--text-light);padding:30px;font-size:13px;">No hay actividad registrada</p>`;
      return;
    }
    c.innerHTML = this.datos.hist.slice(0,30).map(h => `
      <div style="background:var(--bg);padding:14px;border-radius:8px;border-left:4px solid var(--primary);margin-bottom:10px;">
        <div style="font-size:11px;color:var(--text-light);margin-bottom:4px;">${h.fecha}</div>
        <div style="font-size:13px;color:var(--text);">${h.txt}</div>
      </div>`).join('');
  },

  // ============================================================
  // 🔄 Actualizar (resumen simple)
  // ============================================================
  actualizar() {
    const resDiv = document.getElementById('resumenCards');
    if (!resDiv) return;
    resDiv.innerHTML = `<div style="text-align:center;color:var(--text-light);padding:20px;">Datos cargados correctamente ✅</div>`;
  },

  // ============================================================
  // 🚀 Inicialización
  // ============================================================
  init() {
    console.log('🧩 app.init() ejecutado');
    const hoy = new Date();
    this.llenarSelects();
    const mes = document.getElementById('mesActual');
    const anio = document.getElementById('anioActual');
    if (mes) mes.value = hoy.getMonth();
    if (anio) anio.value = hoy.getFullYear();
    this.cargarDatos();
    const tc = document.getElementById('tipoCambio');
    if (tc) tc.value = this.datos.tipoCambio;
    this.attachCurrencyFormatters();
    if (this.actualizar) this.actualizar();
  },

  // ============================================================
  // 💾 Persistencia
  // ============================================================
  guardar() {
    try {
      const pin = localStorage.getItem('app_pin');
      guardarDatos(this.datos, pin);
    } catch(e){ console.error(e); }
  },

  cargarDatos() {
    try {
      const guardado = cargarDatos(localStorage.getItem('app_pin'));
      if (guardado) this.datos = guardado;
    } catch(e){ console.error(e); }
  },

  exportar() { exportarJSON(this.datos); }
};

window.app = app;
