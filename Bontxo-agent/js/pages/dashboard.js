/**
 * Página Dashboard - Vista principal
 */

import { CONFIG } from '../config.js';
import { state, selectors } from '../state.js';
import { supabaseClient } from '../supabase.js';
import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';

class DashboardPage {
    constructor() {
        this.initialized = false;
    }
    
    /**
     * Renderizar página
     */
    render() {
        this.updateGreeting();
        this.updateBriefing();
        this.updateTodayStats();
        this.updateEnergyMeter();
        this.updateActiveProjects();
        this.updateSuggestion();
        this.initialized = true;
    }
    
    /**
     * Actualizar saludo
     */
    updateGreeting() {
        const hour = new Date().getHours();
        let greeting = 'Buenos días';
        if (hour >= 12 && hour < 18) greeting = 'Buenas tardes';
        else if (hour >= 18) greeting = 'Buenas noches';
        
        const greetingEl = document.getElementById('welcome-greeting');
        const nameEl = document.getElementById('welcome-name');
        const dateEl = document.getElementById('welcome-date');
        const profile = state.get('profile');
        
        if (greetingEl) greetingEl.textContent = greeting;
        if (nameEl) nameEl.textContent = profile?.nombre || 'Usuario';
        if (dateEl) dateEl.textContent = this.formatDate(new Date());
    }
    
    /**
     * Actualizar briefing
     */
    updateBriefing() {
        const titleEl = document.getElementById('briefing-title');
        const contentEl = document.getElementById('briefing-content');
        const todayEntry = state.get('todayEntry');
        const hour = new Date().getHours();
        
        if (!titleEl || !contentEl) return;
        
        let suggestion = '';
        let content = '';
        
        if (hour < 12) {
            suggestion = '¿Qué tal si hoy...';
            if (!todayEntry) {
                content = 'Empieza el día registrando cómo te sientes. Esto me ayuda a darte mejores recomendaciones.';
            } else if (todayEntry.energia >= 7) {
                content = 'Tienes energía para cosas grandes. ¿Un proyecto ambicioso o aprender algo nuevo?';
            } else if (todayEntry.energia >= 4) {
                content = 'Día moderado. Trabaja en lo que tengas pendiente, pero sin presionar.';
            } else {
                content = 'Día para ir suave. Caminar, leer, o simplemente descansar están bien.';
            }
        } else if (hour < 18) {
            suggestion = 'Por la tarde...';
            if (todayEntry?.productividad < 5) {
                content = 'Aún hay tiempo para hacer algo productivo. ¿Un proyecto corto o una actividad creativa?';
            } else {
                content = 'Si ya cumpliste tus objetivos, date un respiro. El descanso es parte del éxito.';
            }
        } else {
            suggestion = 'Para terminar el día...';
            content = '¿Has hecho tu retrospectiva? Es el momento de reflexionar sobre lo aprendido y planificar mañana.';
        }
        
        titleEl.textContent = suggestion;
        contentEl.textContent = content;
    }
    
    /**
     * Actualizar estadísticas del día
     */
    updateTodayStats() {
        const todayEntry = state.get('todayEntry');
        
        const setStat = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value ?? '-';
        };
        
        setStat('stat-energia', todayEntry?.energia);
        setStat('stat-animo', todayEntry?.animo);
        setStat('stat-productividad', todayEntry?.productividad);
        setStat('stat-diversion', todayEntry?.diversion);
        setStat('stat-estres', todayEntry?.estres);
    }
    
    /**
     * Actualizar medidor de energía
     */
    updateEnergyMeter() {
        const energyLevel = selectors.getTodayEnergy();
        const bars = document.querySelectorAll('.energy-bar');
        const textEl = document.getElementById('energy-text');
        const iconEl = document.getElementById('energy-icon');
        
        if (!bars.length || !textEl || !iconEl) return;
        
        // Resetear bars
        bars.forEach(bar => {
            bar.classList.remove('active', 'warning', 'danger');
        });
        
        if (energyLevel === null) {
            textEl.textContent = 'Nivel de energía no registrado hoy';
            iconEl.textContent = '⚡';
            return;
        }
        
        // Activar bars según nivel
        bars.forEach((bar, index) => {
            if (index < energyLevel) {
                bar.classList.add('active');
                if (energyLevel <= 3) bar.classList.add('danger');
                else if (energyLevel <= 5) bar.classList.add('warning');
            }
        });
        
        // Texto e icono
        const levels = CONFIG.ENERGY_LEVELS;
        if (energyLevel >= 7) {
            textEl.textContent = levels.HIGH.text;
            iconEl.textContent = levels.HIGH.icon;
        } else if (energyLevel >= 4) {
            textEl.textContent = levels.MEDIUM.text;
            iconEl.textContent = levels.MEDIUM.icon;
        } else {
            textEl.textContent = levels.LOW.text;
            iconEl.textContent = levels.LOW.icon;
        }
    }
    
    /**
     * Actualizar proyectos activos
     */
    updateActiveProjects() {
        const container = document.getElementById('active-projects-list');
        if (!container) return;
        
        const activeProjects = selectors.getActiveProjects().slice(0, 3);
        
        if (activeProjects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🚀</div>
                    <h3>Sin proyectos activos</h3>
                    <p>Crea tu primer proyecto para empezar a trackear tu progreso</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = activeProjects.map(p => {
            const progress = selectors.getProjectProgress(p);
            const mastered = selectors.getMasteredCompetencies(p);
            const total = (p.competencias || []).length;
            
            return `
                <div class="project-card" data-project-id="${p.id}">
                    <div class="project-header">
                        <div>
                            <div class="project-name">${p.nombre}</div>
                            <div class="project-meta">${p.estado} · ${p.nivel_estimado}</div>
                        </div>
                        <span class="tag accent">${progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="project-stats">
                        <span class="project-stat"><strong>${p.horas_invertidas || 0}</strong> horas</span>
                        <span class="project-stat"><strong>${mastered}</strong>/${total} competencias</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Actualizar sugerencia del día
     */
    updateSuggestion() {
        const card = document.getElementById('daily-suggestion');
        if (!card) return;
        
        const activities = state.get('activities');
        const unproven = activities.filter(a => a.gusta === null || a.gusta === undefined);
        const random = unproven[Math.floor(Math.random() * unproven.length)] || activities[0];
        
        if (random) {
            card.innerHTML = `
                <div class="suggestion-icon">✨</div>
                <div class="suggestion-content">
                    <h4>${random.nombre}</h4>
                    <p>${random.descripcion || 'Una actividad para probar'}</p>
                    <button class="btn btn-sm btn-primary" onclick="window.dashboardPage?.markSuggestionTried('${random.nombre}')">
                        Marcar como probada
                    </button>
                </div>
            `;
        }
    }
    
    /**
     * Marcar sugerencia como probada
     */
    async markSuggestionTried(name) {
        try {
            await supabaseClient.registerActivity(name);
            toast.success('Actividad registrada');
        } catch (error) {
            console.error(error);
            toast.error('Error al registrar');
        }
    }
    
    /**
     * Formatear fecha
     */
    formatDate(date) {
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    }
    
    /**
     * Refrescar datos
     */
    async refresh() {
        try {
            const [todayEntry, projects] = await Promise.all([
                supabaseClient.getTodayEntry(),
                supabaseClient.getProjects()
            ]);
            
            state.setMultiple({
                todayEntry,
                projects
            });
            
            this.render();
        } catch (error) {
            console.error('Error refreshing dashboard:', error);
            toast.error('Error al actualizar');
        }
    }
}

// Instancia singleton
export const dashboardPage = new DashboardPage();
