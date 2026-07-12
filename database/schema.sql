-- ============================================
-- BONTXO-AGENT / LIFE OS - Database Schema
-- ============================================

-- ============================================
-- 1. PERFIL DEL USUARIO
-- ============================================
CREATE TABLE perfil (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT,
    edad INTEGER,
    profesion TEXT,
    estudios TEXT,
    ciudad TEXT,
    disponibilidad TEXT,
    horario TEXT,
    intereses TEXT[], -- Array de intereses
    aficiones TEXT[],
    presupuesto TEXT,
    personalidad TEXT,
    nivel_energia_habitual INTEGER DEFAULT 7,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PREFERENCIAS
-- ============================================
CREATE TABLE preferencias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    le_gusta TEXT[],
    no_le_gusta TEXT[],
    evita TEXT[],
    le_motiva TEXT[],
    le_hace_feliz TEXT[],
    le_aburre TEXT[],
    forma_aprender TEXT,
    forma_descansar TEXT,
    forma_motivarse TEXT,
    buen_dia TEXT,
    perder_tiempo TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. REGISTRO DIARIO
-- ============================================
CREATE TABLE registro_diario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha DATE UNIQUE NOT NULL,
    energia INTEGER CHECK (energia >= 1 AND energia <= 10),
    animo INTEGER CHECK (animo >= 1 AND animo <= 10),
    productividad INTEGER CHECK (productividad >= 1 AND productividad <= 10),
    diversion INTEGER CHECK (diversion >= 1 AND diversion <= 10),
    estres INTEGER CHECK (estres >= 1 AND estres <= 10),
    horas_dormidas DECIMAL(4,2),
    ejercicio_minutos INTEGER,
    lectura_minutos INTEGER,
    tiempo_pantalla_minutos INTEGER,
    actividades_realizadas TEXT[],
    proyectos_trabajados TEXT[],
    estado_animo_texto TEXT,
    salio_bien TEXT,
    salio_mal TEXT,
    cambiaria TEXT,
    aprendio TEXT,
    manana_quiere TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. PROYECTOS
-- ============================================
CREATE TABLE proyectos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    objetivo TEXT,
    competencias TEXT[], -- Array de competencias por dominar
    competencias_dominadas TEXT[] DEFAULT '{}',
    estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'pausado', 'completado', 'abandonado')),
    horas_invertidas DECIMAL(10,2) DEFAULT 0,
    nivel_estimado TEXT DEFAULT 'principiante' CHECK (nivel_estimado IN ('principiante', 'intermedio', 'avanzado')),
    fecha_inicio DATE,
    fecha_finalizacion DATE,
    ultima_sesion DATE,
    proximos_pasos TEXT,
    problemas_encontrados TEXT,
    creado_por TEXT DEFAULT 'usuario',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. HISTORIAL DE SESIONES DE PROYECTO
-- ============================================
CREATE TABLE sesiones_proyecto (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    duracion_minutos INTEGER,
    competencias_practicadas TEXT[],
    notas TEXT,
    nivel_satisfaccion INTEGER CHECK (nivel_satisfaccion >= 1 AND nivel_satisfaccion <= 10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. CATÁLOGO DE ACTIVIDADES
-- ============================================
CREATE TABLE actividades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    categoria TEXT,
    descripcion TEXT,
    energia_necesaria INTEGER CHECK (energia_necesaria >= 1 AND energia_necesaria <= 10),
    tiempo_estimado_minutos INTEGER,
    habilidades_necesarias TEXT[],
    donde TEXT, -- 'interior', 'exterior', 'ambos'
    presupuesto_necesario TEXT, -- 'gratis', 'bajo', 'medio', 'alto'
    veces_realizada INTEGER DEFAULT 0,
    ultima_vez DATE,
    gusta BOOLEAN DEFAULT NULL, -- NULL = no probada, TRUE = gusta, FALSE = no gusta
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. REGISTRO DE ACTIVIDADES REALIZADAS
-- ============================================
CREATE TABLE historial_actividades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actividad_id UUID REFERENCES actividades(id) ON DELETE SET NULL,
    nombre_actividad TEXT NOT NULL,
    fecha DATE NOT NULL,
    duracion_minutos INTEGER,
    nivel_disfrute INTEGER CHECK (nivel_disfrute >= 1 AND nivel_disfrute <= 10),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. OBJETIVOS
-- ============================================
CREATE TABLE objetivos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo TEXT CHECK (tipo IN ('anual', 'mensual', 'semanal', 'personal', 'profesional', 'salud')),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'abandonado')),
    fecha_limite DATE,
    progreso INTEGER DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================
-- 9. INSIGHTS / ANÁLISIS
-- ============================================
CREATE TABLE insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo TEXT, -- 'patron', 'recomendacion', 'descubrimiento'
    titulo TEXT NOT NULL,
    contenido TEXT,
    evidencia TEXT, -- Datos que lo respaldan
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en perfil
CREATE TRIGGER update_perfil_updated_at
    BEFORE UPDATE ON perfil
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en proyectos
CREATE TRIGGER update_proyectos_updated_at
    BEFORE UPDATE ON proyectos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en preferencias
CREATE TRIGGER update_preferencias_updated_at
    BEFORE UPDATE ON preferencias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DATOS INICIALES: ACTIVIDADES PREDEFINIDAS
-- ============================================
INSERT INTO actividades (nombre, categoria, descripcion, energia_necesaria, tiempo_estimado_minutos, donde, presupuesto_necesario) VALUES
-- Interior静
('Lectura', 'Aprendizaje', 'Leer libros o artículos de interés', 2, 30, 'interior', 'gratis'),
('Programación', 'Aprendizaje', 'Aprender o practicar código', 4, 60, 'interior', 'gratis'),
('Meditación', 'Bienestar', 'Práctica de mindfulness y respiración', 1, 15, 'interior', 'gratis'),
('Yoga', 'Salud', 'Ejercicio suave con estiramientos', 3, 30, 'interior', 'bajo'),
('Cocinar', 'Creatividad', 'Preparar recetas nuevas o favoritas', 3, 45, 'interior', 'medio'),
('Pintura', 'Creatividad', 'Crear arte visual', 3, 60, 'interior', 'medio'),
('Música', 'Creatividad', 'Tocar instrumento o escuchar activamente', 2, 30, 'interior', 'medio'),
('Escritura', 'Creatividad', 'Escribir, blog o diario', 3, 30, 'interior', 'gratis'),
('Juegos de mesa', 'Social', 'Jugar con amigos o familia', 3, 90, 'interior', 'bajo'),
('Películas/Series', 'Ocio', 'Ver contenido audiovisual', 1, 60, 'interior', 'medio'),
('Videojuegos', 'Ocio', 'Gaming recreativo', 2, 60, 'interior', 'medio'),

-- Exterior
('Senderismo', 'Naturaleza', 'Caminar por trails y naturaleza', 4, 120, 'exterior', 'gratis'),
('Correr', 'Salud', 'Running o jogging', 5, 30, 'exterior', 'gratis'),
('Ciclismo', 'Salud', 'Montar en bicicleta', 5, 60, 'exterior', 'medio'),
('Fotografía', 'Creatividad', 'Hacer fotos, explorar la cámara', 3, 60, 'exterior', 'bajo'),
('Paseo', 'Bienestar', 'Caminar sin prisa, explorar', 2, 30, 'exterior', 'gratis'),
('Natación', 'Salud', 'Ir a piscina o playa', 5, 45, 'ambos', 'bajo'),
('Escalada', 'Deporte', 'Escalar en rocódromo o naturaleza', 6, 90, 'ambos', 'medio'),

-- Social
('Café con amigos', 'Social', 'Quedar para tomar algo', 2, 60, 'ambos', 'medio'),
('Volunteerismo', 'Social', 'Actividades solidarias', 4, 120, 'ambos', 'gratis'),
('Idiomas', 'Aprendizaje', 'Practicar idiomas (intercambios, apps)', 3, 30, 'ambos', 'bajo'),
('Talleres', 'Aprendizaje', 'Cursos y talleres presenciales', 4, 120, 'ambos', 'medio'),
('Ajedrez', 'Estratégico', 'Jugar al ajedrez', 3, 45, 'ambos', 'gratis'),

-- Aprendizaje profundo
('Documentación técnica', 'Aprendizaje', 'Leer documentación, papers', 5, 60, 'interior', 'gratis'),
('Cursos online', 'Aprendizaje', 'Tomar cursos en plataformas', 4, 60, 'interior', 'medio'),
('Proyectos DIY', 'Creatividad', 'Hacer cosas con las manos', 4, 90, 'interior', 'medio');

-- ============================================
-- ROW LEVEL SECURITY (RLS) - PRIVACIDAD
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE objetivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Para simplificar, creamos una política que permite acceso total
-- En producción, esto se conectaría con autenticación
CREATE POLICY "Allow all access" ON perfil FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON preferencias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON registro_diario FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON proyectos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON sesiones_proyecto FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON actividades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON historial_actividades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON objetivos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON insights FOR ALL USING (true) WITH CHECK (true);
