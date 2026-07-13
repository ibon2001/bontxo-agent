/**
 * Página de Insights - Análisis
 */

import { CONFIG } from '../config.js';
import { state } from '../state.js';
import { supabaseClient } from '../supabase.js';

class InsightsPage {
    constructor() {
        this.weekData = [];
        this.initialized = false;
    }
    
    /**
     * Renderizar página
     */
    async render() {
        try {
            // Cargar datos de la semana
            this.weekData = await supabaseClient.getWeekEntries();
            
            if (this.weekData.length === 0) {
                this.renderEmpty();
                return;
            }
            
            this.updateCharts();
            this.generateInsights();
            this.initialized = true;
        } catch (error) {
            console.error('Error cargando insights:', error);
        }
    }
    
    /**
     * Renderizar estado vacío
     */
    renderEmpty() {
        const insightsList = document.getElementById('insights-list');
        if (!insightsList) return;
        
        insightsList.innerHTML = `
            <div class="empty-state">
                <div class="icon">🤖</div>
                <h3>Sin insights todavía</h3>
                <p>Completa registros diarios para ver análisis y patrones</p>
            </div>
        `;
        
        // Resetear barras
        ['bar-energia', 'bar-animo', 'bar-productividad', 'bar-diversion'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.width = '0%';
                el.textContent = '0';
            }
        });
    }
    
    /**
     * Actualizar gráficos
     */
    updateCharts() {
        const avg = this.calculateAverages();
        
        // Actualizar barras
        Object.entries(avg).forEach(([key, value]) => {
            const bar = document.getElementById(`bar-${key}`);
            if (bar) {
                bar.style.width = `${value * 10}%`;
                bar.textContent = value > 0 ? value.toFixed(1) : '0';
            }
        });
    }
    
    /**
     * Calcular promedios
     */
    calculateAverages() {
        const validEntries = this.weekData.filter(e => e.energia !== null);
        
        const sum = (arr, key) => arr.reduce((acc, e) => acc + (e[key] || 0), 0);
        const count = (arr, key) => arr.filter(e => e[key] !== null && e[key] !== undefined).length;
        
        return {
            energia: count(validEntries, 'energia') > 0 ? sum(validEntries, 'energia') / count(validEntries, 'energia') : 0,
            animo: count(validEntries, 'animo') > 0 ? sum(validEntries, 'animo') / count(validEntries, 'animo') : 0,
            productividad: count(validEntries, 'productividad') > 0 ? sum(validEntries, 'productividad') / count(validEntries, 'productividad') : 0,
            diversion: count(validEntries, 'diversion') > 0 ? sum(validEntries, 'diversion') / count(validEntries, 'diversion') : 0
        };
    }
    
    /**
     * Generar insights
     */
    generateInsights() {
        const insights = [];
        const avg = this.calculateAverages();
        
        // Insight: Energía vs Productividad
        if (avg.energia && avg.productividad) {
            if (avg.energia > avg.productividad + 1) {
                insights.push({
                    icon: '⚡',
                    title: 'Energía desaprovechada',
                    content: 'Tienes más energía de la que estás usando productivamente. Podrías tomar proyectos más ambiciosos.'
                });
            } else if (avg.productividad > avg.energia + 1) {
                insights.push({
                    icon: '🛑',
                    title: 'Sobreesfuerzo detectado',
                    content: 'Tu productividad supera tu nivel de energía. Cuidado con el burnout. Considera añadir más descanso.'
                });
            }
        }
        
        // Insight: Diversión baja
        if (avg.diversion && avg.diversion < 4) {
            insights.push({
                icon: '🎉',
                title: 'Falta de diversión',
                content: 'Tu nivel de diversión está bajo. Recuerda que el ocio es productivo: busca actividades que disfrutes.'
            });
        }
        
        // Insight: Estrés
        const avgEstres = this.getAverage('estres');
        if (avgEstres > 7) {
            insights.push({
                icon: '😰',
                title: 'Estrés elevado',
                content: 'Tu nivel de estrés es alto. Prioriza el descanso y actividades que te relaxen.'
            });
        }
        
        // Insight: Constancia
        if (this.weekData.length >= 5) {
            insights.push({
                icon: '📈',
                title: 'Buena constancia',
                content: `Has registrado ${this.weekData.length} de los últimos 7 días. ¡Sigue así!`
            });
        }
        
        // Insight: Sueño
        const avgSleep = this.getAverage('horas_dormidas');
        if (avgSleep > 0) {
            if (avgSleep < 6) {
                insights.push({
                    icon: '😴',
                    title: 'Poco sueño',
                    content: `Duermes un promedio de ${avgSleep.toFixed(1)} horas. Intenta dormir más para rendir mejor.`
                });
            } else if (avgSleep >= 7 && avg.energia > 5) {
                insights.push({
                    icon: '😊',
                    title: 'Buen descanso',
                    content: 'Duermes bien y tu energía es buena. ¡Sigue así!'
                });
            }
        }
        
        this.renderInsights(insights);
    }
    
    /**
     * Obtener promedio de un campo
     */
    getAverage(key) {
        const valid = this.weekData.filter(e => e[key] !== null && e[key] !== undefined);
        if (valid.length === 0) return 0;
        return valid.reduce((acc, e) => acc + e[key], 0) / valid.length;
    }
    
    /**
     * Renderizar insights
     */
    renderInsights(insights) {
        const container = document.getElementById('insights-list');
        if (!container) return;
        
        if (insights.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🤖</div>
                    <h3>Sin insights todavía</h3>
                    <p>Los insights aparecerán cuando haya más datos</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = insights.map(insight => `
            <div class="insight-card">
                <div class="insight-header">
                    <span class="insight-icon">${insight.icon}</span>
                    <span class="insight-title">${insight.title}</span>
                </div>
                <p class="insight-content">${insight.content}</p>
            </div>
        `).join('');
    }
}

// Instancia singleton
export const insightsPage = new InsightsPage();
