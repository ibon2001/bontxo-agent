/**
 * Cliente de Supabase
 * Gestiona la conexión y todas las operaciones de base de datos
 */

import { CONFIG, isSupabaseConfigured } from './config.js';
import { state } from './state.js';

class SupabaseClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }
    
    /**
     * Inicializar conexión con Supabase
     */
    async connect() {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase no está configurado');
        }
        
        // Cargar SDK de Supabase si no está cargado
        if (typeof window.supabase === 'undefined') {
            await this.loadSDK();
        }
        
        try {
            this.client = window.supabase.createClient(
                CONFIG.SUPABASE_URL,
                CONFIG.SUPABASE_ANON_KEY
            );
            
            // Verificar conexión
            await this.testConnection();
            this.isConnected = true;
            
            return true;
        } catch (error) {
            console.error('Error conectando a Supabase:', error);
            this.isConnected = false;
            throw error;
        }
    }
    
    /**
     * Cargar SDK de Supabase dinámicamente
     */
    loadSDK() {
        return new Promise((resolve, reject) => {
            // Verificar si ya está en el DOM
            if (document.querySelector('script[src*="supabase"]')) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    /**
     * Probar conexión
     */
    async testConnection() {
        const { error } = await this.client.from('perfil').select('*').limit(1);
        if (error) throw error;
    }
    
    /**
     * Verificar si hay un perfil configurado
     */
    async hasProfile() {
        const { data } = await this.client.from('perfil').select('*').limit(1);
        return data && data.length > 0;
    }
    
    // ==================== PERFIL ====================
    
    async getProfile() {
        const { data, error } = await this.client
            .from('perfil')
            .select('*')
            .limit(1)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    }
    
    async createProfile(profileData) {
        const { data, error } = await this.client
            .from('perfil')
            .insert(profileData)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    async updateProfile(id, updates) {
        const { data, error } = await this.client
            .from('perfil')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    // ==================== PREFERENCIAS ====================
    
    async getPreferences() {
        const { data, error } = await this.client
            .from('preferencias')
            .select('*')
            .limit(1)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    }
    
    async createPreferences(prefsData) {
        const { data, error } = await this.client
            .from('preferencias')
            .insert(prefsData)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    async updatePreferences(id, updates) {
        const { data, error } = await this.client
            .from('preferencias')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    // ==================== REGISTRO DIARIO ====================
    
    async getTodayEntry() {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await this.client
            .from('registro_diario')
            .select('*')
            .eq('fecha', today)
            .limit(1)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    }
    
    async saveDailyEntry(entry) {
        const today = new Date().toISOString().split('T')[0];
        entry.fecha = today;
        
        const existing = await this.getTodayEntry();
        
        if (existing) {
            const { data, error } = await this.client
                .from('registro_diario')
                .update(entry)
                .eq('id', existing.id)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await this.client
                .from('registro_diario')
                .insert(entry)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        }
    }
    
    async getHistory(limit = CONFIG.HISTORY_LIMIT) {
        const { data, error } = await this.client
            .from('registro_diario')
            .select('*')
            .order('fecha', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data || [];
    }
    
    async getWeekEntries() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { data, error } = await this.client
            .from('registro_diario')
            .select('*')
            .gte('fecha', weekAgo.toISOString().split('T')[0]);
        
        if (error) throw error;
        return data || [];
    }
    
    // ==================== PROYECTOS ====================
    
    async getProjects() {
        const { data, error } = await this.client
            .from('proyectos')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    }
    
    async createProject(projectData) {
        const { data, error } = await this.client
            .from('proyectos')
            .insert({
                ...projectData,
                fecha_inicio: new Date().toISOString().split('T')[0],
                estado: CONFIG.PROJECT_STATES.ACTIVE
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    async updateProject(id, updates) {
        const { data, error } = await this.client
            .from('proyectos')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    async toggleCompetency(projectId, competency) {
        const project = state.get('projects').find(p => p.id === projectId);
        if (!project) throw new Error('Proyecto no encontrado');
        
        let mastered = project.competencias_dominadas || [];
        
        if (mastered.includes(competency)) {
            mastered = mastered.filter(c => c !== competency);
        } else {
            mastered.push(competency);
        }
        
        return this.updateProject(projectId, { competencias_dominadas: mastered });
    }
    
    async logSession(projectId, durationMinutes) {
        const project = state.get('projects').find(p => p.id === projectId);
        if (!project) throw new Error('Proyecto no encontrado');
        
        // Registrar sesión
        await this.client.from('sesiones_proyecto').insert({
            proyecto_id: projectId,
            fecha: new Date().toISOString().split('T')[0],
            duracion_minutos: durationMinutes
        });
        
        // Actualizar horas del proyecto
        const newHours = (project.horas_invertidas || 0) + durationMinutes / 60;
        return this.updateProject(projectId, {
            horas_invertidas: newHours,
            ultima_sesion: new Date().toISOString().split('T')[0]
        });
    }
    
    async completeProject(projectId) {
        return this.updateProject(projectId, {
            estado: CONFIG.PROJECT_STATES.COMPLETED,
            fecha_finalizacion: new Date().toISOString().split('T')[0]
        });
    }
    
    // ==================== ACTIVIDADES ====================
    
    async getActivities() {
        const { data, error } = await this.client
            .from('actividades')
            .select('*')
            .order('nombre');
        
        if (error) throw error;
        return data || [];
    }
    
    async markActivityLike(activityId, gusta) {
        const { data, error } = await this.client
            .from('actividades')
            .update({
                gusta,
                ultima_vez: new Date().toISOString().split('T')[0]
            })
            .eq('id', activityId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    async registerActivity(activityName) {
        const { data, error } = await this.client
            .from('historial_actividades')
            .insert({
                nombre_actividad: activityName,
                fecha: new Date().toISOString().split('T')[0]
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    // ==================== EXPORTAR DATOS ====================
    
    async exportAllData() {
        const [profile, preferences, projects, registry] = await Promise.all([
            this.client.from('perfil').select('*'),
            this.client.from('preferencias').select('*'),
            this.client.from('proyectos').select('*'),
            this.client.from('registro_diario').select('*')
        ]);
        
        return {
            exportDate: new Date().toISOString(),
            profile: profile.data,
            preferences: preferences.data,
            projects: projects.data,
            dailyRegistry: registry.data
        };
    }
}

// Instancia única
export const supabaseClient = new SupabaseClient();
