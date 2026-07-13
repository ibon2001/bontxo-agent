/**
 * Página de Historial
 */

import { supabaseClient } from '../supabase.js';

class HistoryPage {
    constructor() {
        this.history = [];
        this.initialized = false;
    }
    
    /**
     * Renderizar página
     */
    async render() {
        const container = document.getElementById('history-list');
        if (!container) return;
        
        try {
            this.history = await supabaseClient.getHistory();
            
            if (this.history.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="icon">📅</div>
                        <h3>Sin registros todavía</h3>
                        <p>Empieza a registrar tu día a día para ver tu historial</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = this.history.map(entry => this.renderEntry(entry)).join('');
            this.initialized = true;
        } catch (error) {
            console.error('Error cargando historial:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">⚠️</div>
                    <h3>Error al cargar</h3>
                    <p>No se pudo cargar el historial</p>
                </div>
            `;
        }
    }
    
    /**
     * Renderizar entrada de historial
     */
    renderEntry(entry) {
        const moodEmoji = this.getMoodEmoji(entry.animo);
        const moodTagClass = this.getMoodTagClass(entry.animo);
        
        return `
            <div class="card" style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <strong>${this.formatDate(entry.fecha)}</strong>
                    <span class="tag ${moodTagClass}">${moodEmoji}</span>
                </div>
                <div class="grid grid-4" style="margin-bottom: 12px;">
                    <div><small style="color: var(--text-muted)">Energía</small><br>${entry.energia || '-'}/10</div>
                    <div><small style="color: var(--text-muted)">Productividad</small><br>${entry.productividad || '-'}/10</div>
                    <div><small style="color: var(--text-muted)">Diversión</small><br>${entry.diversion || '-'}/10</div>
                    <div><small style="color: var(--text-muted)">Estrés</small><br>${entry.estres || '-'}/10</div>
                </div>
                ${entry.salio_bien ? `<p style="color: var(--success); font-size: 0.85rem;">✓ ${entry.salio_bien}</p>` : ''}
                ${entry.aprendio ? `<p style="color: var(--accent); font-size: 0.85rem;">📚 ${entry.aprendio}</p>` : ''}
                ${entry.manana_quiere ? `<p style="color: var(--warning); font-size: 0.85rem;">🎯 ${entry.manana_quiere}</p>` : ''}
            </div>
        `;
    }
    
    /**
     * Obtener emoji de mood
     */
    getMoodEmoji(mood) {
        if (!mood) return '❓';
        const emojis = ['😫', '😔', '😐', '🙂', '😊'];
        return emojis[mood - 1] || '❓';
    }
    
    /**
     * Obtener clase de tag según mood
     */
    getMoodTagClass(mood) {
        if (mood >= 4) return 'success';
        if (mood >= 3) return 'accent';
        return 'warning';
    }
    
    /**
     * Formatear fecha
     */
    formatDate(date) {
        return new Date(date).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    }
}

// Instancia singleton
export const historyPage = new HistoryPage();
