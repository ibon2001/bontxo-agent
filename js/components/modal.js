/**
 * Componente Modal - Ventanas emergentes
 */

class ModalManager {
    constructor() {
        this.activeModal = null;
        this.init();
    }
    
    init() {
        // Escuchar clicks en overlays
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeActive();
            }
        });
        
        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeActive();
            }
        });
    }
    
    /**
     * Abrir modal por ID
     */
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal ${modalId} no encontrado`);
            return;
        }
        
        // Cerrar cualquier modal abierto
        this.closeActive();
        
        modal.classList.add('active');
        this.activeModal = modalId;
        
        // Focus en el primer input
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
    
    /**
     * Cerrar modal por ID
     */
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
        if (this.activeModal === modalId) {
            this.activeModal = null;
        }
    }
    
    /**
     * Cerrar modal activo
     */
    closeActive() {
        if (this.activeModal) {
            this.close(this.activeModal);
        }
    }
    
    /**
     * Confirmar acción
     */
    async confirm(message, title = 'Confirmar') {
        return new Promise((resolve) => {
            // Crear modal de confirmación
            const modalId = 'confirm-modal';
            let modal = document.getElementById(modalId);
            
            if (!modal) {
                modal = document.createElement('div');
                modal.id = modalId;
                modal.className = 'modal-overlay';
                modal.innerHTML = `
                    <div class="modal">
                        <div class="modal-header">
                            <h2 class="modal-title">${title}</h2>
                            <button class="modal-close">×</button>
                        </div>
                        <p class="modal-message">${message}</p>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                            <button class="btn btn-primary" data-action="confirm">Confirmar</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }
            
            const closeAndResolve = (result) => {
                this.close(modalId);
                modal.remove();
                resolve(result);
            };
            
            modal.querySelector('[data-action="cancel"]').onclick = () => closeAndResolve(false);
            modal.querySelector('[data-action="confirm"]').onclick = () => closeAndResolve(true);
            modal.querySelector('.modal-close').onclick = () => closeAndResolve(false);
            
            this.open(modalId);
        });
    }
    
    /**
     * Prompt simple
     */
    prompt(message, defaultValue = '') {
        return new Promise((resolve) => {
            const modalId = 'prompt-modal';
            let modal = document.getElementById(modalId);
            
            if (!modal) {
                modal = document.createElement('div');
                modal.id = modalId;
                modal.className = 'modal-overlay';
                document.body.appendChild(modal);
            }
            
            modal.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <h2 class="modal-title">${message}</h2>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        <input type="text" id="prompt-input" class="prompt-input" value="${defaultValue}">
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                        <button class="btn btn-primary" data-action="submit">Aceptar</button>
                    </div>
                </div>
            `;
            
            const input = modal.querySelector('#prompt-input');
            const closeAndResolve = (result) => {
                this.close(modalId);
                resolve(result);
            };
            
            modal.querySelector('[data-action="cancel"]').onclick = () => closeAndResolve(null);
            modal.querySelector('[data-action="submit"]').onclick = () => closeAndResolve(input.value);
            modal.querySelector('.modal-close').onclick = () => closeAndResolve(null);
            
            input.onkeydown = (e) => {
                if (e.key === 'Enter') closeAndResolve(input.value);
            };
            
            this.open(modalId);
            input.focus();
            input.select();
        });
    }
}

// Instancia única
export const modal = new ModalManager();
