/**
 * Página de Actividades
 */

import { state } from '../state.js';
import { supabaseClient } from '../supabase.js';
import { toast } from '../components/toast.js';

class ActivitiesPage {
    constructor() {
        this.currentFilter = 'all';
        this.initialized = false;
    }
    
    /**
     * Renderizar página
     */
    render() {
        this.setupFilters();
        this.renderActivities();
        this.initialized = true;
    }
    
    /**
     * Configurar filtros
     */
    setupFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.renderActivities();
            });
        });
    }
    
    /**
     * Renderizar lista de actividades
     */
    renderActivities() {
        const container = document.getElementById('activities-list');
        if (!container) return;
        
        let activities = state.get('activities');
        
        if (this.currentFilter !== 'all') {
            activities = activities.filter(a => a.categoria === this.currentFilter);
        }
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">✨</div>
                    <h3>Sin actividades en esta categoría</h3>
                </div>
            `;
            return;
        }
        
        container.innerHTML = activities.map(a => `
            <div class="activity-card" data-activity-id="${a.id}">
                <div class="activity-icon">${this.getCategoryEmoji(a.categoria)}</div>
                <div class="activity-content">
                    <div class="activity-name">${a.nombre}</div>
                    <div class="activity-meta">
                        <span>${a.categoria}</span>
                        <span>·</span>
                        <span>⚡ ${a.energia_necesaria}/10</span>
                        <span>·</span>
                        <span>⏱️ ${a.tiempo_estimado_minutos} min</span>
                        <span>·</span>
                        <span>💰 ${a.presupuesto_necesario}</span>
                    </div>
                    <p class="activity-description">${a.descripcion || ''}</p>
                </div>
                <div class="activity-actions">
                    ${a.gusta === true ? '<span class="tag success">✓ Me gusta</span>' : ''}
                    ${a.gusta === false ? '<span class="tag warning">✗ No gusta</span>' : ''}
                    <button class="btn btn-sm btn-success" data-action="like" data-id="${a.id}">✓</button>
                    <button class="btn btn-sm btn-danger" data-action="dislike" data-id="${a.id}">✗</button>
                </div>
            </div>
        `).join('');
        
        // Configurar eventos
        this.setupActivityEvents();
    }
    
    /**
     * Configurar eventos de actividades
     */
    setupActivityEvents() {
        document.querySelectorAll('[data-action="like"]').forEach(btn => {
            btn.addEventListener('click', () => this.markLike(btn.dataset.id, true));
        });
        
        document.querySelectorAll('[data-action="dislike"]').forEach(btn => {
            btn.addEventListener('click', () => this.markLike(btn.dataset.id, false));
        });
    }
    
    /**
     * Marcar como gusta o no gusta
     */
    async markLike(activityId, gusta) {
        try {
            await supabaseClient.markActivityLike(activityId, gusta);
            
            // Actualizar estado local
            const activities = state.get('activities');
            const index = activities.findIndex(a => a.id === activityId);
            if (index !== -1) {
                activities[index].gusta = gusta;
                state.set('activities', [...activities]);
            }
            
            this.renderActivities();
            toast.success(gusta ? 'Marcado como gusta ✓' : 'Marcado como no gusta');
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar');
        }
    }
    
    /**
     * Obtener emoji según categoría
     */
    getCategoryEmoji(category) {
        const emojis = {
            'aprendizaje': '📚',
            'salud': '💪',
            'creatividad': '🎨',
            'social': '👥',
            'ocio': '🎮',
            'naturaleza': '🌿',
            'bienestar': '🧘'
        };
        return emojis[category] || '✨';
    }
}

// Instancia singleton
export const activitiesPage = new ActivitiesPage();
