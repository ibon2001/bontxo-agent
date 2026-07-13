/**
 * Componente Loading - Pantalla de carga
 */

import { state } from '../state.js';

class LoadingManager {
    constructor() {
        this.overlay = null;
        this.messageEl = null;
        this.spinnerEl = null;
        this.init();
    }
    
    init() {
        this.overlay = document.getElementById('loading-overlay');
        this.messageEl = document.querySelector('.loading-text');
        this.spinnerEl = this.overlay?.querySelector('.spinner');
    }
    
    /**
     * Mostrar pantalla de carga
     */
    show(message = 'Cargando...') {
        if (this.messageEl) {
            this.messageEl.textContent = message;
        }
        if (this.overlay) {
            this.overlay.classList.remove('hidden');
        }
        state.set('isLoading', true);
    }
    
    /**
     * Ocultar pantalla de carga
     */
    hide() {
        if (this.overlay) {
            this.overlay.classList.add('hidden');
        }
        state.set('isLoading', false);
    }
    
    /**
     * Cambiar mensaje de carga
     */
    setMessage(message) {
        if (this.messageEl) {
            this.messageEl.textContent = message;
        }
    }
    
    /**
     * Mostrar error de carga con opción de reintentar
     */
    showError(message, onRetry = null) {
        if (!this.overlay) return;
        
        this.overlay.innerHTML = `
            <div class="loading-error">
                <div class="error-icon">⚠️</div>
                <h2>Error</h2>
                <p>${message}</p>
                <div class="error-actions">
                    ${onRetry ? '<button class="btn btn-primary" id="retry-btn">Reintentar</button>' : ''}
                    <button class="btn btn-secondary" id="config-btn">Configurar</button>
                </div>
            </div>
        `;
        
        const retryBtn = document.getElementById('retry-btn');
        const configBtn = document.getElementById('config-btn');
        
        if (retryBtn && onRetry) {
            retryBtn.addEventListener('click', onRetry);
        }
        
        if (configBtn) {
            configBtn.addEventListener('click', () => {
                this.hide();
                window.location.reload();
            });
        }
    }
    
    /**
     * Restaurar pantalla de carga original
     */
    restore() {
        if (!this.overlay) return;
        
        this.overlay.innerHTML = `
            <div class="spinner"></div>
            <p class="loading-text">Iniciando Bontxo Agent...</p>
        `;
        
        this.init();
    }
}

// Instancia única
export const loading = new LoadingManager();
