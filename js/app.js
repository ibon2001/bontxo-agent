/**
 * Bontxo Agent - Life OS
 * Punto de entrada principal
 */

import { CONFIG, isSupabaseConfigured, saveSupabaseCredentials } from './config.js';
import { state } from './state.js';
import { supabaseClient } from './supabase.js';
import { router } from './router.js';
import { toast } from './components/toast.js';
import { modal } from './components/modal.js';
import { loading } from './components/loading.js';
import { navigation } from './components/navigation.js';
import { dashboardPage } from './pages/dashboard.js';
import { dailyPage } from './pages/daily.js';
import { projectsPage } from './pages/projects.js';
import { activitiesPage } from './pages/activities.js';
import { insightsPage } from './pages/insights.js';
import { historyPage } from './pages/history.js';
import { profilePage } from './pages/profile.js';
import { settingsPage } from './pages/settings.js';

// Página actual
let currentPage = null;

/**
 * Inicializar aplicación
 */
async function init() {
    console.log('🚀 Bontxo Agent initializing...');
    
    // Inicializar router
    router.init();
    
    // Setup navegación
    navigation.init();
    
    // Setup beforeEach del router
    router.beforeEach((page) => {
        handlePageChange(page);
        return true;
    });
    
    // Verificar si hay configuración de Supabase
    if (!isSupabaseConfigured()) {
        showSetupInstructions();
        return;
    }
    
    // Intentar conectar
    await connectAndLoad();
}

/**
 * Conectar y cargar datos
 */
async function connectAndLoad() {
    loading.show('Conectando...');
    
    try {
        // Conectar a Supabase
        await supabaseClient.connect();
        
        // Verificar si hay perfil
        const hasProfile = await supabaseClient.hasProfile();
        
        if (hasProfile) {
            await loadAppData();
            showMainApp();
        } else {
            showSetupWizard();
        }
    } catch (error) {
        console.error('Error inicializando:', error);
        loading.showError('No se pudo conectar a la base de datos. Revisa la configuración.', () => {
            connectAndLoad();
        });
    }
}

/**
 * Cargar datos de la aplicación
 */
async function loadAppData() {
    loading.setMessage('Cargando datos...');
    
    try {
        const [profile, preferences, projects, activities, todayEntry] = await Promise.all([
            supabaseClient.getProfile(),
            supabaseClient.getPreferences(),
            supabaseClient.getProjects(),
            supabaseClient.getActivities(),
            supabaseClient.getTodayEntry()
        ]);
        
        state.setMultiple({
            profile,
            preferences,
            projects: projects || [],
            activities: activities || [],
            todayEntry
        });
        
        // Exponer dashboard para uso global
        window.dashboardPage = dashboardPage;
        
    } catch (error) {
        console.error('Error cargando datos:', error);
        throw error;
    }
}

/**
 * Manejar cambio de página
 */
async function handlePageChange(page) {
    // Renderizar página correspondiente
    switch (page) {
        case CONFIG.PAGES.DASHBOARD:
            currentPage = dashboardPage;
            if (!dashboardPage.initialized) dashboardPage.render();
            else dashboardPage.refresh();
            break;
            
        case CONFIG.PAGES.DAILY:
            currentPage = dailyPage;
            if (!dailyPage.initialized) dailyPage.render();
            break;
            
        case CONFIG.PAGES.PROJECTS:
            currentPage = projectsPage;
            if (!projectsPage.initialized) projectsPage.render();
            else projectsPage.render(); // Refresh
            break;
            
        case CONFIG.PAGES.ACTIVITIES:
            currentPage = activitiesPage;
            if (!activitiesPage.initialized) activitiesPage.render();
            break;
            
        case CONFIG.PAGES.INSIGHTS:
            currentPage = insightsPage;
            insightsPage.render();
            break;
            
        case CONFIG.PAGES.HISTORY:
            currentPage = historyPage;
            historyPage.render();
            break;
            
        case CONFIG.PAGES.PROFILE:
            currentPage = profilePage;
            if (!profilePage.initialized) profilePage.render();
            break;
            
        case CONFIG.PAGES.SETTINGS:
            currentPage = settingsPage;
            if (!settingsPage.initialized) settingsPage.render();
            break;
    }
}

/**
 * Mostrar instrucciones de configuración
 */
function showSetupInstructions() {
    loading.hide();
    
    const container = document.getElementById('setup-instructions');
    if (container) {
        container.style.display = 'flex';
    }
}

/**
 * Mostrar wizard de setup
 */
function showSetupWizard() {
    loading.hide();
    
    const wizard = document.getElementById('setup-wizard');
    if (wizard) {
        wizard.style.display = 'flex';
    }
}

/**
 * Mostrar aplicación principal
 */
function showMainApp() {
    loading.hide();
    
    const mainApp = document.getElementById('main-app');
    if (mainApp) {
        mainApp.style.display = 'flex';
    }
    
    // Renderizar dashboard inicial
    dashboardPage.render();
    
    toast.success('¡Bienvenido de vuelta!');
}

/**
 * Guardar configuración de Supabase
 */
function saveConfig() {
    const url = document.getElementById('config-url')?.value.trim();
    const key = document.getElementById('config-key')?.value.trim();
    
    if (!url || !key) {
        toast.warning('Completa ambos campos');
        return;
    }
    
    saveSupabaseCredentials(url, key);
    window.location.reload();
}

/**
 * Finalizar setup
 */
async function finishSetup() {
    const wizard = document.getElementById('setup-wizard');
    if (!wizard) return;
    
    // Recoger datos del wizard
    const setupData = {
        nombre: document.getElementById('setup-nombre')?.value.trim(),
        edad: parseInt(document.getElementById('setup-edad')?.value) || null,
        profesion: document.getElementById('setup-profesion')?.value.trim(),
        ciudad: document.getElementById('setup-ciudad')?.value.trim(),
        disponibilidad: document.getElementById('setup-disponibilidad')?.value,
        horario: document.getElementById('setup-horario')?.value.trim(),
        intereses: (document.getElementById('setup-intereses')?.value || '').split(',').map(s => s.trim()).filter(s => s),
        nivel_energia_habitual: parseInt(document.querySelector('#setup-energia .rating-btn.selected')?.textContent) || 7,
        buen_dia: document.getElementById('setup-buen-dia')?.value.trim()
    };
    
    loading.show('Creando perfil...');
    
    try {
        await supabaseClient.createProfile(setupData);
        await supabaseClient.createPreferences({
            le_hace_feliz: [],
            le_motiva: [],
            le_aburre: [],
            forma_aprender: '',
            forma_descansar: '',
            buen_dia: setupData.buen_dia,
            perder_tiempo: ''
        });
        
        // Recargar
        wizard.style.display = 'none';
        await loadAppData();
        showMainApp();
        
    } catch (error) {
        console.error('Error en setup:', error);
        loading.hide();
        toast.error('Error al crear el perfil');
    }
}

// Setup wizard navigation
let setupStep = 1;

function nextSetupStep() {
    if (setupStep < 4) {
        saveSetupData(setupStep);
        setupStep++;
        updateSetupUI();
    } else {
        saveSetupData(setupStep);
        finishSetup();
    }
}

function prevSetupStep() {
    if (setupStep > 1) {
        setupStep--;
        updateSetupUI();
    }
}

function saveSetupData(step) {
    // Los datos se guardan directamente desde los inputs
    // Esta función se llama antes de cambiar de paso
}

function updateSetupUI() {
    // Ocultar todos los pasos
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`setup-step-${i}`);
        if (step) step.style.display = 'none';
    }
    
    // Mostrar paso actual
    const currentStep = document.getElementById(`setup-step-${setupStep}`);
    if (currentStep) currentStep.style.display = 'block';
    
    // Actualizar indicadores
    document.querySelectorAll('.setup-step-indicator').forEach((el, index) => {
        el.classList.remove('active', 'completed');
        if (index + 1 < setupStep) el.classList.add('completed');
        if (index + 1 === setupStep) el.classList.add('active');
    });
    
    // Botón anterior
    const prevBtn = document.getElementById('setup-prev');
    if (prevBtn) prevBtn.style.visibility = setupStep > 1 ? 'visible' : 'hidden';
    
    // Botón siguiente
    const nextBtn = document.getElementById('setup-next');
    if (nextBtn) {
        nextBtn.textContent = setupStep === 4 ? '¡Empezar! 🚀' : 'Siguiente →';
    }
}

// Exponer funciones globalmente
window.saveConfig = saveConfig;
window.nextSetupStep = nextSetupStep;
window.prevSetupStep = prevSetupStep;

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);

// Exponer dashboard globalmente para funciones de los botones
window.dashboardPage = dashboardPage;
