/**
 * Componente Navigation - Navegación de la app
 */

import { CONFIG } from '../config.js';
import { state } from '../state.js';
import { router } from '../router.js';

class NavigationManager {
    constructor() {
        this.sidebar = null;
        this.mobileMenuBtn = null;
        this.init();
    }
    
    init() {
        this.sidebar = document.getElementById('sidebar');
        this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
        
        // Configurar clicks del menú móvil
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        // Configurar navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                if (page) {
                    router.navigate(page);
                }
            });
        });
        
        // Suscribirse a cambios de página
        state.subscribe('currentPage', (page) => {
            this.updateActiveNav(page);
            this.updateActivePage(page);
            this.closeMobileMenu();
        });
    }
    
    /**
     * Actualizar navegación activa
     */
    updateActiveNav(page) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });
    }
    
    /**
     * Actualizar página activa
     */
    updateActivePage(page) {
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        
        const targetPage = document.getElementById(`page-${page}`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }
    
    /**
     * Alternar menú móvil
     */
    toggleMobileMenu() {
        this.sidebar?.classList.toggle('open');
    }
    
    /**
     * Cerrar menú móvil
     */
    closeMobileMenu() {
        this.sidebar?.classList.remove('open');
    }
    
    /**
     * Obtener página actual
     */
    getCurrentPage() {
        return state.get('currentPage');
    }
}

// Instancia única
export const navigation = new NavigationManager();
