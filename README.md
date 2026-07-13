# 🎯 Bontxo Agent - Life OS

> Tu sistema personal de vida equilibrada

![Version](https://img.shields.io/badge/version-2.0.0-6366f1?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-Enabled-3ecf8e?style=for-the-badge)

---

## ✨ Características

- 📊 **Dashboard inteligente** - Briefing matutino personalizado según tu energía
- 📝 **Registro diario** - Tracking completo de energía, ánimo, productividad
- 🌙 **Retrospectiva nocturna** - Reflexión y planificación
- 🚀 **Gestión de proyectos** - Por competencias, no por tiempo
- ✨ **Catálogo de actividades** - Descubrimiento de nuevos hobbies
- 📈 **Análisis e insights** - Patrones y recomendaciones automáticas
- 📅 **Historial completo** - Tu línea de tiempo personal
- 💾 **Datos privados** - Todo en tu propia base de datos

---

## 🏗️ Arquitectura

```
bontxo-agent/
├── index.html              # Punto de entrada
├── css/
│   ├── base.css           # Reset y variables
│   ├── layout.css         # Layout principal
│   ├── components.css     # Componentes reutilizables
│   └── pages.css          # Estilos específicos
├── js/
│   ├── app.js             # Punto de entrada y bootstrap
│   ├── config.js          # Configuración global
│   ├── state.js           # Estado reactivo
│   ├── router.js          # Enrutador simple
│   ├── supabase.js        # Cliente de base de datos
│   ├── components/
│   │   ├── toast.js       # Notificaciones
│   │   ├── modal.js       # Ventanas modales
│   │   ├── navigation.js  # Navegación
│   │   └── loading.js     # Pantalla de carga
│   ├── pages/
│   │   ├── dashboard.js   # Vista principal
│   │   ├── daily.js       # Registro diario
│   │   ├── projects.js    # Gestión de proyectos
│   │   ├── activities.js  # Catálogo de actividades
│   │   ├── insights.js    # Análisis
│   │   ├── history.js     # Historial
│   │   ├── profile.js     # Perfil de usuario
│   │   └── settings.js    # Configuración
│   └── services/
│       └── api.service.js # Servicios de API
├── database/
│   └── schema.sql         # Estructura de base de datos
└── README.md
```

### Principios de diseño

- **Modularidad**: Cada archivo tiene una responsabilidad clara
- **Estado reactivo**: El estado centralizado permite actualizaciones eficientes
- **Componentes reutilizables**: UI consistente en toda la app
- **Separatión de Concerns**: Lógica, vista y datos separados

---

## 🚀 Empezando

### Prerrequisitos

- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [GitHub](https://github.com) (gratis)

### 1. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Crea un nuevo proyecto
3. Ve a **SQL Editor** y ejecuta el contenido de `database/schema.sql`

### 2. Desplegar la aplicación

#### Opción A: GitHub Pages (recomendado)

1. Sube este proyecto a GitHub
2. Ve a Settings → Pages
3. Selecciona `main` como branch y `/ (root)` como folder
4. Tu app estará en: `https://TU_USUARIO.github.io/bontxo-agent`

#### Opción B: Netlify

1. Ve a [netlify.com](https://netlify.com)
2. Arrastra la carpeta del proyecto
3. Obtén una URL gratuita

### 3. Conectar

1. Abre la app
2. Introduce tu URL y anon key de Supabase
3. ¡Listo!

---

## 📖 Uso

### Dashboard

La pantalla principal muestra:
- Saludo personalizado según la hora del día
- Estado de energía actual
- Proyectos activos
- Sugerencia de actividad del día

### Registro Diario

Registra cada día:
- Estado de ánimo (1-5)
- Energía, productividad, diversión, estrés (1-10)
- Horas dormidas, ejercicio, lectura
- Reflexiones y aprendizajes

### Proyectos

Crea proyectos y define competencias a dominar:
- Cada competencia se marca como aprendida
- El progreso se calcula automáticamente
- Registra sesiones de trabajo

### Insights

Después de unos días de uso, la app genera:
- Análisis de patrones de energía
- Recomendaciones personalizadas
- Alertas de sobreesfuerzo o falta de diversión

---

## 🔧 Desarrollo

### Estructura de archivos JS

Cada módulo sigue un patrón consistente:

```javascript
// Exportar instancia singleton
export const myModule = new MyModule();

// Funciones expuestas globalmente
window.myFunction = () => myModule.doSomething();
```

### Añadir una nueva página

1. Crear `js/pages/newpage.js`
2. Definir clase con método `render()`
3. Importar en `js/app.js`
4. Añadir template en `index.html`
5. Añadir estilos en `css/pages.css`

### Añadir una nueva tabla

1. Añadir al SQL schema
2. Crear método en `js/supabase.js`
3. Añadir al estado si es necesario

---

## 🎓 Filosofía

> **El descanso es productivo.** No lo subestimes.

Life OS se basa en:

1. **Equilibrio**: No optimices solo para productividad
2. **Competencias > Tiempo**: Dominar habilidades importa más que horas invertidas
3. **Datos guían, no controlan**: Los insights informan, tú decides
4. **Evolución constante**: El sistema se adapta a ti

---

## 🔒 Privacidad

- Todos los datos están en **tu** base de datos de Supabase
- Nadie más puede acceder a ellos
- Puedes exportar tus datos en cualquier momento
- El código es público, los datos son privados

---

## 📱 Responsive

La app funciona perfectamente en:
- 💻 Desktop
- 📱 Tablet
- 📱 Móvil

---

## 🤝 Contribuir

1. Haz fork del repositorio
2. Crea una rama para tu feature
3. Haz commit con mensajes claros
4. Haz push y abre un Pull Request

---

## 📄 Licencia

MIT - Usa esto como quieras.

---

Hecho con ❤️ para ayudarte a vivir mejor.
