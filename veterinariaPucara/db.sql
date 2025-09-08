CREATE DATABASE IF NOT EXISTS veterinaria_pucara
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE veterinaria_pucara;

-- Propietarios
CREATE TABLE owners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NULL,
  phone VARCHAR(20) NULL,         -- E.164, ej: +56912345678 (o 56912345678)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Mascotas
CREATE TABLE pets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  name_pet VARCHAR(120) NOT NULL,
  age INT NULL,
  raza VARCHAR(80) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Citas
CREATE TABLE citas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME NOT NULL,
  tipo VARCHAR(50) NULL,          -- ej: consulta, control, vacuna
  urgencia TINYINT(1) DEFAULT 0,
  observaciones TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Relación N:M (una cita puede incluir varias mascotas)
CREATE TABLE citas_pets (
  cita_id INT NOT NULL,
  pet_id INT NOT NULL,
  PRIMARY KEY (cita_id, pet_id),
  CONSTRAINT fk_cp_cita FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE CASCADE,
  CONSTRAINT fk_cp_pet  FOREIGN KEY (pet_id)  REFERENCES pets(id)  ON DELETE CASCADE
) ENGINE=InnoDB;
