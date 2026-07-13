/**
 * Router - Navegación simple
 */

import { CONFIG } from './config.js';
import { state } from './state.js';

class Router {
    constructor() {
        this.routes = Object.values(CONFIG.PAGES);
        this.beforeEach = null;
    }
    
    /**
     * Registrar callback antes de cada navegación
     */
    beforeEach(callback) {
        this.beforeEach = callback;
    }
    
    /**
     * Navegar a una página
     */
    navigate(page, skipHistory = false) {
        // Validar página
        if (!this.routes.includes(page)) {
            console.warn(`Página "${page}" no válida`);
            page = CONFIG.PAGES.DASHBOARD;
        }
        
        // Ejecutar callback antes de navegar
        if (this.beforeEach) {
            const result = this.beforeEach(page);
            if (result === false) return;
        }
        
        // Actualizar estado
        state.set('currentPage', page);
        
        // Añadir al historial
        if (!skipHistory) {
            history.pushState({ page }, '', `#${page}`);
        }
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('navigate', { detail: { page } }));
    }
    
    /**
     * Obtener página actual desde URL
     */
    getPageFromUrl() {
        const hash = window.location.hash.slice(1);
        if (hash && this.routes.includes(hash)) {
            return hash;
        }
        return CONFIG.PAGES.DASHBOARD;
    }
    
    /**
     * Inicializar router
     */
    init() {
        // Escuchar cambios de historial
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || this.getPageFromUrl();
            state.set('currentPage', page);
        });
        
        // Navegar a página inicial
        const initialPage = this.getPageFromUrl();
        this.navigate(initialPage, true);
    }
}

// Instancia única
export const router = new Router();
