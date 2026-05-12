-- =====================================================
-- BASE DE DATOS: MOVI
-- Sistema de Gestión y Reserva de Clases de Baile
-- Motor: MySQL
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
-- =====================================================

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    rol_id INT NOT NULL,
    
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    
    telefono VARCHAR(20) NOT NULL UNIQUE,
    dni VARCHAR(15) NOT NULL UNIQUE,
    
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
    descripcion TEXT,
    experiencia_anios INT,

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
-- Representa la programación semanal fija
-- de cada instructor
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

    minimo_participantes INT NOT NULL,

    activo BOOLEAN DEFAULT TRUE,

    created_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_horario_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias_baile(id),

    CONSTRAINT fk_horario_instructor
        FOREIGN KEY (instructor_id)
        REFERENCES instructores(id),

    CONSTRAINT fk_horario_admin
        FOREIGN KEY (created_by)
        REFERENCES usuarios(id)
);

-- =====================================================
-- TABLA: clases
-- Representa ocurrencias reales generadas
-- automáticamente desde horarios_semanales
-- =====================================================

CREATE TABLE clases (
    id INT AUTO_INCREMENT PRIMARY KEY,

    horario_semanal_id INT NOT NULL,

    fecha DATE NOT NULL,

    estado ENUM(
        'PROGRAMADA',
        'EN_CURSO',
        'CANCELADA',
        'FINALIZADA'
    ) DEFAULT 'PROGRAMADA',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_clase_horario
        FOREIGN KEY (horario_semanal_id)
        REFERENCES horarios_semanales(id)
        ON DELETE CASCADE
);

-- =====================================================
-- TABLA: posiciones_clase
-- Representa espacios físicos numerados
-- dentro de una clase
-- =====================================================

CREATE TABLE posiciones_clase (
    id INT AUTO_INCREMENT PRIMARY KEY,

    clase_id INT NOT NULL,

    numero INT NOT NULL,

    fila INT NULL,
    columna INT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_posicion_clase
        FOREIGN KEY (clase_id)
        REFERENCES clases(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_clase_numero
        UNIQUE (clase_id, numero)
);

-- =====================================================
-- TABLA: reservas
-- =====================================================

CREATE TABLE reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    usuario_id INT NOT NULL,
    clase_id INT NOT NULL,
    posicion_clase_id INT NOT NULL,
    
    estado ENUM(
        'PENDIENTE',
        'CONFIRMADA',
        'CANCELADA',
        'EXPIRADA'
    ) DEFAULT 'PENDIENTE',
    
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    expiracion_reserva TIMESTAMP NULL,
    
    uso_credito BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_reserva_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id),

    CONSTRAINT fk_reserva_clase
        FOREIGN KEY (clase_id)
        REFERENCES clases(id),

    CONSTRAINT fk_reserva_posicion
        FOREIGN KEY (posicion_clase_id)
        REFERENCES posiciones_clase(id),

    CONSTRAINT uq_reserva_posicion
        UNIQUE (posicion_clase_id)
);

-- =====================================================
-- TABLA: pagos
-- =====================================================

CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    reserva_id INT NOT NULL UNIQUE,
    
    metodo_pago VARCHAR(50) NOT NULL,
    
    estado ENUM(
        'PENDIENTE',
        'PAGADO',
        'FALLIDO'
    ) DEFAULT 'PENDIENTE',
    
    fecha_pago TIMESTAMP NULL,

    CONSTRAINT fk_pago_reserva
        FOREIGN KEY (reserva_id)
        REFERENCES reservas(id)
        ON DELETE CASCADE
);

-- =====================================================
-- TABLA: creditos
-- Un crédito representa una clase gratuita
-- =====================================================

CREATE TABLE creditos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    usuario_id INT NOT NULL,
    
    usado BOOLEAN DEFAULT FALSE,
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_credito_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- =====================================================
-- TABLA: notificaciones
-- =====================================================

CREATE TABLE notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    usuario_id INT NOT NULL,
    
    tipo ENUM(
        'RESERVA_CONFIRMADA',
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
-- DATOS INICIALES
-- =====================================================

INSERT INTO roles (nombre)
VALUES
('ADMIN'),
('CLIENTE'),
('INSTRUCTOR');