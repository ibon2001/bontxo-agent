/**
 * Página Registro Diario
 */

import { CONFIG } from '../config.js';
import { state } from '../state.js';
import { supabaseClient } from '../supabase.js';
import { toast } from '../components/toast.js';

class DailyPage {
    constructor() {
        this.selectedMood = null;
        this.selectedRatings = {
            energia: null,
            productividad: null,
            diversion: null,
            estres: null
        };
        this.initialized = false;
    }
    
    /**
     * Renderizar página
     */
    render() {
        this.setupMoodSelector();
        this.setupRatingScales();
        this.loadTodayData();
        this.initialized = true;
    }
    
    /**
     * Configurar selector de estado de ánimo
     */
    setupMoodSelector() {
        const selector = document.getElementById('mood-selector');
        if (!selector) return;
        
        selector.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selector.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedMood = parseInt(btn.dataset.mood);
            });
        });
    }
    
    /**
     * Configurar escalas de rating
     */
    setupRatingScales() {
        const metrics = [
            { id: 'rating-energia', key: 'energia' },
            { id: 'rating-productividad', key: 'productividad' },
            { id: 'rating-diversion', key: 'diversion' },
            { id: 'rating-estres', key: 'estres' }
        ];
        
        metrics.forEach(({ id, key }) => {
            const container = document.getElementById(id);
            if (!container) return;
            
            container.querySelectorAll('.rating-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    container.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    this.selectedRatings[key] = parseInt(btn.textContent);
                });
            });
        });
    }
    
    /**
     * Cargar datos de hoy
     */
    loadTodayData() {
        const todayEntry = state.get('todayEntry');
        if (!todayEntry) return;
        
        // Cargar mood
        if (todayEntry.animo) {
            this.selectedMood = todayEntry.animo;
            const btn = document.querySelector(`#mood-selector .mood-btn[data-mood="${todayEntry.animo}"]`);
            if (btn) btn.classList.add('selected');
        }
        
        // Cargar ratings
        Object.entries(todayEntry).forEach(([key, value]) => {
            if (this.selectedRatings.hasOwnProperty(key) && value !== null) {
                this.selectedRatings[key] = value;
                const container = document.getElementById(`rating-${key}`);
                if (container) {
                    const btn = container.querySelector(`.rating-btn:nth-child(${value})`);
                    if (btn) btn.classList.add('selected');
                }
            }
        });
        
        // Cargar campos de texto
        this.setFieldValue('horas-dormidas', todayEntry.horas_dormidas);
        this.setFieldValue('ejercicio-minutos', todayEntry.ejercicio_minutos);
        this.setFieldValue('lectura-minutos', todayEntry.lectura_minutos);
        this.setFieldValue('tiempo-pantalla', todayEntry.tiempo_pantalla_minutos);
        this.setFieldValue('salio-bien', todayEntry.salio_bien);
        this.setFieldValue('salio-mal', todayEntry.salio_mal);
        this.setFieldValue('aprendio', todayEntry.aprendio);
        this.setFieldValue('manana-quiere', todayEntry.manana_quiere);
    }
    
    /**
     * Guardar valor en campo
     */
    setFieldValue(id, value) {
        const el = document.getElementById(id);
        if (el && value !== null && value !== undefined) {
            el.value = value;
        }
    }
    
    /**
     * Obtener valor de campo
     */
    getFieldValue(id) {
        const el = document.getElementById(id);
        if (!el) return null;
        
        if (el.type === 'number') {
            const val = parseFloat(el.value) || null;
            return val;
        }
        
        return el.value.trim() || null;
    }
    
    /**
     * Guardar registro
     */
    async save() {
        const entry = {
            energia: this.selectedRatings.energia,
            animo: this.selectedMood,
            productividad: this.selectedRatings.productividad,
            diversion: this.selectedRatings.diversion,
            estres: this.selectedRatings.estres,
            horas_dormidas: this.getFieldValue('horas-dormidas'),
            ejercicio_minutos: this.getFieldValue('ejercicio-minutos'),
            lectura_minutos: this.getFieldValue('lectura-minutos'),
            tiempo_pantalla_minutos: this.getFieldValue('tiempo-pantalla'),
            salio_bien: this.getFieldValue('salio-bien'),
            salio_mal: this.getFieldValue('salio-mal'),
            aprendio: this.getFieldValue('aprendio'),
            manana_quiere: this.getFieldValue('manana-quiere')
        };
        
        // Validar que al menos haya algo
        const hasData = Object.values(entry).some(v => v !== null && v !== '');
        if (!hasData) {
            toast.warning('Rellena al menos un campo');
            return;
        }
        
        try {
            const saved = await supabaseClient.saveDailyEntry(entry);
            state.set('todayEntry', saved);
            toast.success('Registro guardado correctamente');
        } catch (error) {
            console.error('Error guardando registro:', error);
            toast.error('Error al guardar el registro');
        }
    }
}

// Instancia singleton
export const dailyPage = new DailyPage();

// Binding global para el botón guardar
window.saveDailyEntry = () => dailyPage.save();
