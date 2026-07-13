/**
 * Página de Configuración
 */

import { CONFIG, clearSupabaseCredentials } from '../config.js';
import { supabaseClient } from '../supabase.js';
import { toast } from '../components/toast.js';
import { loading } from '../components/loading.js';

class SettingsPage {
    constructor() {
        this.initialized = false;
    }
    
    /**
     * Renderizar página
     */
    render() {
        this.updateConnectionStatus();
        this.setupExport();
        this.setupReset();
        this.initialized = true;
    }
    
    /**
     * Actualizar estado de conexión
     */
    updateConnectionStatus() {
        const urlEl = document.getElementById('supabase-url');
        const statusEl = document.getElementById('connection-status');
        
        if (urlEl) {
            urlEl.textContent = CONFIG.SUPABASE_URL ? 
                CONFIG.SUPABASE_URL.substring(0, 30) + '...' : 
                'No configurado';
        }
        
        if (statusEl) {
            statusEl.textContent = supabaseClient.isConnected ? 
                '✓ Conectado' : 
                '⚠ No conectado';
        }
    }
    
    /**
     * Configurar exportación
     */
    setupExport() {
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.onclick = () => this.exportData();
        }
    }
    
    /**
     * Configurar reseteo
     */
    setupReset() {
        const resetBtn = document.getElementById('reset-data-btn');
        if (resetBtn) {
            resetBtn.onclick = () => this.resetData();
        }
    }
    
    /**
     * Exportar datos
     */
    async exportData() {
        try {
            const data = await supabaseClient.exportAllData();
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bontxo-agent-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            toast.success('Datos exportados');
        } catch (error) {
            console.error(error);
            toast.error('Error al exportar datos');
        }
    }
    
    /**
     * Resetear datos
     */
    async resetData() {
        const confirmed = confirm('¿Estás seguro? Esto eliminará todas las credenciales guardadas.');
        if (!confirmed) return;
        
        clearSupabaseCredentials();
        window.location.reload();
    }
}

// Instancia singleton
export const settingsPage = new SettingsPage();
