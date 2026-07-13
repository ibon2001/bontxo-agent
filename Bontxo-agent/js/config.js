/**
 * Configuración global de Bontxo Agent
 * Centraliza todas las constantes y configuraciones
 */

export const CONFIG = {
    // Claves de localStorage
    STORAGE_KEYS: {
        SUPABASE_URL: 'bontxo_supabase_url',
        SUPABASE_KEY: 'bontxo_supabase_key',
        THEME: 'bontxo_theme'
    },
    
    // Supabase (se carga dinámicamente desde localStorage)
    get SUPABASE_URL() {
        return localStorage.getItem(this.STORAGE_KEYS.SUPABASE_URL) || '';
    },
    get SUPABASE_ANON_KEY() {
        return localStorage.getItem(this.STORAGE_KEYS.SUPABASE_KEY) || '';
    },
    
    // Rutas de páginas
    PAGES: {
        DASHBOARD: 'dashboard',
        DAILY: 'daily',
        PROJECTS: 'projects',
        ACTIVITIES: 'activities',
        INSIGHTS: 'insights',
        HISTORY: 'history',
        PROFILE: 'profile',
        SETTINGS: 'settings'
    },
    
    // Estados de proyecto
    PROJECT_STATES: {
        ACTIVE: 'activo',
        PAUSED: 'pausado',
        COMPLETED: 'completado',
        ABANDONED: 'abandonado'
    },
    
    // Niveles de energía
    ENERGY_LEVELS: {
        LOW: { max: 3, color: 'danger', icon: '🪫', text: 'Energía baja. Prioriza descanso.' },
        MEDIUM: { max: 5, color: 'warning', icon: '🔋', text: 'Energía moderada. Toma descansos.' },
        HIGH: { max: 10, color: 'success', icon: '⚡', text: '¡Alta energía! Perfecto para tareas desafiantes.' }
    },
    
    // Configuración de ratings
    RATINGS: {
        MIN: 1,
        MAX: 10,
        DEFAULT: 5
    },
    
    // Tiempo de espera para timeouts (ms)
    TIMEOUT: 10000,
    
    // Número de registros de historial a mostrar
    HISTORY_LIMIT: 30
};

// Función helper para verificar si Supabase está configurado
export function isSupabaseConfigured() {
    return Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);
}

// Función para guardar credenciales
export function saveSupabaseCredentials(url, key) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.SUPABASE_URL, url);
    localStorage.setItem(CONFIG.STORAGE_KEYS.SUPABASE_KEY, key);
}

// Función para limpiar credenciales
export function clearSupabaseCredentials() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.SUPABASE_URL);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.SUPABASE_KEY);
}
