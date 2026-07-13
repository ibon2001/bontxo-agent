/**
 * Estado global de la aplicación
 * Gestiona el estado de todos los módulos
 */

import { CONFIG } from './config.js';

// Estado inicial
const initialState = {
    // Usuario y perfil
    profile: null,
    preferences: null,
    
    // Datos del día
    todayEntry: null,
    
    // Proyectos
    projects: [],
    
    // Actividades
    activities: [],
    
    // Navegación
    currentPage: CONFIG.PAGES.DASHBOARD,
    
    // UI State
    isLoading: true,
    error: null,
    
    // Setup
    isSetupComplete: false
};

// Crear el store reactivo
class StateManager {
    constructor() {
        this.state = { ...initialState };
        this.listeners = new Map();
    }
    
    // Obtener estado
    get(key) {
        if (key) {
            return this.state[key];
        }
        return { ...this.state };
    }
    
    // Actualizar estado
    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;
        this.notify(key, value, oldValue);
    }
    
    // Actualizar múltiples valores
    setMultiple(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.state[key] = value;
            this.notify(key, value, this.state[key]);
        });
    }
    
    // Suscribirse a cambios
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
        
        // Devolver función para cancelar suscripción
        return () => {
            this.listeners.get(key).delete(callback);
        };
    }
    
    // Notificar a los listeners
    notify(key, newValue, oldValue) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (error) {
                    console.error(`Error en listener de ${key}:`, error);
                }
            });
        }
    }
    
    // Resetear estado
    reset() {
        this.state = { ...initialState };
        this.listeners.clear();
    }
}

// Instancia única del estado
export const state = new StateManager();

// Selectors - funciones helper para obtener datos derivados
export const selectors = {
    // Proyectos activos
    getActiveProjects: () => {
        return state.get('projects').filter(p => p.estado === CONFIG.PROJECT_STATES.ACTIVE);
    },
    
    // Proyectos completados
    getCompletedProjects: () => {
        return state.get('projects').filter(p => p.estado === CONFIG.PROJECT_STATES.COMPLETED);
    },
    
    // Usuario logueado
    isLoggedIn: () => {
        return state.get('profile') !== null;
    },
    
    // Energía del día actual
    getTodayEnergy: () => {
        return state.get('todayEntry')?.energia || null;
    },
    
    // Actividades por categoría
    getActivitiesByCategory: (category) => {
        if (category === 'all') return state.get('activities');
        return state.get('activities').filter(a => a.categoria === category);
    },
    
    // Progreso de un proyecto
    getProjectProgress: (project) => {
        const total = (project.competencias || []).length;
        if (total === 0) return 0;
        const mastered = (project.competencias_dominadas || []).length;
        return Math.round((mastered / total) * 100);
    },
    
    // Obtener competencias dominadas de un proyecto
    getMasteredCompetencies: (project) => {
        return (project.competencias_dominadas || []).length;
    }
};
