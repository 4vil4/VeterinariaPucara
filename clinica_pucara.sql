SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `antiparasitario` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `fecha` datetime NOT NULL,
  `producto` varchar(120) DEFAULT NULL,
  `via` varchar(50) DEFAULT NULL,
  `dosis` decimal(8,2) DEFAULT NULL,
  `unidad` varchar(20) DEFAULT NULL,
  `peso_referencia` decimal(6,2) DEFAULT NULL,
  `proxima_fecha` date DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `atendido_por` varchar(100) DEFAULT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `monto_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `antipulgas` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `fecha` datetime NOT NULL,
  `producto` varchar(120) DEFAULT NULL,
  `via` varchar(50) DEFAULT NULL,
  `dosis` decimal(8,2) DEFAULT NULL,
  `unidad` varchar(20) DEFAULT NULL,
  `proxima_fecha` date DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `atendido_por` varchar(100) DEFAULT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `monto_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cirugia` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `fecha` datetime NOT NULL,
  `procedimiento` varchar(255) DEFAULT NULL,
  `cirujano` varchar(100) DEFAULT NULL,
  `anestesia` varchar(100) DEFAULT NULL,
  `asa` varchar(10) DEFAULT NULL,
  `materiales` text DEFAULT NULL,
  `complicaciones` text DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `consent_firmado` tinyint(1) DEFAULT NULL,
  `atendido_por` varchar(100) DEFAULT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `monto_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cita` (
  `id` bigint(20) NOT NULL,
  `fecha_inicio` datetime(3) NOT NULL,
  `fecha_fin` datetime(3) DEFAULT NULL,
  `tipo` varchar(60) DEFAULT NULL,
  `urgencia` tinyint(1) NOT NULL DEFAULT 0,
  `estado` enum('programada','confirmada','atendida','cancelada','no_asiste') NOT NULL DEFAULT 'programada',
  `observaciones` varchar(191) DEFAULT NULL,
  `propietario_id` bigint(20) DEFAULT NULL,
  `created_by` varchar(120) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `citamascota` (
  `cita_id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `consulta` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `fecha` datetime NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `diagnostico` text DEFAULT NULL,
  `indicaciones` text DEFAULT NULL,
  `atendido_por` varchar(100) DEFAULT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `monto_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `anestesia_bool` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `control` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `fecha` datetime(3) NOT NULL,
  `peso_kg` decimal(5,2) DEFAULT NULL,
  `temperatura_c` decimal(4,1) DEFAULT NULL,
  `fc` int(11) DEFAULT NULL,
  `fr` int(11) DEFAULT NULL,
  `motivo` varchar(200) DEFAULT NULL,
  `examen_fisico` varchar(191) DEFAULT NULL,
  `diagnostico` varchar(191) DEFAULT NULL,
  `indicaciones` varchar(191) DEFAULT NULL,
  `atendido_por` varchar(120) DEFAULT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `monto_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `defuncion` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `fecha` datetime NOT NULL,
  `tipo` enum('natural','eutanasia') DEFAULT 'natural',
  `causa` varchar(255) DEFAULT NULL,
  `responsable` varchar(100) DEFAULT NULL,
  `certificado` tinyint(1) DEFAULT 0,
  `observaciones` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `dermatologia` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `fecha` datetime NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `lesiones` text DEFAULT NULL,
  `pruebas` text DEFAULT NULL,
  `diagnostico` text DEFAULT NULL,
  `tratamiento` text DEFAULT NULL,
  `fecha_control` date DEFAULT NULL,
  `atendido_por` varchar(100) DEFAULT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `monto_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `hospitalizacion` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `fecha_ingreso` datetime NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `cuidados` text DEFAULT NULL,
  `medicacion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`medicacion_json`)),
  `estado` enum('en_curso','alta','derivada','fallecida') DEFAULT 'en_curso',
  `fecha_alta` datetime DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `atendido_por` varchar(100) DEFAULT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `monto_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mascota` (
  `id` bigint(20) NOT NULL,
  `propietario_id` bigint(20) NOT NULL,
  `nombre` varchar(191) NOT NULL,
  `n_historial` varchar(50) DEFAULT NULL,
  `especie` enum('perro','gato') NOT NULL,
  `raza` varchar(120) DEFAULT NULL,
  `sexo` enum('macho','hembra','desconocido') NOT NULL DEFAULT 'desconocido',
  `fecha_nacimiento` datetime(3) DEFAULT NULL,
  `edad_anios` decimal(4,1) DEFAULT NULL,
  `peso_kg` decimal(5,2) DEFAULT NULL,
  `foto` longblob DEFAULT NULL,
  `foto_nombre` varchar(255) DEFAULT NULL,
  `foto_tipo` varchar(100) DEFAULT NULL,
  `foto_tamano` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `oftalmologia` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `fecha` datetime NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `test_schirmer_mm` int(11) DEFAULT NULL,
  `fluoresceina` tinyint(1) DEFAULT NULL,
  `pio_mmHg` decimal(4,1) DEFAULT NULL,
  `hallazgos` text DEFAULT NULL,
  `diagnostico` text DEFAULT NULL,
  `tratamiento` text DEFAULT NULL,
  `atendido_por` varchar(100) DEFAULT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `monto_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `orden_examen` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `fecha` datetime NOT NULL,
  `tipo_examen` varchar(120) DEFAULT NULL,
  `laboratorio` varchar(120) DEFAULT NULL,
  `muestras` text DEFAULT NULL,
  `estado` enum('pendiente','enviado','recibido','informado') DEFAULT 'pendiente',
  `resultados_url` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `monto_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `profilaxis` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `fecha` datetime NOT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  `hallazgos` text DEFAULT NULL,
  `procedimiento` text DEFAULT NULL,
  `anestesia` varchar(100) DEFAULT NULL,
  `recomendaciones` text DEFAULT NULL,
  `atendido_por` varchar(100) DEFAULT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `monto_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `propietario` (
  `id` bigint(20) NOT NULL,
  `nombre` varchar(191) NOT NULL,
  `correo` varchar(160) DEFAULT NULL,
  `movil` varchar(40) DEFAULT NULL,
  `rut` varchar(20) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `registro_comision` (
  `id` bigint(20) NOT NULL,
  `tipo` varchar(40) NOT NULL,
  `registro_id` bigint(20) NOT NULL,
  `veterinario_id` bigint(20) NOT NULL,
  `porcentaje` decimal(5,2) NOT NULL,
  `base_monto` decimal(10,2) NOT NULL,
  `comision_monto` decimal(10,2) NOT NULL,
  `fecha` date NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `triaje` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `fecha` datetime NOT NULL,
  `nivel` varchar(10) DEFAULT NULL,
  `signos_vitales` text DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `atendido_por` varchar(100) DEFAULT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `monto_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user` (
  `id` bigint(20) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('user','admin','vet') NOT NULL DEFAULT 'user',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `vacuna` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `fecha` datetime(3) NOT NULL,
  `vacuna` varchar(191) NOT NULL,
  `lote` varchar(80) DEFAULT NULL,
  `fabricante` varchar(120) DEFAULT NULL,
  `fecha_venc` datetime(3) DEFAULT NULL,
  `proxima_fecha` datetime(3) DEFAULT NULL,
  `observaciones` varchar(191) DEFAULT NULL,
  `atendido_por` varchar(120) DEFAULT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `monto_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `veterinario` (
  `id` bigint(20) NOT NULL,
  `nombre` varchar(191) NOT NULL,
  `rut` varchar(20) DEFAULT NULL,
  `correo` varchar(160) DEFAULT NULL,
  `movil` varchar(40) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `veterinarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `rut` varchar(20) DEFAULT NULL,
  `correo` varchar(160) DEFAULT NULL,
  `movil` varchar(30) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `user_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP VIEW IF EXISTS `v_comision_mensual_vet`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `v_comision_mensual_vet` AS
SELECT
  `rc`.`veterinario_id` AS `veterinario_id`,
  DATE_FORMAT(`rc`.`fecha`, '%Y-%m') AS `mes`,
  COUNT(0) AS `cantidad_registros`,
  SUM(`rc`.`base_monto`) AS `total_bruto`,
  SUM(`rc`.`comision_monto`) AS `total_comision`
FROM `registro_comision` `rc`
GROUP BY `rc`.`veterinario_id`, DATE_FORMAT(`rc`.`fecha`, '%Y-%m');

ALTER TABLE `antiparasitario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_antiparasitario_veterinario` (`veterinario_id`);

ALTER TABLE `antipulgas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_antipulgas_veterinario` (`veterinario_id`);

ALTER TABLE `cirugia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_cirugia_veterinario` (`veterinario_id`);

ALTER TABLE `cita`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `citamascota`
  ADD PRIMARY KEY (`cita_id`,`mascota_id`),
  ADD KEY `CitaMascota_mascota_id_fkey` (`mascota_id`);

ALTER TABLE `consulta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_consulta_veterinario` (`veterinario_id`);

ALTER TABLE `control`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Control_mascota_id_fecha_idx` (`mascota_id`,`fecha`),
  ADD KEY `fk_control_veterinario` (`veterinario_id`);

ALTER TABLE `defuncion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`);

ALTER TABLE `dermatologia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_dermatologia_veterinario` (`veterinario_id`);

ALTER TABLE `hospitalizacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_hospitalizacion_veterinario` (`veterinario_id`);

ALTER TABLE `mascota`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Mascota_propietario_id_fkey` (`propietario_id`);

ALTER TABLE `oftalmologia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_oftalmologia_veterinario` (`veterinario_id`);

ALTER TABLE `orden_examen`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_orden_examen_veterinario` (`veterinario_id`);

ALTER TABLE `profilaxis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_profilaxis_veterinario` (`veterinario_id`);

ALTER TABLE `propietario`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `registro_comision`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_vet_fecha` (`veterinario_id`,`fecha`);

ALTER TABLE `triaje`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_triaje_veterinario` (`veterinario_id`);

ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

ALTER TABLE `vacuna`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Vacuna_mascota_id_fecha_idx` (`mascota_id`,`fecha`),
  ADD KEY `fk_vacuna_veterinario` (`veterinario_id`);

ALTER TABLE `veterinario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_veterinario_user` (`user_id`);

ALTER TABLE `veterinarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

ALTER TABLE `antiparasitario`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `antipulgas`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cirugia`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cita`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `consulta`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `control`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `defuncion`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `dermatologia`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `hospitalizacion`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `mascota`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `oftalmologia`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `orden_examen`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `profilaxis`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `propietario`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `registro_comision`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `triaje`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `user`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `vacuna`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `veterinario`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `veterinarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `antiparasitario`
  ADD CONSTRAINT `antiparasitario_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `fk_antiparasitario_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

ALTER TABLE `antipulgas`
  ADD CONSTRAINT `antipulgas_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `fk_antipulgas_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

ALTER TABLE `cirugia`
  ADD CONSTRAINT `cirugia_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `fk_cirugia_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

ALTER TABLE `citamascota`
  ADD CONSTRAINT `CitaMascota_cita_id_fkey` FOREIGN KEY (`cita_id`) REFERENCES `cita` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `CitaMascota_mascota_id_fkey` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`) ON UPDATE CASCADE;

ALTER TABLE `consulta`
  ADD CONSTRAINT `consulta_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `fk_consulta_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

ALTER TABLE `control`
  ADD CONSTRAINT `Control_mascota_id_fkey` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_control_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

ALTER TABLE `defuncion`
  ADD CONSTRAINT `defuncion_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`);

ALTER TABLE `dermatologia`
  ADD CONSTRAINT `dermatologia_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `fk_dermatologia_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

ALTER TABLE `hospitalizacion`
  ADD CONSTRAINT `fk_hospitalizacion_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`),
  ADD CONSTRAINT `hospitalizacion_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`);

ALTER TABLE `mascota`
  ADD CONSTRAINT `Mascota_propietario_id_fkey` FOREIGN KEY (`propietario_id`) REFERENCES `propietario` (`id`) ON UPDATE CASCADE;

ALTER TABLE `oftalmologia`
  ADD CONSTRAINT `fk_oftalmologia_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`),
  ADD CONSTRAINT `oftalmologia_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`);

ALTER TABLE `orden_examen`
  ADD CONSTRAINT `fk_orden_examen_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`),
  ADD CONSTRAINT `orden_examen_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`);

ALTER TABLE `profilaxis`
  ADD CONSTRAINT `fk_profilaxis_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`),
  ADD CONSTRAINT `profilaxis_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`);

ALTER TABLE `registro_comision`
  ADD CONSTRAINT `fk_registro_comision_vet` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

ALTER TABLE `triaje`
  ADD CONSTRAINT `fk_triaje_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`),
  ADD CONSTRAINT `triaje_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`);

ALTER TABLE `vacuna`
  ADD CONSTRAINT `Vacuna_mascota_id_fkey` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_vacuna_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

ALTER TABLE `veterinario`
  ADD CONSTRAINT `fk_veterinario_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

ALTER TABLE `veterinarios`
  ADD CONSTRAINT `fk_vet_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

COMMIT;
