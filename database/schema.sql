-- ============================================
-- BONTXO-AGENT - LIFE OS
-- Database Schema
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
    intereses TEXT[],
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
    animo INTEGER CHECK (animo >= 1 AND animo <= 5),
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
    competencias TEXT[],
    competencias_dominadas TEXT[] DEFAULT '{}',
    estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'pausado', 'completado', 'abandonado')),
    horas_invertidas DECIMAL(10,2) DEFAULT 0,
    nivel_estimado TEXT DEFAULT 'principiante' CHECK (nivel_estimado IN ('principiante', 'intermedio', 'avanzado')),
    fecha_inicio DATE,
    fecha_finalizacion DATE,
    ultima_sesion DATE,
    proximos_pasos TEXT,
    problemas_encontrados TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. SESIONES DE PROYECTO
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
-- 6. ACTIVIDADES
-- ============================================
CREATE TABLE actividades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    categoria TEXT,
    descripcion TEXT,
    energia_necesaria INTEGER CHECK (energia_necesaria >= 1 AND energia_necesaria <= 10),
    tiempo_estimado_minutos INTEGER,
    habilidades_necesarias TEXT[],
    donde TEXT,
    presupuesto_necesario TEXT,
    veces_realizada INTEGER DEFAULT 0,
    ultima_vez DATE,
    gusta BOOLEAN DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. HISTORIAL DE ACTIVIDADES
-- ============================================
CREATE TABLE historial_actividades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actividad_id UUID REFERENCES actividades(id) ON DELETE SET NULL,
    nombre_actividad TEXT NOT NULL,
    fecha DATE NOT NULL,
    duracion_minutos INTEGER,
    nivel_disfrute INTEGER CHECK (nivel_disfrute >= 1 AND nivel_disfrute <= 10),
    notas TEXT,
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
-- 9. INSIGHTS
-- ============================================
CREATE TABLE insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo TEXT,
    titulo TEXT NOT NULL,
    contenido TEXT,
    evidencia TEXT,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_perfil_updated_at BEFORE UPDATE ON perfil
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proyectos_updated_at BEFORE UPDATE ON proyectos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferencias_updated_at BEFORE UPDATE ON preferencias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DATOS INICIALES: ACTIVIDADES
-- ============================================
INSERT INTO actividades (nombre, categoria, descripcion, energia_necesaria, tiempo_estimado_minutos, donde, presupuesto_necesario) VALUES
('Lectura', 'aprendizaje', 'Leer libros o artículos de interés', 2, 30, 'interior', 'gratis'),
('Programación', 'aprendizaje', 'Aprender o practicar código', 4, 60, 'interior', 'gratis'),
('Meditación', 'bienestar', 'Práctica de mindfulness y respiración', 1, 15, 'interior', 'gratis'),
('Yoga', 'salud', 'Ejercicio suave con estiramientos', 3, 30, 'interior', 'bajo'),
('Cocinar', 'creatividad', 'Preparar recetas nuevas o favoritas', 3, 45, 'interior', 'medio'),
('Pintura', 'creatividad', 'Crear arte visual', 3, 60, 'interior', 'medio'),
('Música', 'creatividad', 'Tocar instrumento o escuchar activamente', 2, 30, 'interior', 'medio'),
('Escritura', 'creatividad', 'Escribir, blog o diario', 3, 30, 'interior', 'gratis'),
('Juegos de mesa', 'social', 'Jugar con amigos o familia', 3, 90, 'interior', 'bajo'),
('Películas/Series', 'ocio', 'Ver contenido audiovisual', 1, 60, 'interior', 'medio'),
('Videojuegos', 'ocio', 'Gaming recreativo', 2, 60, 'interior', 'medio'),
('Senderismo', 'naturaleza', 'Caminar por trails y naturaleza', 4, 120, 'exterior', 'gratis'),
('Correr', 'salud', 'Running o jogging', 5, 30, 'exterior', 'gratis'),
('Ciclismo', 'salud', 'Montar en bicicleta', 5, 60, 'exterior', 'medio'),
('Fotografía', 'creatividad', 'Hacer fotos, explorar la cámara', 3, 60, 'exterior', 'bajo'),
('Paseo', 'bienestar', 'Caminar sin prisa, explorar', 2, 30, 'exterior', 'gratis'),
('Natación', 'salud', 'Ir a piscina o playa', 5, 45, 'ambos', 'bajo'),
('Escalada', 'salud', 'Escalar en rocódromo o naturaleza', 6, 90, 'ambos', 'medio'),
('Café con amigos', 'social', 'Quedar para tomar algo', 2, 60, 'ambos', 'medio'),
('Voluntariado', 'social', 'Actividades solidarias', 4, 120, 'ambos', 'gratis'),
('Idiomas', 'aprendizaje', 'Practicar idiomas (intercambios, apps)', 3, 30, 'ambos', 'bajo'),
('Talleres', 'aprendizaje', 'Cursos y talleres presenciales', 4, 120, 'ambos', 'medio'),
('Ajedrez', 'aprendizaje', 'Jugar al ajedrez', 3, 45, 'ambos', 'gratis'),
('Documentación técnica', 'aprendizaje', 'Leer documentación, papers', 5, 60, 'interior', 'gratis'),
('Cursos online', 'aprendizaje', 'Tomar cursos en plataformas', 4, 60, 'interior', 'medio'),
('Proyectos DIY', 'creatividad', 'Hacer cosas con las manos', 4, 90, 'interior', 'medio');

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE objetivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (para desarrollo)
CREATE POLICY "Allow all" ON perfil FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON preferencias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON registro_diario FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON proyectos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON sesiones_proyecto FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON actividades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON historial_actividades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON objetivos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON insights FOR ALL USING (true) WITH CHECK (true);
