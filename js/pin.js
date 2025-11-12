// pin.js - maneja PIN y desbloqueo
const pinManager = {
            currentPin: '',
            storedPin: null,
            confirmPin: '',
            mode: 'setup', // 'setup', 'confirm', 'login'
            
            init() {
                // Verificar si ya existe un PIN
                this.storedPin = localStorage.getItem('app_pin');
                
                if (this.storedPin) {
                    // Ya tiene PIN, mostrar pantalla de login
                    this.mode = 'login';
                    document.getElementById('pinTitle').textContent = 'Ingresa tu PIN';
                    document.getElementById('pinSubtitle').textContent = 'Desbloquea tu app financiera';
                } else {
                    // Primera vez, configurar PIN
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
                    // Guardar PIN y pedir confirmación
                    this.confirmPin = this.currentPin;
                    this.currentPin = '';
                    this.mode = 'confirm';
                    document.getElementById('pinTitle').textContent = 'Confirma tu PIN';
                    document.getElementById('pinSubtitle').textContent = 'Ingresa nuevamente el PIN';
                    this.updateDots();
                    
                } else if (this.mode === 'confirm') {
                    // Verificar que coincidan
                    if (this.currentPin === this.confirmPin) {
                        // PIN configurado correctamente
                        localStorage.setItem('app_pin', this.currentPin);
                        this.unlockApp();
                    } else {
                        // No coinciden, volver a empezar
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
                    // Verificar PIN
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
                // Inicializar la app después de desbloquear
                app.init();
            }
        };

export function setupPinAutoInit() {
  document.addEventListener('DOMContentLoaded', () => {
    const cont = document.querySelector('.container');
    if (cont) cont.style.display = 'none';
    if (typeof pinManager !== 'undefined' && pinManager.init) pinManager.init();
  });
}
