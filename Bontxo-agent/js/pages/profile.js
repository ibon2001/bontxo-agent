/**
 * Página de Perfil
 */

import { state } from '../state.js';
import { supabaseClient } from '../supabase.js';
import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';

class ProfilePage {
    constructor() {
        this.initialized = false;
    }
    
    /**
     * Renderizar página
     */
    render() {
        this.updateProfileUI();
        this.updatePreferencesUI();
        this.setupEditButtons();
        this.initialized = true;
    }
    
    /**
     * Actualizar UI del perfil
     */
    updateProfileUI() {
        const profile = state.get('profile');
        if (!profile) return;
        
        this.setField('profile-nombre', profile.nombre || '-');
        this.setField('profile-edad', profile.edad || '-');
        this.setField('profile-profesion', profile.profesion || '-');
        this.setField('profile-ciudad', profile.ciudad || '-');
        this.setField('profile-disponibilidad', this.formatDisponibilidad(profile.disponibilidad));
        this.setField('profile-energia', profile.nivel_energia_habitual || '-');
        this.setField('profile-intereses', (profile.intereses || []).join(', ') || '-');
    }
    
    /**
     * Actualizar UI de preferencias
     */
    updatePreferencesUI() {
        const prefs = state.get('preferences');
        if (!prefs) return;
        
        this.setField('pref-hace-feliz', (prefs.le_hace_feliz || []).join(', ') || 'No definido');
        this.setField('pref-motiva', (prefs.le_motiva || []).join(', ') || 'No definido');
        this.setField('pref-aburre', (prefs.le_aburre || []).join(', ') || 'No definido');
        this.setField('pref-aprender', prefs.forma_aprender || '-');
        this.setField('pref-descansar', prefs.forma_descansar || '-');
    }
    
    /**
     * Configurar botones de editar
     */
    setupEditButtons() {
        const editProfileBtn = document.querySelector('[data-action="edit-profile"]');
        const editPrefsBtn = document.querySelector('[data-action="edit-preferences"]');
        
        if (editProfileBtn) {
            editProfileBtn.onclick = () => this.openEditProfile();
        }
        
        if (editPrefsBtn) {
            editPrefsBtn.onclick = () => this.openEditPreferences();
        }
    }
    
    /**
     * Establecer valor de campo
     */
    setField(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
    
    /**
     * Abrir modal de editar perfil
     */
    openEditProfile() {
        const profile = state.get('profile');
        if (!profile) return;
        
        document.getElementById('edit-nombre').value = profile.nombre || '';
        document.getElementById('edit-edad').value = profile.edad || '';
        document.getElementById('edit-profesion').value = profile.profesion || '';
        document.getElementById('edit-ciudad').value = profile.ciudad || '';
        document.getElementById('edit-intereses').value = (profile.intereses || []).join(', ');
        
        modal.open('edit-profile-modal');
    }
    
    /**
     * Abrir modal de editar preferencias
     */
    openEditPreferences() {
        const prefs = state.get('preferences');
        if (!prefs) return;
        
        document.getElementById('edit-hace-feliz').value = (prefs.le_hace_felize || []).join(', ');
        document.getElementById('edit-motiva').value = (prefs.le_motiva || []).join(', ');
        document.getElementById('edit-aburre').value = (prefs.le_aburre || []).join(', ');
        document.getElementById('edit-aprender').value = prefs.forma_aprender || '';
        document.getElementById('edit-descansar').value = prefs.forma_descansar || '';
        document.getElementById('edit-buen-dia').value = prefs.buen_dia || '';
        
        modal.open('edit-preferences-modal');
    }
    
    /**
     * Guardar perfil
     */
    async saveProfile() {
        const profile = state.get('profile');
        if (!profile) return;
        
        const updates = {
            nombre: document.getElementById('edit-nombre')?.value.trim() || null,
            edad: parseInt(document.getElementById('edit-edad')?.value) || null,
            profesion: document.getElementById('edit-profesion')?.value.trim() || null,
            ciudad: document.getElementById('edit-ciudad')?.value.trim() || null,
            intereses: this.parseCommaList('edit-intereses')
        };
        
        try {
            const updated = await supabaseClient.updateProfile(profile.id, updates);
            state.set('profile', updated);
            modal.close('edit-profile-modal');
            this.updateProfileUI();
            toast.success('Perfil actualizado');
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar');
        }
    }
    
    /**
     * Guardar preferencias
     */
    async savePreferences() {
        const prefs = state.get('preferences');
        if (!prefs) return;
        
        const updates = {
            le_hace_feliz: this.parseCommaList('edit-hace-feliz'),
            le_motiva: this.parseCommaList('edit-motiva'),
            le_aburre: this.parseCommaList('edit-aburre'),
            forma_aprender: document.getElementById('edit-aprender')?.value.trim() || null,
            forma_descansar: document.getElementById('edit-descansar')?.value.trim() || null,
            buen_dia: document.getElementById('edit-buen-dia')?.value.trim() || null
        };
        
        try {
            const updated = await supabaseClient.updatePreferences(prefs.id, updates);
            state.set('preferences', updated);
            modal.close('edit-preferences-modal');
            this.updatePreferencesUI();
            toast.success('Preferencias actualizadas');
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar');
        }
    }
    
    /**
     * Parsear lista separada por comas
     */
    parseCommaList(inputId) {
        const el = document.getElementById(inputId);
        if (!el) return [];
        return el.value.split(',').map(s => s.trim()).filter(s => s);
    }
    
    /**
     * Formatear disponibilidad
     */
    formatDisponibilidad(d) {
        if (!d) return '-';
        const map = {
            'pocas': '2-3 horas/día',
            'moderada': '4-5 horas/día',
            'muchas': '6+ horas/día'
        };
        return map[d] || d;
    }
}

// Instancia singleton
export const profilePage = new ProfilePage();

// Bindings globales
window.saveProfile = () => profilePage.saveProfile();
window.savePreferences = () => profilePage.savePreferences();
