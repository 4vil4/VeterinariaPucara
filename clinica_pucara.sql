-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-10-2025 a las 22:58:54
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `clinica_pucara`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `antiparasitario`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `antipulgas`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cirugia`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cita`
--

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

--
-- Volcado de datos para la tabla `cita`
--

INSERT INTO `cita` (`id`, `fecha_inicio`, `fecha_fin`, `tipo`, `urgencia`, `estado`, `observaciones`, `propietario_id`, `created_by`, `created_at`, `updated_at`) VALUES
(1, '2025-10-15 06:46:00.000', NULL, 'consultas', 0, '', 'testter', 1, NULL, '2025-10-14 15:46:54.112', '2025-10-14 16:59:49.000'),
(2, '2025-10-15 19:24:00.000', NULL, 'consulta', 1, 'confirmada', 'test', 1, NULL, '2025-10-14 16:24:44.843', '0000-00-00 00:00:00.000'),
(3, '2025-10-23 02:04:00.000', NULL, 'consulta', 0, 'atendida', 'test', 1, NULL, '2025-10-14 17:04:17.185', '2025-10-14 17:08:30.000');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citamascota`
--

CREATE TABLE `citamascota` (
  `cita_id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consulta`
--

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

--
-- Volcado de datos para la tabla `consulta`
--

INSERT INTO `consulta` (`id`, `mascota_id`, `fecha`, `motivo`, `diagnostico`, `indicaciones`, `atendido_por`, `veterinario_id`, `monto_total`, `anestesia_bool`, `created_at`) VALUES
(1, 1, '2025-10-15 14:08:00', 'control', 'test', 'test', NULL, NULL, 0.00, 0, '2025-10-14 14:08:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `control`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `defuncion`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dermatologia`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `hospitalizacion`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mascota`
--

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

--
-- Volcado de datos para la tabla `mascota`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oftalmologia`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_examen`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `profilaxis`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `propietario`
--

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

--
-- Volcado de datos para la tabla `propietario`
--

INSERT INTO `propietario` (`id`, `nombre`, `correo`, `movil`, `rut`, `direccion`, `created_at`, `updated_at`) VALUES
(1, 'mario', 'test@test.cl', '+56912121212', '18188188-9', 'test', '2025-10-13 23:31:40.000', '2025-10-13 23:31:40.000');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registro_comision`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `triaje`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

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

--
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`id`, `nombre`, `email`, `password_hash`, `role`, `reset_token`, `reset_expires`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@pucara.cl', '$2a$10$3X79bWGu7Q2KiIyFI6TOKOMEXt5UCb0QjUylVDLN8sldxpLENfic2', 'admin', NULL, NULL, '2025-10-14 20:03:36', NULL),
(2, 'Mao', 'vet@test.cl', '$2a$10$rnbTacTroa36CHKGQhT89e2Q/WKKkjunxoTjCQbvCJcFEA9s4l5CG', 'vet', NULL, NULL, '2025-10-15 12:43:35', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vacuna`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `veterinario`
--

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

--
-- Volcado de datos para la tabla `veterinario`
--

INSERT INTO `veterinario` (`id`, `nombre`, `rut`, `correo`, `movil`, `user_id`, `activo`, `created_at`) VALUES
(1, 'Mao', '17000000-6', 'test@tester.cl', '+56934343434', 2, 1, '2025-10-15 12:43:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `veterinarios`
--

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

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_comision_mensual_vet`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_comision_mensual_vet` (
`veterinario_id` bigint(20)
,`mes` varchar(7)
,`cantidad_registros` bigint(21)
,`total_bruto` decimal(32,2)
,`total_comision` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `v_comision_mensual_vet`
--
DROP TABLE IF EXISTS `v_comision_mensual_vet`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_comision_mensual_vet`  AS SELECT `rc`.`veterinario_id` AS `veterinario_id`, date_format(`rc`.`fecha`,'%Y-%m') AS `mes`, count(0) AS `cantidad_registros`, sum(`rc`.`base_monto`) AS `total_bruto`, sum(`rc`.`comision_monto`) AS `total_comision` FROM `registro_comision` AS `rc` GROUP BY `rc`.`veterinario_id`, date_format(`rc`.`fecha`,'%Y-%m') ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `antiparasitario`
--
ALTER TABLE `antiparasitario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_antiparasitario_veterinario` (`veterinario_id`);

--
-- Indices de la tabla `antipulgas`
--
ALTER TABLE `antipulgas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_antipulgas_veterinario` (`veterinario_id`);

--
-- Indices de la tabla `cirugia`
--
ALTER TABLE `cirugia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_cirugia_veterinario` (`veterinario_id`);

--
-- Indices de la tabla `cita`
--
ALTER TABLE `cita`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `citamascota`
--
ALTER TABLE `citamascota`
  ADD PRIMARY KEY (`cita_id`,`mascota_id`),
  ADD KEY `CitaMascota_mascota_id_fkey` (`mascota_id`);

--
-- Indices de la tabla `consulta`
--
ALTER TABLE `consulta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_consulta_veterinario` (`veterinario_id`);

--
-- Indices de la tabla `control`
--
ALTER TABLE `control`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Control_mascota_id_fecha_idx` (`mascota_id`,`fecha`),
  ADD KEY `fk_control_veterinario` (`veterinario_id`);

--
-- Indices de la tabla `defuncion`
--
ALTER TABLE `defuncion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`);

--
-- Indices de la tabla `dermatologia`
--
ALTER TABLE `dermatologia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_dermatologia_veterinario` (`veterinario_id`);

--
-- Indices de la tabla `hospitalizacion`
--
ALTER TABLE `hospitalizacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_hospitalizacion_veterinario` (`veterinario_id`);

--
-- Indices de la tabla `mascota`
--
ALTER TABLE `mascota`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Mascota_propietario_id_fkey` (`propietario_id`);

--
-- Indices de la tabla `oftalmologia`
--
ALTER TABLE `oftalmologia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_oftalmologia_veterinario` (`veterinario_id`);

--
-- Indices de la tabla `orden_examen`
--
ALTER TABLE `orden_examen`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_orden_examen_veterinario` (`veterinario_id`);

--
-- Indices de la tabla `profilaxis`
--
ALTER TABLE `profilaxis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_profilaxis_veterinario` (`veterinario_id`);

--
-- Indices de la tabla `propietario`
--
ALTER TABLE `propietario`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `registro_comision`
--
ALTER TABLE `registro_comision`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_vet_fecha` (`veterinario_id`,`fecha`);

--
-- Indices de la tabla `triaje`
--
ALTER TABLE `triaje`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_triaje_veterinario` (`veterinario_id`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `vacuna`
--
ALTER TABLE `vacuna`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Vacuna_mascota_id_fecha_idx` (`mascota_id`,`fecha`),
  ADD KEY `fk_vacuna_veterinario` (`veterinario_id`);

--
-- Indices de la tabla `veterinario`
--
ALTER TABLE `veterinario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_veterinario_user` (`user_id`);

--
-- Indices de la tabla `veterinarios`
--
ALTER TABLE `veterinarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `antiparasitario`
--
ALTER TABLE `antiparasitario`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `antipulgas`
--
ALTER TABLE `antipulgas`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cirugia`
--
ALTER TABLE `cirugia`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cita`
--
ALTER TABLE `cita`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `consulta`
--
ALTER TABLE `consulta`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `control`
--
ALTER TABLE `control`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `defuncion`
--
ALTER TABLE `defuncion`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `dermatologia`
--
ALTER TABLE `dermatologia`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `hospitalizacion`
--
ALTER TABLE `hospitalizacion`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mascota`
--
ALTER TABLE `mascota`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `oftalmologia`
--
ALTER TABLE `oftalmologia`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `orden_examen`
--
ALTER TABLE `orden_examen`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `profilaxis`
--
ALTER TABLE `profilaxis`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `propietario`
--
ALTER TABLE `propietario`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `registro_comision`
--
ALTER TABLE `registro_comision`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `triaje`
--
ALTER TABLE `triaje`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `vacuna`
--
ALTER TABLE `vacuna`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `veterinario`
--
ALTER TABLE `veterinario`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `veterinarios`
--
ALTER TABLE `veterinarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `antiparasitario`
--
ALTER TABLE `antiparasitario`
  ADD CONSTRAINT `antiparasitario_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `fk_antiparasitario_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `antipulgas`
--
ALTER TABLE `antipulgas`
  ADD CONSTRAINT `antipulgas_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `fk_antipulgas_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `cirugia`
--
ALTER TABLE `cirugia`
  ADD CONSTRAINT `cirugia_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `fk_cirugia_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `citamascota`
--
ALTER TABLE `citamascota`
  ADD CONSTRAINT `CitaMascota_cita_id_fkey` FOREIGN KEY (`cita_id`) REFERENCES `cita` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `CitaMascota_mascota_id_fkey` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `consulta`
--
ALTER TABLE `consulta`
  ADD CONSTRAINT `consulta_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `fk_consulta_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `control`
--
ALTER TABLE `control`
  ADD CONSTRAINT `Control_mascota_id_fkey` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_control_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `defuncion`
--
ALTER TABLE `defuncion`
  ADD CONSTRAINT `defuncion_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`);

--
-- Filtros para la tabla `dermatologia`
--
ALTER TABLE `dermatologia`
  ADD CONSTRAINT `dermatologia_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `fk_dermatologia_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `hospitalizacion`
--
ALTER TABLE `hospitalizacion`
  ADD CONSTRAINT `fk_hospitalizacion_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`),
  ADD CONSTRAINT `hospitalizacion_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`);

--
-- Filtros para la tabla `mascota`
--
ALTER TABLE `mascota`
  ADD CONSTRAINT `Mascota_propietario_id_fkey` FOREIGN KEY (`propietario_id`) REFERENCES `propietario` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `oftalmologia`
--
ALTER TABLE `oftalmologia`
  ADD CONSTRAINT `fk_oftalmologia_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`),
  ADD CONSTRAINT `oftalmologia_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`);

--
-- Filtros para la tabla `orden_examen`
--
ALTER TABLE `orden_examen`
  ADD CONSTRAINT `fk_orden_examen_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`),
  ADD CONSTRAINT `orden_examen_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`);

--
-- Filtros para la tabla `profilaxis`
--
ALTER TABLE `profilaxis`
  ADD CONSTRAINT `fk_profilaxis_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`),
  ADD CONSTRAINT `profilaxis_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`);

--
-- Filtros para la tabla `registro_comision`
--
ALTER TABLE `registro_comision`
  ADD CONSTRAINT `fk_registro_comision_vet` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `triaje`
--
ALTER TABLE `triaje`
  ADD CONSTRAINT `fk_triaje_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`),
  ADD CONSTRAINT `triaje_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`);

--
-- Filtros para la tabla `vacuna`
--
ALTER TABLE `vacuna`
  ADD CONSTRAINT `Vacuna_mascota_id_fkey` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_vacuna_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `veterinario`
--
ALTER TABLE `veterinario`
  ADD CONSTRAINT `fk_veterinario_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Filtros para la tabla `veterinarios`
--
ALTER TABLE `veterinarios`
  ADD CONSTRAINT `fk_vet_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
