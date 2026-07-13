/**
 * Página de Proyectos
 */

import { CONFIG } from '../config.js';
import { state, selectors } from '../state.js';
import { supabaseClient } from '../supabase.js';
import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';

class ProjectsPage {
    constructor() {
        this.initialized = false;
    }
    
    /**
     * Renderizar página
     */
    render() {
        this.updateStats();
        this.renderProjects();
        this.initialized = true;
    }
    
    /**
     * Actualizar estadísticas
     */
    updateStats() {
        const projects = state.get('projects');
        
        const setStat = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        
        setStat('total-projects', projects.length);
        setStat('active-projects', selectors.getActiveProjects().length);
        setStat('completed-projects', selectors.getCompletedProjects().length);
    }
    
    /**
     * Renderizar lista de proyectos
     */
    renderProjects() {
        const container = document.getElementById('projects-list');
        if (!container) return;
        
        const projects = state.get('projects');
        
        if (projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🚀</div>
                    <h3>Sin proyectos todavía</h3>
                    <p>Empieza tu primer proyecto para trackear tu progreso</p>
                    <button class="btn btn-primary" onclick="openModal('new-project-modal')" style="margin-top: 16px;">
                        Crear Proyecto
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = projects.map(p => this.renderProjectCard(p)).join('');
        
        // Configurar eventos de los proyectos
        this.setupProjectEvents();
    }
    
    /**
     * Renderizar tarjeta de proyecto
     */
    renderProjectCard(project) {
        const progress = selectors.getProjectProgress(project);
        const mastered = selectors.getMasteredCompetencies(project);
        const total = (project.competencias || []).length;
        const stateTagClass = this.getStateTagClass(project.estado);
        
        return `
            <div class="project-card" data-project-id="${project.id}">
                <div class="project-header">
                    <div>
                        <div class="project-name">${project.nombre}</div>
                        <div class="project-meta">
                            <span>${project.estado}</span>
                            <span>·</span>
                            <span>${project.nivel_estimado}</span>
                            <span>·</span>
                            <span>${this.formatDate(project.fecha_inicio)}</span>
                        </div>
                    </div>
                    <span class="tag ${stateTagClass}">${progress}%</span>
                </div>
                ${project.descripcion ? `<p class="project-description">${project.descripcion}</p>` : ''}
                <div class="competencies">
                    ${(project.competencias || []).map(c => this.renderCompetency(project.id, c)).join('')}
                </div>
                <div class="project-stats">
                    <span class="project-stat"><strong>${(project.horas_invertidas || 0).toFixed(1)}</strong> horas invertidas</span>
                    <span class="project-stat"><strong>${mastered}</strong> de <strong>${total}</strong> competencias</span>
                </div>
                <div class="project-actions">
                    <button class="btn btn-sm btn-secondary" data-action="log-session" data-project-id="${project.id}">
                        + Registrar sesión
                    </button>
                    ${project.estado === CONFIG.PROJECT_STATES.ACTIVE ? `
                        <button class="btn btn-sm btn-success" data-action="complete" data-project-id="${project.id}">
                            Marcar completo
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    /**
     * Renderizar competencia
     */
    renderCompetency(projectId, competency) {
        const project = state.get('projects').find(p => p.id === projectId);
        const isMastered = (project?.competencias_dominadas || []).includes(competency);
        
        return `
            <span class="competency ${isMastered ? 'mastered' : ''}" 
                  data-action="toggle-competency" 
                  data-project-id="${projectId}" 
                  data-competency="${competency}">
                <span class="check">${isMastered ? '✓' : ''}</span>
                ${competency}
            </span>
        `;
    }
    
    /**
     * Configurar eventos de proyectos
     */
    setupProjectEvents() {
        // Toggle competencia
        document.querySelectorAll('[data-action="toggle-competency"]').forEach(el => {
            el.addEventListener('click', async (e) => {
                e.stopPropagation();
                const { projectId, competency } = el.dataset;
                await this.toggleCompetency(projectId, competency);
            });
        });
        
        // Registrar sesión
        document.querySelectorAll('[data-action="log-session"]').forEach(el => {
            el.addEventListener('click', async (e) => {
                e.stopPropagation();
                const { projectId } = el.dataset;
                await this.promptLogSession(projectId);
            });
        });
        
        // Completar proyecto
        document.querySelectorAll('[data-action="complete"]').forEach(el => {
            el.addEventListener('click', async (e) => {
                e.stopPropagation();
                const { projectId } = el.dataset;
                await this.completeProject(projectId);
            });
        });
    }
    
    /**
     * Alternar competencia
     */
    async toggleCompetency(projectId, competency) {
        try {
            await supabaseClient.toggleCompetency(projectId, competency);
            
            // Actualizar estado local
            const projects = state.get('projects');
            const projectIndex = projects.findIndex(p => p.id === projectId);
            if (projectIndex !== -1) {
                let mastered = projects[projectIndex].competencias_dominadas || [];
                if (mastered.includes(competency)) {
                    mastered = mastered.filter(c => c !== competency);
                } else {
                    mastered.push(competency);
                }
                projects[projectIndex].competencias_dominadas = mastered;
                state.set('projects', [...projects]);
            }
            
            this.render();
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar');
        }
    }
    
    /**
     * Solicitar registro de sesión
     */
    async promptLogSession(projectId) {
        const duration = await modal.prompt('¿Cuántos minutos has trabajado?', '30');
        if (!duration) return;
        
        const minutes = parseInt(duration);
        if (isNaN(minutes) || minutes <= 0) {
            toast.warning('Introduce un número válido');
            return;
        }
        
        try {
            await supabaseClient.logSession(projectId, minutes);
            
            // Recargar proyectos
            const projects = await supabaseClient.getProjects();
            state.set('projects', projects);
            
            this.render();
            toast.success('Sesión registrada');
        } catch (error) {
            console.error(error);
            toast.error('Error al registrar sesión');
        }
    }
    
    /**
     * Completar proyecto
     */
    async completeProject(projectId) {
        const confirmed = await modal.confirm('¿Marcar este proyecto como completado?');
        if (!confirmed) return;
        
        try {
            await supabaseClient.completeProject(projectId);
            
            // Recargar proyectos
            const projects = await supabaseClient.getProjects();
            state.set('projects', projects);
            
            this.render();
            toast.success('¡Proyecto completado! 🎉');
        } catch (error) {
            console.error(error);
            toast.error('Error al completar proyecto');
        }
    }
    
    /**
     * Crear nuevo proyecto
     */
    async createProject() {
        const name = document.getElementById('project-name')?.value.trim();
        const description = document.getElementById('project-description')?.value.trim() || '';
        const competenciesStr = document.getElementById('project-competencies')?.value.trim() || '';
        const level = document.getElementById('project-level')?.value || 'principiante';
        
        if (!name) {
            toast.warning('El nombre es obligatorio');
            return;
        }
        
        const competencies = competenciesStr
            .split(',')
            .map(s => s.trim())
            .filter(s => s);
        
        try {
            await supabaseClient.createProject({
                nombre: name,
                descripcion: description,
                competencias: competencies,
                nivel_estimado: level
            });
            
            // Recargar proyectos
            const projects = await supabaseClient.getProjects();
            state.set('projects', projects);
            
            // Limpiar form
            document.getElementById('project-name').value = '';
            document.getElementById('project-description').value = '';
            document.getElementById('project-competencies').value = '';
            
            // Cerrar modal
            modal.close('new-project-modal');
            
            this.render();
            toast.success('Proyecto creado');
        } catch (error) {
            console.error(error);
            toast.error('Error al crear proyecto');
        }
    }
    
    /**
     * Obtener clase de tag según estado
     */
    getStateTagClass(state) {
        const classes = {
            'activo': 'accent',
            'pausado': 'warning',
            'completado': 'success'
        };
        return classes[state] || 'accent';
    }
    
    /**
     * Formatear fecha
     */
    formatDate(date) {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        });
    }
}

// Instancia singleton
export const projectsPage = new ProjectsPage();

// Bindings globales
window.createProject = () => projectsPage.createProject();
