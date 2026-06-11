-- =====================================================
-- BASE DE DATOS: MOVI
-- Sistema de Gestión y Reserva de Clases de Baile
-- Motor: MySQL 8.0+
-- =====================================================

CREATE DATABASE IF NOT EXISTS movi_db;
USE movi_db;

-- =====================================================
-- TABLA: roles
-- =====================================================

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- =====================================================
-- TABLA: usuarios
-- Admin: usa email para login, no requiere DNI/teléfono
-- Instructor: usa email para login, no requiere DNI
-- Cliente: usa DNI o teléfono para login, no requiere email
-- =====================================================

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,

    rol_id INT NOT NULL,

    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,

    email VARCHAR(150) NULL UNIQUE,
    dni VARCHAR(15) NULL UNIQUE,
    telefono VARCHAR(20) NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    foto_url VARCHAR(255),

    estado BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (rol_id)
        REFERENCES roles(id)
);

-- =====================================================
-- TABLA: instructores
-- Solo usuarios con rol INSTRUCTOR
-- =====================================================

CREATE TABLE instructores (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL UNIQUE,

    especialidad VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_instructor_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- =====================================================
-- TABLA: categorias_baile
-- =====================================================

CREATE TABLE categorias_baile (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- =====================================================
-- TABLA: horarios_semanales
-- Programación semanal fija de cada instructor.
-- La grilla de asientos se calcula desde
-- capacidad_maxima (sin tabla salones).
-- =====================================================

CREATE TABLE horarios_semanales (
    id INT AUTO_INCREMENT PRIMARY KEY,

    categoria_id INT NOT NULL,
    instructor_id INT NOT NULL,

    dia_semana ENUM(
        'LUNES',
        'MARTES',
        'MIERCOLES',
        'JUEVES',
        'VIERNES',
        'SABADO',
        'DOMINGO'
    ) NOT NULL,

    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,

    capacidad_maxima INT NOT NULL,
    minimo_participantes INT NOT NULL DEFAULT 7,

    activo BOOLEAN DEFAULT TRUE,

    created_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_horario_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias_baile(id),

    CONSTRAINT fk_horario_instructor
        FOREIGN KEY (instructor_id)
        REFERENCES instructores(id),

    CONSTRAINT fk_horario_admin
        FOREIGN KEY (created_by)
        REFERENCES usuarios(id),

    CONSTRAINT chk_horario_hora
        CHECK (hora_fin > hora_inicio),

    CONSTRAINT chk_horario_capacidad_maxima
        CHECK (capacidad_maxima > 0),

    CONSTRAINT chk_horario_minimo_participantes
        CHECK (minimo_participantes > 0),

    CONSTRAINT chk_horario_minimo_vs_capacidad
        CHECK (minimo_participantes <= capacidad_maxima)
);

-- =====================================================
-- TABLA: clases
-- Ocurrencias reales generadas desde horarios_semanales.
-- hora_inicio, hora_fin, capacidad_maxima y
-- minimo_participantes se copian del horario al
-- generarse, permitiendo variaciones puntuales.
-- =====================================================

CREATE TABLE clases (
    id INT AUTO_INCREMENT PRIMARY KEY,

    horario_semanal_id INT NOT NULL,

    fecha DATE NOT NULL,

    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,

    capacidad_maxima INT NOT NULL,
    minimo_participantes INT NOT NULL DEFAULT 7,

    tematica VARCHAR(100) DEFAULT 'LIBRE',

    estado ENUM(
        'PROGRAMADA',
        'EN_CURSO',
        'CANCELADA',
        'FINALIZADA'
    ) DEFAULT 'PROGRAMADA',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_clase_horario
        FOREIGN KEY (horario_semanal_id)
        REFERENCES horarios_semanales(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_clase_capacidad_maxima
        CHECK (capacidad_maxima > 0),

    CONSTRAINT chk_clase_minimo_participantes
        CHECK (minimo_participantes > 0),

    CONSTRAINT chk_clase_minimo_vs_capacidad
        CHECK (minimo_participantes <= capacidad_maxima),

    CONSTRAINT uq_clase_horario_fecha
        UNIQUE (horario_semanal_id, fecha)
);

-- =====================================================
-- TABLA: posiciones_clase
-- Asientos físicos numerados dentro de una clase.
-- La grilla se calcula desde capacidad_maxima.
-- El estado (disponible/ocupado) se deduce de la
-- existencia de una reserva activa vinculada.
-- =====================================================

CREATE TABLE posiciones_clase (
    id INT AUTO_INCREMENT PRIMARY KEY,

    clase_id INT NOT NULL,

    numero INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_posicion_clase
        FOREIGN KEY (clase_id)
        REFERENCES clases(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_clase_numero
        UNIQUE (clase_id, numero),

    CONSTRAINT uq_clase_id_posicion
        UNIQUE (clase_id, id)
);

-- =====================================================
-- TABLA: reservas
-- =====================================================

CREATE TABLE reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,
    clase_id INT NOT NULL,
    posicion_clase_id INT NOT NULL,

    codigo_pago VARCHAR(20) NOT NULL UNIQUE,

    estado ENUM(
        'PENDIENTE',
        'CONFIRMADA',
        'CANCELADA',
        'EXPIRADA'
    ) DEFAULT 'PENDIENTE',

    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiracion_reserva TIMESTAMP NULL,

    fecha_confirmacion TIMESTAMP NULL,
    fecha_cancelacion TIMESTAMP NULL,
    cancelado_por INT NULL,

    uso_credito BOOLEAN DEFAULT FALSE,

    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reserva_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id),

    CONSTRAINT fk_reserva_clase
        FOREIGN KEY (clase_id)
        REFERENCES clases(id),

    CONSTRAINT fk_reserva_posicion
        FOREIGN KEY (posicion_clase_id)
        REFERENCES posiciones_clase(id),

    CONSTRAINT fk_reserva_cancelado_por
        FOREIGN KEY (cancelado_por)
        REFERENCES usuarios(id),

    CONSTRAINT fk_reserva_posicion_pertenece_clase
        FOREIGN KEY (clase_id, posicion_clase_id)
        REFERENCES posiciones_clase(clase_id, id)
);

-- =====================================================
-- TABLA: pagos
-- Relación 1:1 con reservas.
-- =====================================================

CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,

    reserva_id INT NOT NULL UNIQUE,

    metodo_pago ENUM('yape', 'creditos') NOT NULL,
    monto DECIMAL(10,2) NOT NULL,

    estado ENUM(
        'PENDIENTE',
        'PAGADO',
        'FALLIDO'
    ) DEFAULT 'PENDIENTE',

    fecha_pago TIMESTAMP NULL,
    culqi_charge_id VARCHAR(255) NULL,

    CONSTRAINT fk_pago_reserva
        FOREIGN KEY (reserva_id)
        REFERENCES reservas(id)
        ON DELETE CASCADE
);

-- =====================================================
-- TABLA: creditos
-- Un crédito representa una clase gratuita.
-- clase_id opcional: registra qué clase cancelada
-- originó el crédito.
-- reserva_id opcional: registra en qué reserva se
-- consumió el crédito.
-- =====================================================

CREATE TABLE creditos (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,

    clase_id INT NULL,
    reserva_id INT NULL,

    usado BOOLEAN DEFAULT FALSE,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_uso TIMESTAMP NULL,

    CONSTRAINT fk_credito_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_credito_clase
        FOREIGN KEY (clase_id)
        REFERENCES clases(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_credito_reserva
        FOREIGN KEY (reserva_id)
        REFERENCES reservas(id)
        ON DELETE SET NULL
);

-- =====================================================
-- TABLA: notificaciones
-- =====================================================

CREATE TABLE notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,

    tipo ENUM(
        'INSCRIPCION_CONFIRMADA',
        'RECORDATORIO',
        'CLASE_CANCELADA',
        'CREDITO_GENERADO'
    ) NOT NULL,

    mensaje TEXT NOT NULL,

    leido BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notificacion_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX idx_clases_fecha ON clases (fecha);
CREATE INDEX idx_reservas_usuario ON reservas (usuario_id);
CREATE INDEX idx_reservas_clase ON reservas (clase_id);
CREATE INDEX idx_creditos_usuario ON creditos (usuario_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones (usuario_id);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

INSERT INTO roles (nombre)
VALUES
('ADMIN'),
('CLIENTE'),
('INSTRUCTOR');

INSERT INTO categorias_baile (nombre, descripcion)
VALUES
('Salsa',   'Ritmo y energía'),
('Bachata', 'Romántica y sensual'),
('Tango',   'Pasión y elegancia');
