// app.js - módulo principal (Entry). Importa utilidades y pin manager.
import { formatearPesos, parseMonto, attachCurrencyFormatters } from './formatters.js';
import { guardarDatos, cargarDatos, exportarJSON } from './storage.js';
import { setupPinAutoInit } from './pin.js';

// ========== SISTEMA DE PIN ==========
const pinManager = {
    currentPin: '',
    storedPin: null,
    confirmPin: '',
    mode: 'setup',
    
    init() {
        this.storedPin = localStorage.getItem('app_pin');
        if (this.storedPin) {
            this.mode = 'login';
            document.getElementById('pinTitle').textContent = 'Ingresa tu PIN';
            document.getElementById('pinSubtitle').textContent = 'Desbloquea tu app financiera';
        } else {
            this.mode = 'setup';
            document.getElementById('pinTitle').textContent = 'Configura tu PIN';
            document.getElementById('pinSubtitle').textContent = 'Crea un PIN de 4 dígitos para proteger tus datos';
        }
    },
    
    addDigit(digit) {
        if (this.currentPin.length < 4) {
            this.currentPin += digit;
            this.updateDots();
            if (this.currentPin.length === 4) {
                setTimeout(() => this.processPin(), 300);
            }
        }
    },
    
    deleteDigit() {
        this.currentPin = this.currentPin.slice(0, -1);
        this.updateDots();
        document.getElementById('pinError').textContent = '';
    },
    
    updateDots() {
        const dots = document.querySelectorAll('.pin-dot');
        dots.forEach((dot, index) => {
            if (index < this.currentPin.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    },
    
    processPin() {
        if (this.mode === 'setup') {
            this.confirmPin = this.currentPin;
            this.currentPin = '';
            this.mode = 'confirm';
            document.getElementById('pinTitle').textContent = 'Confirma tu PIN';
            document.getElementById('pinSubtitle').textContent = 'Ingresa nuevamente el PIN';
            this.updateDots();
        } else if (this.mode === 'confirm') {
            if (this.currentPin === this.confirmPin) {
                localStorage.setItem('app_pin', this.currentPin);
                this.unlockApp();
            } else {
                document.getElementById('pinError').textContent = '❌ Los PINs no coinciden. Intenta de nuevo.';
                this.currentPin = '';
                this.confirmPin = '';
                this.mode = 'setup';
                document.getElementById('pinTitle').textContent = 'Configura tu PIN';
                document.getElementById('pinSubtitle').textContent = 'Crea un PIN de 4 dígitos';
                setTimeout(() => {
                    this.updateDots();
                    document.getElementById('pinError').textContent = '';
                }, 2000);
            }
        } else if (this.mode === 'login') {
            if (this.currentPin === this.storedPin) {
                this.unlockApp();
            } else {
                document.getElementById('pinError').textContent = '❌ PIN incorrecto';
                this.currentPin = '';
                setTimeout(() => {
                    this.updateDots();
                    document.getElementById('pinError').textContent = '';
                }, 1500);
            }
        }
    },
    
    unlockApp() {
        document.getElementById('pinScreen').style.display = 'none';
        document.querySelector('.container').style.display = 'block';
        app.init();
    }
};

const app = {
            meses: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
            cat: {
                ing: ['💼 Sueldo','💻 Freelance','📈 Inversiones','🏠 Alquiler','🛍️ Ventas','🎁 Regalo','💰 Otros'],
                fij: ['🏠 Vivienda','💡 Servicios','📺 Suscripciones','🛡️ Seguros','🚗 Transporte','📚 Educación','📌 Otros'],
                var: ['🍽️ Alimentación','🚌 Transporte','🎬 Entretenimiento','⚕️ Salud','👕 Ropa','💄 Belleza','🐾 Mascotas','🎁 Regalos','🛍️ Otros']
            },
            tabs: [
                {id:'resumen', name:'📊 Resumen', subs:null},
                {id:'gestion', name:'💰 Gestión', subs:[
                    {id:'ingresos', name:'💵 Ingresos'},
                    {id:'fijos', name:'🏠 Gastos Fijos'},
                    {id:'variables', name:'🛒 Gastos Variables'},
                    {id:'tarjetas', name:'💳 Tarjetas'},
                    {id:'prestamos', name:'🏦 Préstamos'}
                ]},
                {id:'metas', name:'🎯 Metas', subs:[
                    {id:'ahorros', name:'🐷 Ahorros'},
                    {id:'presupuestos', name:'🎯 Presupuestos'}
                ]},
                {id:'historial', name:'📜 Historial', subs:null}
            ],
            activeTab: 'resumen',
            activeSub: null,
            datos: { ing:{}, fij:{}, var:{}, tarjetas:[], prestamos:[], metas:{}, aho:{}, pres:{}, hist:[], tipoCambio: 1350 },
            editando: { activo: false, tipo: null, indice: null },
                                   
            convertirARS(monto, moneda) {
                if (moneda === 'USD') {
                    return monto * this.datos.tipoCambio;
                }
                return monto;
            },
            
            guardarTipoCambio() {
                const tc = parseFloat(document.getElementById('tipoCambio').value);
                if (tc && tc > 0) {
                    this.datos.tipoCambio = tc;
                    this.guardar();
                    this.actualizar();
                }
            },
            
            async actualizarDolar() {
                try {
                    // Mostrar indicador de carga
                    const btn = event.target;
                    const textoOriginal = btn.innerHTML;
                    btn.innerHTML = '⏳ Cargando...';
                    btn.disabled = true;
                    
                    // Intentar obtener el dólar desde dolarapi.com (API pública argentina)
                    const response = await fetch('https://dolarapi.com/v1/dolares/blue');
                    
                    if (!response.ok) throw new Error('Error al obtener cotización');
                    
                    const data = await response.json();
                    const valorVenta = data.venta;
                    
                    // Actualizar el input y los datos
                    document.getElementById('tipoCambio').value = valorVenta;
                    this.datos.tipoCambio = valorVenta;
                    this.guardar();
                    this.actualizar();
                    
                    // Mostrar mensaje de éxito
                    btn.innerHTML = '✅ Actualizado';
                    setTimeout(() => {
                        btn.innerHTML = textoOriginal;
                        btn.disabled = false;
                    }, 2000);
                    
                    alert(`✅ Dólar actualizado: $${valorVenta.toFixed(2)}`);
                    
                } catch (error) {
                    console.error('Error al actualizar dólar:', error);
                    alert('❌ No se pudo obtener la cotización del dólar. Verifica tu conexión o ingrésalo manualmente.');
                    
                    // Restaurar botón
                    const btn = event.target;
                    btn.innerHTML = '🔄 Actualizar';
                    btn.disabled = false;
                }
            },
            
            seleccionarColor(tipo, color, event) {
                // Actualizar el valor del input hidden
                document.getElementById(`${tipo}-color`).value = color;
                
                // Remover la clase selected de todos los color-option del tipo específico
                const contenedor = event.target.closest('.color-picker');
                contenedor.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                
                // Agregar clase selected al elemento clickeado si es un color-option
                if (event.target.classList.contains('color-option')) {
                    event.target.classList.add('selected');
                }
            },
            
            init() {
                const hoy = new Date();
                this.llenarSelects();
                document.getElementById('mesActual').value = hoy.getMonth();
                document.getElementById('anioActual').value = hoy.getFullYear();
                this.crearTabs();
                this.cargarDatos();
                document.getElementById('tipoCambio').value = this.datos.tipoCambio;
                this.actualizar();
                attachCurrencyFormatters([
                'ing-monto','fij-monto','var-monto',
                'tarjeta-monto','tarjeta-cuota-rapido',
                'prestamo-monto','prestamo-cuota-rapido',
                'meta-monto','aho-monto','pres-monto'
                ]);
                // Fuerza el tab inicial, eliminando tooltips fuera de contexto
                const tabsC = document.getElementById('tabsContainer');
                if(tabsC && tabsC.children.length > 0){
                  tabsC.children[0].click(); // activa resumen limpio
                }
                if (!localStorage.getItem('aura_visited')) {
                    setTimeout(() => this.mostrarAyuda(), 500);
                    localStorage.setItem('aura_visited', '1');
                }
            },
            
            crearTabs() {
                const tabsC = document.getElementById('tabsContainer');
                const subsC = document.getElementById('subtabsContainer');
                
			this.tabs.forEach((tab, i) => {
                    const btn = document.createElement('button');
                    btn.className = `tab ${i===0?'active':''}`;
                    
                    // Separar emoji del texto
                    const parts = tab.name.split(' ');
                    const emoji = parts[0]; // El emoji
                    const texto = parts.slice(1).join(' '); // El resto del texto
                    
                    // Crear estructura: emoji arriba, texto abajo
                    btn.innerHTML = `<span style="font-size: 20px;">${emoji}</span><span style="font-size: 12px;">${texto}</span>`;
                    
                    btn.onclick = () => this.cambiarTab(tab.id, tab.subs);
                    tabsC.appendChild(btn);
                    
                    if (tab.subs) {
                        // Genera el subtabs carrusel
                        const subDiv = document.createElement('div');
                        subDiv.className = 'subtabs';
                        subDiv.id = `subtabs-${tab.id}`;
                        tab.subs.forEach((sub, j) => {
                            const subBtn = document.createElement('button');
                            subBtn.className = `subtab ${j===0?'active':''}`;
                            subBtn.textContent = sub.name;
                            subBtn.onclick = () => this.cambiarSubTab(tab.id, sub.id, subBtn);
                            subDiv.appendChild(subBtn);
                        });
                        // Listener scroll como antes
                        subDiv.addEventListener('scroll', function() {
                            let ticking = false;
                            if (!ticking) {
                                window.requestAnimationFrame(() => {
                                    const subtabsRect = subDiv.getBoundingClientRect();
                                    let closest, minDist = Infinity;
                                    subDiv.querySelectorAll('.subtab').forEach(subtab => {
                                        const rect = subtab.getBoundingClientRect();
                                        const dist = Math.abs(rect.left + rect.width/2 - (subtabsRect.left + subtabsRect.width/2));
                                        if (dist < minDist) { closest = subtab; minDist = dist; }
                                    });
                                    if (closest && !closest.classList.contains('active')) closest.click();
                                    ticking = false;
                                });
                                ticking = true;
                            }
                        });
                        subsC.appendChild(subDiv);
                    }
                });
            },
            
            cambiarTab(id, subs) {
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.subtabs').forEach(s => s.classList.remove('active'));
                event.target.classList.add('active');
                this.activeTab = id;
                if (subs) {
                    document.getElementById(`subtabs-${id}`).classList.add('active');
                    const firstSub = subs[0].id;
                    this.activeSub = firstSub;
                    document.getElementById(`tab-${id}-${firstSub}`).classList.add('active');
                } else {
                    this.activeSub = null;
                    document.getElementById(`tab-${id}`).classList.add('active');
                    if (id === 'historial') this.mostrarHist();
                }
                // Lógica tooltip unificada:
                const subsC = document.getElementById('subtabsContainer');
                subsC.querySelectorAll('.subtabs-tooltip').forEach(t => t.remove());
                if ((id === 'gestion' || id === 'metas') && subs) {
                    const subtabsDiv = document.getElementById(`subtabs-${id}`);
                    if (subtabsDiv) {
                        const tooltip = document.createElement('div');
                        tooltip.className = 'subtabs-tooltip';
                        tooltip.innerHTML = '💡 Deslizar horizontalmente para ver más opciones';
                        subsC.insertBefore(tooltip, subtabsDiv);
                    }
                }
            },
            
            cambiarSubTab(parent, sub, el) {
                document.querySelectorAll(`#subtabs-${parent} .subtab`).forEach(s => s.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                
                el.classList.add('active');
                this.activeSub = sub;
                document.getElementById(`tab-${parent}-${sub}`).classList.add('active');
            },
            
llenarSelects() {
                const mSel = document.getElementById('mesActual');
                this.meses.forEach((m,i) => {
                    const opt = document.createElement('option');
                    opt.value = i;
                    opt.textContent = m;
                    mSel.appendChild(opt);
                });
                
                // Llenar selector de años (2020-2050)
                const aSel = document.getElementById('anioActual');
                for(let year = 2020; year <= 2050; year++) {
                    const opt = document.createElement('option');
                    opt.value = year;
                    opt.textContent = year;
                    aSel.appendChild(opt);
                }
                
                ['ing','fij','var'].forEach(t => {
                    const sel = document.getElementById(`${t}-cat`);
                    this.cat[t].forEach(c => {
                        const opt = document.createElement('option');
                        opt.value = c.substring(3);
                        opt.textContent = c;
                        sel.appendChild(opt);
                    });
                });
                const pSel = document.getElementById('pres-cat');
                this.cat.var.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.substring(3);
                    opt.textContent = c;
                    pSel.appendChild(opt);
                });
            },
            
            getMes() {
                return `${document.getElementById('anioActual').value}-${document.getElementById('mesActual').value}`;
            },
            
            addHist(txt) {
                this.datos.hist.unshift({fecha: new Date().toLocaleString('es-AR'), txt});
                if (this.datos.hist.length > 50) this.datos.hist.pop();
            },
            
            add(tipo) {
                const nom = document.getElementById(`${tipo}-nombre`).value;
                const monto = parseMonto(document.getElementById(`${tipo}-monto`).value);
                const cat = document.getElementById(`${tipo}-cat`).value;
                const col = document.getElementById(`${tipo}-color`).value;
                const moneda = document.getElementById(`${tipo}-moneda`).value;
                if (!nom || !monto) return alert('⚠️ Completa los campos');
                const mk = this.getMes();
                if (!this.datos[tipo][mk]) this.datos[tipo][mk] = [];
                
                // Si estamos en modo edición
                if (this.editando.activo && this.editando.tipo === tipo) {
                    this.datos[tipo][mk][this.editando.indice] = {nom, monto, cat, col, moneda};
                    const montoARS = this.convertirARS(monto, moneda);
                    this.addHist(`Editado ${tipo}: ${nom} - ${formatearPesos(montoARS)}${moneda==='USD'?' (USD)':''}`);
                    this.cancelarEdicion(tipo);
                } else {
                    // Modo agregar normal
                    this.datos[tipo][mk].push({nom, monto, cat, col, moneda});
                    const montoARS = this.convertirARS(monto, moneda);
                    this.addHist(`${tipo}: ${nom} - ${formatearPesos(montoARS)}${moneda==='USD'?' (USD)':''}`);
                    document.getElementById(`${tipo}-nombre`).value = '';
                    document.getElementById(`${tipo}-monto`).value = '';
                }
                
                this.guardar();
                this.actualizar();
            },
            
            editar(tipo, idx) {
                const mk = this.getMes();
                const item = this.datos[tipo][mk][idx];
                
                // Cargar datos en el formulario
                document.getElementById(`${tipo}-nombre`).value = item.nom;
                document.getElementById(`${tipo}-monto`).value = item.monto;
                document.getElementById(`${tipo}-cat`).value = item.cat;
                document.getElementById(`${tipo}-color`).value = item.col;
                document.getElementById(`${tipo}-moneda`).value = item.moneda || 'ARS';
                
                // Seleccionar visualmente el color en la paleta
                const tabId = `#tab-gestion-${tipo === 'ing' ? 'ingresos' : tipo === 'fij' ? 'fijos' : 'variables'}`;
                const colorPicker = document.querySelector(`${tabId} .color-picker`);
                if (colorPicker) {
                    colorPicker.querySelectorAll('.color-option').forEach(opt => {
                        opt.classList.remove('selected');
                        if (opt.style.background === item.col) {
                            opt.classList.add('selected');
                        }
                    });
                }
                
                // Activar modo edición
                this.editando = { activo: true, tipo: tipo, indice: idx };
                
                // Cambiar el botón a "Actualizar"
                const btn = document.querySelector(`${tabId} .btn-primary`);
                btn.textContent = '✓ Actualizar';
                btn.style.background = 'var(--warning)';
                
                // Agregar botón de cancelar si no existe
                if (!document.getElementById(`cancelar-${tipo}`)) {
                    const cancelBtn = document.createElement('button');
                    cancelBtn.id = `cancelar-${tipo}`;
                    cancelBtn.className = 'btn btn-danger';
                    cancelBtn.textContent = '✕ Cancelar';
                    cancelBtn.onclick = () => this.cancelarEdicion(tipo);
                    btn.parentNode.appendChild(cancelBtn);
                }
                
                // Scroll al formulario
                document.querySelector(`#tab-gestion-${tipo === 'ing' ? 'ingresos' : tipo === 'fij' ? 'fijos' : 'variables'}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
            },
            
            cancelarEdicion(tipo) {
                // Resetear modo edición
                this.editando = { activo: false, tipo: null, indice: null };
                
                // Limpiar formulario
                document.getElementById(`${tipo}-nombre`).value = '';
                document.getElementById(`${tipo}-monto`).value = '';
                
                // Restaurar botón
                const btn = document.querySelector(`#tab-gestion-${tipo === 'ing' ? 'ingresos' : tipo === 'fij' ? 'fijos' : 'variables'} .btn-primary`);
                btn.textContent = '+ Agregar';
                btn.style.background = '';
                
                // Eliminar botón cancelar
                const cancelBtn = document.getElementById(`cancelar-${tipo}`);
                if (cancelBtn) cancelBtn.remove();
            },
            
            del(tipo, idx) {
                const mk = this.getMes();
                if (confirm(`¿Eliminar "${this.datos[tipo][mk][idx].nom}"?`)) {
                    this.addHist(`Eliminado: ${this.datos[tipo][mk][idx].nom}`);
                    this.datos[tipo][mk].splice(idx, 1);
                    this.guardar();
                    this.actualizar();
                }
            },
            
            cambiarModoTarjeta(modo) {
                const section = event.target.closest('.section');
                section.querySelectorAll('.card-mode-switch .mode-btn').forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');
                
                if (modo === 'completo') {
                    document.getElementById('tarjetaModoCompleto').style.display = 'block';
                    document.getElementById('tarjetaModoRapido').style.display = 'none';
                } else {
                    document.getElementById('tarjetaModoCompleto').style.display = 'none';
                    document.getElementById('tarjetaModoRapido').style.display = 'block';
                }
            },
            
            agregarTarjetaCompleto() {
                const nombre = document.getElementById('tarjeta-nombre').value;
                const tarjeta = document.getElementById('tarjeta-tarjeta').value;
                const monto = parseMonto(document.getElementById('tarjeta-monto').value);
                const cuotas = parseInt(document.getElementById('tarjeta-cuotas').value);
                const fecha = document.getElementById('tarjeta-fecha').value;
                
                if (!nombre || !tarjeta || !monto || !cuotas || !fecha) {
                    return alert('⚠️ Completa todos los campos');
                }
                
                this.datos.tarjetas.push({
                    nombre,
                    tarjeta,
                    totalCuotas: cuotas,
                    valorCuota: monto / cuotas,
                    cuotaActual: 1,
                    fechaInicio: new Date(fecha)
                });
                
                this.addHist(`Tarjeta agregada: ${nombre} - ${cuotas} cuotas de ${formatearPesos(monto / cuotas)}`);
                
                document.getElementById('tarjeta-nombre').value = '';
                document.getElementById('tarjeta-tarjeta').value = '';
                document.getElementById('tarjeta-monto').value = '';
                document.getElementById('tarjeta-cuotas').value = '';
                document.getElementById('tarjeta-fecha').value = '';
                
                this.guardar();
                this.actualizar();
            },
            
            agregarTarjetaRapido() {
                const nombre = document.getElementById('tarjeta-nombre-rapido').value;
                const tarjeta = document.getElementById('tarjeta-tarjeta-rapido').value;
                const cuota = parseMonto(document.getElementById('tarjeta-cuota-rapido').value);
                const cuotas = parseInt(document.getElementById('tarjeta-cuotas-rapido').value);
                const actual = parseInt(document.getElementById('tarjeta-actual-rapido').value);
                
                if (!nombre || !tarjeta || !cuota || !cuotas || !actual) {
                    return alert('⚠️ Completa todos los campos');
                }
                
                if (actual > cuotas) {
                    return alert('⚠️ La cuota actual no puede ser mayor al total de cuotas');
                }
                
                const fechaInicio = new Date();
                fechaInicio.setMonth(fechaInicio.getMonth() - (actual - 1));
                
                this.datos.tarjetas.push({
                    nombre,
                    tarjeta,
                    totalCuotas: cuotas,
                    valorCuota: cuota,
                    cuotaActual: actual,
                    fechaInicio
                });
                
                this.addHist(`Tarjeta agregada: ${nombre} - cuota ${actual}/${cuotas}`);
                
                document.getElementById('tarjeta-nombre-rapido').value = '';
                document.getElementById('tarjeta-tarjeta-rapido').value = '';
                document.getElementById('tarjeta-cuota-rapido').value = '';
                document.getElementById('tarjeta-cuotas-rapido').value = '';
                document.getElementById('tarjeta-actual-rapido').value = '';
                
                this.guardar();
                this.actualizar();
            },
            
            mostrarTarjetas() {
                const lista = document.getElementById('listaTarjetas');
                
                if (this.datos.tarjetas.length === 0) {
                    lista.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:20px;">No hay tarjetas registradas</p>';
                    return;
                }
                
                lista.innerHTML = this.datos.tarjetas.map((t, i) => {
                    const cuotasRestantes = t.totalCuotas - t.cuotaActual + 1;
                    const saldoTotal = cuotasRestantes * t.valorCuota;
                    const progreso = ((t.cuotaActual - 1) / t.totalCuotas) * 100;
                    
                    return `
                        <div class="item">
                            <div class="item-info">
                                <div class="item-name">💳 ${t.nombre}</div>
                                <small style="color:var(--text-light);font-size:11px;">${t.tarjeta} | Cuota: ${formatearPesos(t.valorCuota)}</small>
                            </div>
                            <div style="text-align:center;">
                                <strong>${t.cuotaActual}/${t.totalCuotas}</strong><br>
                                <small style="font-size:10px;">cuotas</small>
                            </div>
                            <div style="color:var(--danger);font-weight:700;">${formatearPesos(saldoTotal)}</div>
                            <span class="badge ${cuotasRestantes === 0 ? 'badge-success' : 'badge-warning'}">${cuotasRestantes === 0 ? 'Pagado' : 'Activo'}</span>
                            <div style="display:flex;gap:6px;flex-wrap:wrap;">
                                ${cuotasRestantes > 0 ? `<button class="btn btn-success" onclick="app.avanzarCuotaTarjeta(${i})">✓ Pagar</button>` : ''}
                                <button class="btn btn-danger" onclick="app.eliminarTarjeta(${i})">×</button>
                            </div>
                        </div>
                    `;
                }).join('');
            },
            
            avanzarCuotaTarjeta(index) {
                const tarjeta = this.datos.tarjetas[index];
                if (tarjeta.cuotaActual < tarjeta.totalCuotas) {
                    tarjeta.cuotaActual++;
                    this.addHist(`Cuota pagada: ${tarjeta.nombre} (${tarjeta.cuotaActual}/${tarjeta.totalCuotas})`);
                    this.guardar();
                    this.actualizar();
                }
            },
            
            eliminarTarjeta(index) {
                if (confirm(`¿Eliminar "${this.datos.tarjetas[index].nombre}"?`)) {
                    this.addHist(`Tarjeta eliminada: ${this.datos.tarjetas[index].nombre}`);
                    this.datos.tarjetas.splice(index, 1);
                    this.guardar();
                    this.actualizar();
                }
            },
            
            cambiarModoPrestamo(modo) {
                const section = event.target.closest('.section');
                section.querySelectorAll('.card-mode-switch .mode-btn').forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');
                
                if (modo === 'completo') {
                    document.getElementById('prestamoModoCompleto').style.display = 'block';
                    document.getElementById('prestamoModoRapido').style.display = 'none';
                } else {
                    document.getElementById('prestamoModoCompleto').style.display = 'none';
                    document.getElementById('prestamoModoRapido').style.display = 'block';
                }
            },
            
            agregarPrestamoCompleto() {
                const nombre = document.getElementById('prestamo-nombre').value;
                const entidad = document.getElementById('prestamo-tipo').value;
                const monto = parseMonto(document.getElementById('prestamo-monto').value);
                const cuotas = parseInt(document.getElementById('prestamo-cuotas').value);
                const fecha = document.getElementById('prestamo-fecha').value;
                
                if (!nombre || !entidad || !monto || !cuotas || !fecha) {
                    return alert('⚠️ Completa todos los campos');
                }
                
                this.datos.prestamos.push({
                    nombre,
                    entidad,
                    totalCuotas: cuotas,
                    valorCuota: monto / cuotas,
                    cuotaActual: 1,
                    fechaInicio: new Date(fecha)
                });
                
                this.addHist(`Préstamo agregado: ${nombre} - ${cuotas} cuotas de ${formatearPesos(monto / cuotas)}`);
                
                document.getElementById('prestamo-nombre').value = '';
                document.getElementById('prestamo-tipo').value = '';
                document.getElementById('prestamo-monto').value = '';
                document.getElementById('prestamo-cuotas').value = '';
                document.getElementById('prestamo-fecha').value = '';
                
                this.guardar();
                this.actualizar();
            },
            
            agregarPrestamoRapido() {
                const nombre = document.getElementById('prestamo-nombre-rapido').value;
                const entidad = document.getElementById('prestamo-tipo-rapido').value;
                const cuota = parseMonto(document.getElementById('prestamo-cuota-rapido').value);
                const cuotas = parseInt(document.getElementById('prestamo-cuotas-rapido').value);
                const actual = parseInt(document.getElementById('prestamo-actual-rapido').value);
                
                if (!nombre || !entidad || !cuota || !cuotas || !actual) {
                    return alert('⚠️ Completa todos los campos');
                }
                
                if (actual > cuotas) {
                    return alert('⚠️ La cuota actual no puede ser mayor al total de cuotas');
                }
                
                const fechaInicio = new Date();
                fechaInicio.setMonth(fechaInicio.getMonth() - (actual - 1));
                
                this.datos.prestamos.push({
                    nombre,
                    entidad,
                    totalCuotas: cuotas,
                    valorCuota: cuota,
                    cuotaActual: actual,
                    fechaInicio
                });
                
                this.addHist(`Préstamo agregado: ${nombre} - cuota ${actual}/${cuotas}`);
                
                document.getElementById('prestamo-nombre-rapido').value = '';
                document.getElementById('prestamo-tipo-rapido').value = '';
                document.getElementById('prestamo-cuota-rapido').value = '';
                document.getElementById('prestamo-cuotas-rapido').value = '';
                document.getElementById('prestamo-actual-rapido').value = '';
                
                this.guardar();
                this.actualizar();
            },
            
            mostrarPrestamos() {
                const lista = document.getElementById('listaPrestamos');
                
                if (this.datos.prestamos.length === 0) {
                    lista.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:20px;">No hay préstamos registrados</p>';
                    return;
                }
                
                lista.innerHTML = this.datos.prestamos.map((p, i) => {
                    const cuotasRestantes = p.totalCuotas - p.cuotaActual + 1;
                    const saldoTotal = cuotasRestantes * p.valorCuota;
                    
                    return `
                        <div class="item">
                            <div class="item-info">
                                <div class="item-name">🏦 ${p.nombre}</div>
                                <small style="color:var(--text-light);font-size:11px;">${p.entidad} | Cuota: ${formatearPesos(p.valorCuota)}</small>
                            </div>
                            <div style="text-align:center;">
                                <strong>${p.cuotaActual}/${p.totalCuotas}</strong><br>
                                <small style="font-size:10px;">cuotas</small>
                            </div>
                            <div style="color:var(--danger);font-weight:700;">${formatearPesos(saldoTotal)}</div>
                            <span class="badge ${cuotasRestantes === 0 ? 'badge-success' : 'badge-warning'}">${cuotasRestantes === 0 ? 'Pagado' : 'Activo'}</span>
                            <div style="display:flex;gap:6px;flex-wrap:wrap;">
                                ${cuotasRestantes > 0 ? `<button class="btn btn-success" onclick="app.avanzarCuotaPrestamo(${i})">✓ Pagar</button>` : ''}
                                <button class="btn btn-danger" onclick="app.eliminarPrestamo(${i})">×</button>
                            </div>
                        </div>
                    `;
                }).join('');
            },
            
            avanzarCuotaPrestamo(index) {
                const prestamo = this.datos.prestamos[index];
                if (prestamo.cuotaActual < prestamo.totalCuotas) {
                    prestamo.cuotaActual++;
                    this.addHist(`Cuota pagada: ${prestamo.nombre} (${prestamo.cuotaActual}/${prestamo.totalCuotas})`);
                    this.guardar();
                    this.actualizar();
                }
            },
            
            eliminarPrestamo(index) {
                if (confirm(`¿Eliminar "${this.datos.prestamos[index].nombre}"?`)) {
                    this.addHist(`Préstamo eliminado: ${this.datos.prestamos[index].nombre}`);
                    this.datos.prestamos.splice(index, 1);
                    this.guardar();
                    this.actualizar();
                }
            },
            
            addMeta() {
                const nom = document.getElementById('meta-nombre').value;
                const monto = parseMonto(document.getElementById('meta-monto').value);
                if (!nom || !monto) return alert('⚠️ Completa los campos');
                const mk = this.getMes();
                if (!this.datos.metas[mk]) this.datos.metas[mk] = [];
                this.datos.metas[mk].push({nom,monto});
                document.getElementById('meta-nombre').value = '';
                document.getElementById('meta-monto').value = '';
                this.guardar();
                this.actualizar();
            },
			
			editarMeta(index) {
                const mk = this.getMes();
                const meta = this.datos.metas[mk][index];
                document.getElementById('meta-nombre').value = meta.nom;
                document.getElementById('meta-monto').value = meta.monto;
                // Eliminar sin confirmación ya que estamos editando
                this.datos.metas[mk].splice(index, 1);
                this.guardar();
                this.actualizar();
                // Scroll hacia el formulario
                document.getElementById('meta-nombre').focus();
            },
            
            eliminarMeta(index) {
                if (confirm('¿Eliminar esta meta?')) {
                    const mk = this.getMes();
                    this.datos.metas[mk].splice(index, 1);
                    this.guardar();
                    this.actualizar();
                }
            },
            
            editarAhorro(index) {
                const mk = this.getMes();
                const ahorro = this.datos.aho[mk][index];
                document.getElementById('aho-nombre').value = ahorro.nom;
                document.getElementById('aho-monto').value = ahorro.monto;
                // Eliminar sin confirmación ya que estamos editando
                this.datos.aho[mk].splice(index, 1);
                this.guardar();
                this.actualizar();
                // Scroll hacia el formulario
                document.getElementById('aho-nombre').focus();
            },
            
            eliminarAhorro(index) {
                if (confirm('¿Eliminar este ahorro?')) {
                    const mk = this.getMes();
                    this.datos.aho[mk].splice(index, 1);
                    this.guardar();
                    this.actualizar();
                }
            },
            
            addAhorro() {
                const nom = document.getElementById('aho-nombre').value;
                const monto = parseMonto(document.getElementById('aho-monto').value);
                if (!nom || !monto) return alert('⚠️ Completa los campos');
                const mk = this.getMes();
                if (!this.datos.aho[mk]) this.datos.aho[mk] = [];
                this.datos.aho[mk].push({nom,monto});
                document.getElementById('aho-nombre').value = '';
                document.getElementById('aho-monto').value = '';
                this.guardar();
                this.actualizar();
            },
            
            addPresupuesto() {
                const cat = document.getElementById('pres-cat').value;
                const monto = parseMonto(document.getElementById('pres-monto').value);
                if (!cat || !monto) return alert('⚠️ Completa los campos');
                const mk = this.getMes();
                if (!this.datos.pres[mk]) this.datos.pres[mk] = {};
                this.datos.pres[mk][cat] = monto;
                document.getElementById('pres-monto').value = '';
                this.guardar();
                this.actualizar();
            },
            
			editarPresupuesto(cat) {
                const mk = this.getMes();
                const monto = this.datos.pres[mk][cat];
                document.getElementById('pres-cat').value = cat;
                document.getElementById('pres-monto').value = monto;
                // Eliminar sin confirmación ya que estamos editando
                delete this.datos.pres[mk][cat];
                this.guardar();
                this.actualizar();
                // Scroll hacia el formulario
                document.getElementById('pres-monto').focus();
            },
            
            eliminarPresupuesto(cat) {
                if (confirm(`¿Eliminar el presupuesto de "${cat}"?`)) {
                    const mk = this.getMes();
                    delete this.datos.pres[mk][cat];
                    this.guardar();
                    this.actualizar();
                }
            },
			
            calcularCuotasMes(fecha) {
                const mes = fecha.getMonth();
                const anio = fecha.getFullYear();
                let total = 0;
                
                this.datos.tarjetas.forEach(t => {
                    const mesesDesdeInicio = (anio - t.fechaInicio.getFullYear()) * 12 + (mes - t.fechaInicio.getMonth());
                    const cuotaEnEsteMes = mesesDesdeInicio + 1;
                    
                    if (cuotaEnEsteMes >= t.cuotaActual && cuotaEnEsteMes <= t.totalCuotas) {
                        total += t.valorCuota;
                    }
                });
                
                this.datos.prestamos.forEach(p => {
                    const mesesDesdeInicio = (anio - p.fechaInicio.getFullYear()) * 12 + (mes - p.fechaInicio.getMonth());
                    const cuotaEnEsteMes = mesesDesdeInicio + 1;
                    
                    if (cuotaEnEsteMes >= p.cuotaActual && cuotaEnEsteMes <= p.totalCuotas) {
                        total += p.valorCuota;
                    }
                });
                
                return total;
            },
            
            getMesActual() {
                const mes = parseInt(document.getElementById('mesActual').value);
                const anio = parseInt(document.getElementById('anioActual').value);
                return new Date(anio, mes, 1);
            },
            
            mostrarLista(tipo) {
                const mk = this.getMes();
                const lista = this.datos[tipo][mk] || [];
                const c = document.getElementById(`lista-${tipo}`);
                if (lista.length === 0) {
                    c.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:20px;font-size:13px;">No hay registros</p>';
                    return;
                }
                
                // Agrupar por categoría
                const porCategoria = {};
                lista.forEach((it, idx) => {
                    if (!porCategoria[it.cat]) {
                        porCategoria[it.cat] = [];
                    }
                    porCategoria[it.cat].push({ ...it, indiceOriginal: idx });
                });
                
                // Generar HTML agrupado
                let html = '';
                Object.keys(porCategoria).sort().forEach(cat => {
                    const items = porCategoria[cat];
                    const totalCat = items.reduce((sum, it) => sum + this.convertirARS(it.monto, it.moneda || 'ARS'), 0);
                    const ico = this.cat[tipo].find(x => x.includes(cat))?.split(' ')[0] || '📌';
                    const colorCat = items[0].col;
                    
                    html += `
                        <div style="margin-bottom: 15px;">
                            <div class="category-header" onclick="app.toggleCategoria('${tipo}-${cat.replace(/\s+/g, '-')}')" style="background: ${colorCat}; color: white; padding: 14px 18px; border-radius: 10px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span style="font-size: 22px;">${ico}</span>
                                    <div>
                                        <div style="font-weight: 700; font-size: 15px;">${cat}</div>
                                        <div style="font-size: 11px; opacity: 0.9;">${items.length} registro${items.length > 1 ? 's' : ''}</div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <div style="font-size: 20px; font-weight: 700;">${formatearPesos(totalCat)}</div>
                                    <span id="arrow-${tipo}-${cat.replace(/\s+/g, '-')}" style="font-size: 18px; transition: transform 0.3s;">▼</span>
                                </div>
                            </div>
                            <div id="${tipo}-${cat.replace(/\s+/g, '-')}" class="category-items" style="display: none; margin-top: 8px; padding: 0 8px;">
                    `;
                    
                    items.forEach(it => {
                        const montoARS = this.convertirARS(it.monto, it.moneda || 'ARS');
                        const badge = it.moneda === 'USD' ? '<span class="currency-badge">USD</span>' : '';
                        html += `
                            <div class="item" style="background: var(--bg); margin-bottom: 6px; border-left: 4px solid ${colorCat};">
                                <div class="item-info">
                                    <div class="item-name">
                                        <span>${it.nom}${badge}</span>
                                    </div>
                                </div>
                                <div class="item-amount">${formatearPesos(montoARS)}</div>
                                <button class="btn btn-info" onclick="app.editar('${tipo}',${it.indiceOriginal})" style="padding: 8px 16px;" title="Editar">✏️</button>
                                <button class="btn btn-danger" onclick="app.del('${tipo}',${it.indiceOriginal})" title="Eliminar">×</button>
                            </div>
                        `;
                    });
                    
                    html += `
                            </div>
                        </div>
                    `;
                });
                
                c.innerHTML = html;
            },
            
            toggleCategoria(id) {
                const elem = document.getElementById(id);
                const arrow = document.getElementById('arrow-' + id);
                if (elem.style.display === 'none') {
                    elem.style.display = 'block';
                    arrow.style.transform = 'rotate(180deg)';
                } else {
                    elem.style.display = 'none';
                    arrow.style.transform = 'rotate(0deg)';
                }
            },
            
            
			mostrarAho() {
                const mk = this.getMes();
                const metas = this.datos.metas[mk] || [];
                const aho = this.datos.aho[mk] || [];
                const c = document.getElementById('lista-aho');
                let html = '';
                if (metas.length > 0) {
                    html += '<h4 style="color:var(--primary-dark);margin-bottom:10px;font-size:14px;">🎯 Metas</h4>';
                    html += metas.map((m, i) => `
                        <div class="item">
                            <div style="flex:1;">${m.nom}</div>
                            <div class="item-amount">${formatearPesos(m.monto)}</div>
                            <button class="btn-info" onclick="app.editarMeta(${i})" style="padding:6px 10px;margin:0;font-size:12px;min-height:unset;" title="Editar">✏️</button>
                            <button class="btn-danger" onclick="app.eliminarMeta(${i})" style="padding:6px 10px;margin:0;font-size:12px;min-height:unset;" title="Eliminar">🗑️</button>
                        </div>
                    `).join('');
                }
                if (aho.length > 0) {
                    html += '<h4 style="color:var(--primary-dark);margin:15px 0 10px;font-size:14px;">💰 Ahorros</h4>';
                    html += aho.map((a, i) => `
                        <div class="item">
                            <div style="flex:1;">${a.nom}</div>
                            <div class="item-amount">${formatearPesos(a.monto)}</div>
                            <button class="btn-info" onclick="app.editarAhorro(${i})" style="padding:6px 10px;margin:0;font-size:12px;min-height:unset;" title="Editar">✏️</button>
                            <button class="btn-danger" onclick="app.eliminarAhorro(${i})" style="padding:6px 10px;margin:0;font-size:12px;min-height:unset;" title="Eliminar">🗑️</button>
                        </div>
                    `).join('');
                }
                c.innerHTML = html || '<p style="text-align:center;color:var(--text-light);padding:20px;font-size:13px;">No hay registros</p>';
                
                const metaT = metas.reduce((s, m) => s + m.monto, 0);
                const ahoT = aho.reduce((s, a) => s + a.monto, 0);
                const prog = document.getElementById('progresoAhorro');
                if (metaT === 0) {
                    prog.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:15px;font-size:13px;">Define una meta</p>';
                    return;
                }
                const porc = Math.min((ahoT / metaT) * 100, 100);
                const diff = metaT - ahoT;
                prog.innerHTML = `<div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:13px;"><span><strong>Meta:</strong> ${formatearPesos(metaT)}</span><span><strong>Ahorrado:</strong> ${formatearPesos(ahoT)}</span></div><div class="progress-bar"><div class="progress-fill" style="width:${porc}%">${porc.toFixed(0)}%</div></div><div style="text-align:center;margin-top:10px;color:${diff>0?'var(--danger)':'var(--success)'};font-weight:700;font-size:14px;">${diff>0?`Faltan ${formatearPesos(diff)}`:'¡Meta alcanzada! 🎉'}</div>`;
            },
            
            mostrarPres() {
                const mk = this.getMes();
                const pres = this.datos.pres[mk] || {};
                const vars = this.datos.var[mk] || [];
                const c = document.getElementById('listaPresupuestos');
                if (Object.keys(pres).length === 0) {
                    c.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:20px;font-size:13px;">No hay presupuestos</p>';
                    return;
                }
                const gCat = {};
                vars.forEach(v => {
                    const montoARS = this.convertirARS(v.monto, v.moneda || 'ARS');
                    gCat[v.cat] = (gCat[v.cat] || 0) + montoARS;
                });
                c.innerHTML = Object.entries(pres).map(([cat, lim]) => {
                    const gast = gCat[cat] || 0;
                    const porc = Math.min((gast / lim) * 100, 100);
                    const disp = lim - gast;
                    const ico = this.cat.var.find(x => x.includes(cat))?.split(' ')[0] || '📌';
                    let col = 'var(--success)', msg = 'OK ✓';
                    if (porc > 100) { col = 'var(--danger)'; msg = '¡Superado!'; }
                    else if (porc > 90) { col = 'var(--danger)'; msg = '¡Cerca!'; }
                    else if (porc > 70) { col = 'var(--warning)'; msg = 'Cuidado'; }
                    return `<div style="background:var(--bg);padding:15px;border-radius:10px;margin-bottom:10px;position:relative;">
                        <div style="position:absolute;top:10px;right:10px;display:flex;gap:6px;">
                            <button class="btn-info" onclick="app.editarPresupuesto('${cat}')" style="padding:6px 10px;margin:0;font-size:12px;min-height:unset;" title="Editar">✏️</button>
                            <button class="btn-danger" onclick="app.eliminarPresupuesto('${cat}')" style="padding:6px 10px;margin:0;font-size:12px;min-height:unset;" title="Eliminar">🗑️</button>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px;font-size:13px;padding-right:100px;"><strong>${ico} ${cat}</strong><div style="text-align:right;"><div>Gastado: <strong style="color:${col};">${formatearPesos(gast)}</strong></div><div style="font-size:11px;color:var(--text-light);">Límite: ${formatearPesos(lim)}</div></div></div><div class="progress-bar" style="height:24px;"><div class="progress-fill" style="width:${porc}%;background:${col};font-size:11px;">${porc.toFixed(0)}%</div></div><div style="display:flex;justify-content:space-between;margin-top:8px;font-size:12px;"><span style="color:${col};font-weight:600;">${msg}</span><span style="color:${disp>=0?'var(--success)':'var(--danger)'};font-weight:600;">${disp>=0?'Disponible:':'Excedido:'} ${formatearPesos(Math.abs(disp))}</span></div></div>`;
                }).join('');
            },
            
            
            actualizarResumen() {
                const mk = this.getMes();
                const m = parseInt(document.getElementById('mesActual').value);
                const a = parseInt(document.getElementById('anioActual').value);
                
                const ing = (this.datos.ing[mk] || []).reduce((s, i) => s + this.convertirARS(i.monto, i.moneda || 'ARS'), 0);
                const fij = (this.datos.fij[mk] || []).reduce((s, i) => s + this.convertirARS(i.monto, i.moneda || 'ARS'), 0);
                const varG = (this.datos.var[mk] || []).reduce((s, i) => s + this.convertirARS(i.monto, i.moneda || 'ARS'), 0);
                const tar = this.calcularCuotasMes(new Date(a, m, 1));
                const gast = fij + varG + tar;
                const bal = ing - gast;
                
                const dTar = this.datos.tarjetas.reduce((s, t) => {
                    const cuotasRestantes = t.totalCuotas - t.cuotaActual + 1;
                    return s + (cuotasRestantes * t.valorCuota);
                }, 0);
                const dPre = this.datos.prestamos.reduce((s, p) => {
                    const cuotasRestantes = p.totalCuotas - p.cuotaActual + 1;
                    return s + (cuotasRestantes * p.valorCuota);
                }, 0);
                
                document.getElementById('resumenCards').innerHTML = `
                    <div class="card" style="background:linear-gradient(135deg,#2e7d32,#66bb6a);"><div class="card-title">Ingresos</div><div class="card-value">${formatearPesos(ing)}</div></div>
                    <div class="card" style="background:linear-gradient(135deg,#d32f2f,#f44336);"><div class="card-title">Gastos Fijos</div><div class="card-value">${formatearPesos(fij)}</div></div>
                    <div class="card" style="background:linear-gradient(135deg,#e64a19,#ff7043);"><div class="card-title">Gastos Variables</div><div class="card-value">${formatearPesos(varG)}</div></div>
                    <div class="card" style="background:linear-gradient(135deg,#1565c0,#42a5f5);"><div class="card-title">Tarjetas</div><div class="card-value">${formatearPesos(dTar)}</div></div>
                    <div class="card" style="background:linear-gradient(135deg,#6a1b9a,#ab47bc);"><div class="card-title">Préstamos</div><div class="card-value">${formatearPesos(dPre)}</div></div>
                    <div class="card" style="background:linear-gradient(135deg,${bal>=0?'#f57c00':'#c62828'},${bal>=0?'#ffb74d':'#ef5350'});"><div class="card-title">Balance</div><div class="card-value">${formatearPesos(bal)}</div></div>`;
                
                const max = Math.max(fij, varG, tar) || 1;
                const total = fij + varG + tar;
                
                document.getElementById('desglose').innerHTML = `
                    <div class="expense-card">
                        <div class="expense-header">
                            <span class="expense-title">Gastos Fijos</span>
                            <span class="expense-icon">🏠</span>
                        </div>
                        <div class="expense-amount">${formatearPesos(fij)}</div>
                        <div class="expense-bar"><div class="expense-bar-fill" style="width:${(fij/max)*100}%"></div></div>
                        <div class="expense-percent">${total > 0 ? ((fij/total)*100).toFixed(1) : 0}% del total</div>
                    </div>
                    <div class="expense-card">
                        <div class="expense-header">
                            <span class="expense-title">Gastos Variables</span>
                            <span class="expense-icon">🛒</span>
                        </div>
                        <div class="expense-amount">${formatearPesos(varG)}</div>
                        <div class="expense-bar"><div class="expense-bar-fill" style="width:${(varG/max)*100}%"></div></div>
                        <div class="expense-percent">${total > 0 ? ((varG/total)*100).toFixed(1) : 0}% del total</div>
                    </div>
                    <div class="expense-card">
                        <div class="expense-header">
                            <span class="expense-title">Cuotas (Tarjetas + Préstamos)</span>
                            <span class="expense-icon">💳</span>
                        </div>
                        <div class="expense-amount">${formatearPesos(tar)}</div>
                        <div class="expense-bar"><div class="expense-bar-fill" style="width:${(tar/max)*100}%"></div></div>
                        <div class="expense-percent">${total > 0 ? ((tar/total)*100).toFixed(1) : 0}% del total</div>
                    </div>
                `;
                
                this.alertas(mk, ing, gast, bal, fij, varG);
            },
            
            alertas(mk, ing, gast, bal, fij, varG) {
                const al = [];
                if (gast > ing * 0.9 && ing > 0) al.push('<div class="alert alert-warning"><strong>⚠️ Alto nivel de gastos</strong><br>Tus gastos superan el 90% de tus ingresos.</div>');
                if (bal < 0) al.push('<div class="alert alert-danger"><strong>🚨 Balance negativo</strong><br>Estás gastando más de lo que ingresas este mes.</div>');
                
                const pres = this.datos.pres[mk] || {};
                const vars = this.datos.var[mk] || [];
                const gCat = {};
                vars.forEach(v => {
                    const montoARS = this.convertirARS(v.monto, v.moneda || 'ARS');
                    gCat[v.cat] = (gCat[v.cat] || 0) + montoARS;
                });
                Object.entries(pres).forEach(([cat, lim]) => {
                    if ((gCat[cat] || 0) > lim) {
                        al.push(`<div class="alert alert-warning"><strong>⚠️ Presupuesto superado</strong><br>${cat}: excediste por ${formatearPesos((gCat[cat]||0) - lim)}</div>`);
                    }
                });
                
                const tarVenc = this.datos.tarjetas.filter(t => {
                    const cuotasRestantes = t.totalCuotas - t.cuotaActual + 1;
                    return cuotasRestantes > 0 && cuotasRestantes <= 3;
                });
                if (tarVenc.length > 0) al.push(`<div class="alert alert-info"><strong>ℹ️ Cuotas finalizando</strong><br>${tarVenc.length} tarjeta(s) finalizan en ≤3 cuotas.</div>`);
                
                const preVenc = this.datos.prestamos.filter(p => {
                    const cuotasRestantes = p.totalCuotas - p.cuotaActual + 1;
                    return cuotasRestantes > 0 && cuotasRestantes <= 3;
                });
                if (preVenc.length > 0) al.push(`<div class="alert alert-info"><strong>ℹ️ Préstamos finalizando</strong><br>${preVenc.length} préstamo(s) finalizan en ≤3 cuotas.</div>`);
                
                const metas = this.datos.metas[mk] || [];
                const aho = this.datos.aho[mk] || [];
                const metaT = metas.reduce((s, m) => s + m.monto, 0);
                const ahoT = aho.reduce((s, a) => s + a.monto, 0);
                if (metaT > 0 && ahoT < metaT * 0.5) al.push('<div class="alert alert-warning"><strong>⚠️ Meta de ahorro</strong><br>Llevas menos del 50% de tu meta de ahorro.</div>');
                
                const valoresVar = Object.values(this.datos.var);
                if (valoresVar.length > 1) {
                    const totales = valoresVar.map(mes => mes.reduce((s, i) => s + this.convertirARS(i.monto, i.moneda || 'ARS'), 0));
                    const prom = totales.reduce((s, v) => s + v, 0) / totales.length;
                    if (varG > prom * 1.5 && prom > 0) al.push('<div class="alert alert-warning"><strong>⚠️ Gasto inusual</strong><br>Tus gastos variables son 50% mayores al promedio.</div>');
                }
                
                document.getElementById('alertas').innerHTML = al.length ? al.join('') : '<p style="text-align:center;color:var(--success);font-weight:700;font-size:14px;">✅ Todo en orden</p>';
            },
            
            mostrarHist() {
                const c = document.getElementById('listaHistorial');
                if (this.datos.hist.length === 0) {
                    c.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:30px;font-size:13px;">No hay actividad</p>';
                    return;
                }
                c.innerHTML = this.datos.hist.slice(0, 30).map(h => `<div style="background:var(--bg);padding:14px;border-radius:8px;border-left:4px solid var(--primary);margin-bottom:10px;"><div style="font-size:11px;color:var(--text-light);margin-bottom:4px;">${h.fecha}</div><div style="font-size:13px;color:var(--text);">${h.txt}</div></div>`).join('');
            },
            
            actualizar() {
                this.actualizarResumen();
                ['ing','fij','var'].forEach(t => this.mostrarLista(t));
                this.mostrarTarjetas();
                this.mostrarPrestamos();
                this.mostrarAho();
                this.mostrarPres();
            },
            
            mostrarAyuda() {
                document.getElementById('modalAyuda').style.display = 'block';
            },
            
            cerrarAyuda() {
                document.getElementById('modalAyuda').style.display = 'none';
            },
            
            exportar() {
                exportarJSON(this.datos);
                alert('✅ Datos exportados correctamente');
            },
            
            importar(e) {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        if (confirm('⚠️ ¿Reemplazar TODOS los datos actuales?')) {
                            this.datos = JSON.parse(ev.target.result);
                            if (!this.datos.tipoCambio) this.datos.tipoCambio = 1350;
                            document.getElementById('tipoCambio').value = this.datos.tipoCambio;
                            this.guardar();
                            this.actualizar();
                            alert('✅ Datos importados correctamente');
                        }
                    } catch {
                        alert('❌ Error al importar el archivo');
                    }
                };
                reader.readAsText(file);
                e.target.value = '';
            },
            
            guardar() {
                const pin = pinManager.storedPin || null;
                guardarDatos(this.datos, pin);
                this.addHist('✅ Datos guardados');
            },
            
cargarDatos() {
    try {
        const pin = pinManager.storedPin || null;
        const guardado = cargarDatos(pin);
        
        if (guardado) {
            this.datos = guardado;
            
            // Asegurar que existan todas las estructuras
            if (!this.datos.tipoCambio) this.datos.tipoCambio = 1350;
            if (!this.datos.tarjetas) this.datos.tarjetas = [];
            if (!this.datos.prestamos) this.datos.prestamos = [];
            if (!this.datos.ing) this.datos.ing = {};
            if (!this.datos.fij) this.datos.fij = {};
            if (!this.datos.var) this.datos.var = {};
            if (!this.datos.metas) this.datos.metas = {};
            if (!this.datos.aho) this.datos.aho = {};
            if (!this.datos.pres) this.datos.pres = {};
            if (!this.datos.hist) this.datos.hist = [];
            
            // Convertir fechas de string a Date
            this.datos.tarjetas.forEach(t => {
                if (t.fechaInicio) t.fechaInicio = new Date(t.fechaInicio);
            });
            this.datos.prestamos.forEach(p => {
                if (p.fechaInicio) p.fechaInicio = new Date(p.fechaInicio);
            });
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
}
        }

// enlazar funciones externas usadas en el original a las importadas
app.formatearPesos = formatearPesos;
app.parseMonto = parseMonto;
app.attachCurrencyFormatters = () => attachCurrencyFormatters(['ing-monto','fij-monto','var-monto','tarjeta-monto','tarjeta-cuota-rapido','prestamo-monto','prestamo-cuota-rapido','meta-monto','aho-monto','pres-monto']);

app.guardar = function() {
  try {
    const pin = localStorage.getItem('app_pin');
    guardarDatos(this.datos, pin);
  } catch(e) { console.error(e); }
};

app.cargarDatos = function() {
  try {
    const guardado = cargarDatos(localStorage.getItem('app_pin'));
    if (guardado) this.datos = guardado;
  } catch(e) { console.error(e); }
};

app.exportar = function() { exportarJSON(this.datos); };

setupPinAutoInit();
window.app = app;

// Exponer app y pinManager globalmente
window.app = app;
window.pinManager = pinManager;

// Inicializar cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.container').style.display = 'none';
    pinManager.init();
});

// Click en el modal
window.onclick = (e) => {
    if (e.target == document.getElementById('modalAyuda')) app.cerrarAyuda();
}
