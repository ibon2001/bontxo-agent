# 🎯 Bontxo Agent - Life OS

Tu sistema personal de vida equilibrada, construido desde cero.

![Bontxo Agent](https://img.shields.io/badge/version-1.0.0-6366f1?style=for-the-badge)

## ✨ Características

- 📊 **Dashboard inteligente** - Briefing matutino personalizado
- 📝 **Registro diario** - Tracking de energía, ánimo, productividad
- 🌙 **Retrospectiva nocturna** - Reflexión y planificación
- 🚀 **Gestión de proyectos** - Por competencias, no por tiempo
- ✨ **Catálogo de actividades** - Descubrimiento de nuevos hobbies
- 📈 **Análisis e insights** - Patrones y recomendaciones
- 💾 **Datos privados** - Todo en tu propia base de datos

## 🚀 Empezando

### Requisitos

1. Cuenta en [Supabase](https://supabase.com) (gratis)
2. Cuenta en [GitHub](https://github.com) (gratis)

### Paso 1: Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Crea un nuevo proyecto llamado `bontxo-agent`
3. Ve a **SQL Editor** en el menú lateral
4. Copia y pega el contenido de `database/schema.sql`
5. Click en **Run** para ejecutar

### Paso 2: Obtener credenciales

1. En Supabase, ve a **Settings** → **API**
2. Copia la **Project URL**
3. Copia la **anon/public** key

### Paso 3: Desplegar la app

#### Opción A: GitHub Pages (recomendado)

1. Sube este proyecto a GitHub:
   ```bash
   cd bontxo-agent
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TU_USUARIO/bontxo-agent.git
   git push -u origin main
   ```

2. Ve a Settings → Pages del repositorio
3. En "Source", selecciona **main** y **/ (root)**
4. Click en Save
5. Espera ~2 minutos
6. Tu app estará en: `https://TU_USUARIO.github.io/bontxo-agent`

#### Opción B: Abrir localmente

Simplemente abre `index.html` en tu navegador.

### Paso 4: Conectar

1. La primera vez que abras la app, te pedirá las credenciales
2. Pega la URL y la key de Supabase
3. ¡Listo!

## 📁 Estructura del proyecto

```
bontxo-agent/
├── index.html          # Aplicación completa (HTML + CSS + JS)
├── database/
│   └── schema.sql      # Estructura de la base de datos
└── README.md           # Este archivo
```

## 🗄️ Base de datos

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `perfil` | Datos personales del usuario |
| `preferencias` | Gustos, motivaciones, forma de aprender |
| `registro_diario` | Entradas diarias con métricas |
| `proyectos` | Gestión de proyectos por competencias |
| `sesiones_proyecto` | Historial de sesiones de trabajo |
| `actividades` | Catálogo de actividades predefinidas |
| `historial_actividades` | Registro de actividades realizadas |
| `objetivos` | Metas a corto y largo plazo |
| `insights` | Análisis y descubrimientos |

## 🎓 Filosofía

**Life OS** está basado en estos principios:

1. **El descanso es productivo** - No lo subestimes
2. **Las competencias importan más que el tiempo** - Dominar habilidades > horas invertidas
3. **Los datos guían, no controlan** - Usa los insights, no te obsesiones
4. **Evoluciona constantemente** - El sistema se adapta a ti

## 🔧 Personalización

### Cambiar colors

Edita las variables CSS en `:root`:

```css
:root {
    --accent: #6366f1;        /* Color principal */
    --success: #10b981;       /* Verde - éxito */
    --warning: #f59e0b;       /* Amarillo - precaución */
    --danger: #ef4444;        /* Rojo - alerta */
}
```

### Añadir actividades

Inserta en la tabla `actividades`:

```sql
INSERT INTO actividades (nombre, categoria, descripcion, energia_necesaria, tiempo_estimado_minutos, donde, presupuesto_necesario)
VALUES ('Tu actividad', 'categoria', 'Descripción', 3, 60, 'interior', 'bajo');
```

## 📱 Responsive

La app funciona en:
- Desktop 💻
- Tablet 📱
- Móvil 📱

## 🔒 Privacidad

- Todos tus datos están en **tu** base de datos de Supabase
- Nadie más puede acceder a ellos
- Puedes exportar todos tus datos en cualquier momento (Settings → Exportar)

## 🤝 Contribuir

¿Quieres mejorar Bontxo Agent? ¡Genial!

1. Haz un fork del repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcion`)
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva función'`)
4. Haz push a la rama (`git push origin feature/nueva-funcion`)
5. Abre un Pull Request

## 📄 Licencia

MIT - Haz con esto lo que quieras.

---

Hecho con ❤️ para ayudarte a vivir mejor.
