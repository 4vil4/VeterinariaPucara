-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 08-09-2025 a las 03:37:01
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
-- Base de datos: `veterinaria_pucara`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `agenda_config`
--

CREATE TABLE `agenda_config` (
  `id` int(11) NOT NULL,
  `dia_semana` tinyint(4) NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `intervalo_min` int(11) NOT NULL DEFAULT 30
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `agenda_config`
--

INSERT INTO `agenda_config` (`id`, `dia_semana`, `hora_inicio`, `hora_fin`, `intervalo_min`) VALUES
(1, 1, '10:30:00', '19:00:00', 30),
(2, 2, '10:30:00', '19:00:00', 30),
(3, 3, '10:30:00', '19:00:00', 30),
(4, 4, '10:30:00', '19:00:00', 30),
(5, 5, '10:30:00', '19:00:00', 30),
(6, 6, '10:30:00', '19:00:00', 30),
(7, 7, '11:00:00', '18:00:00', 30);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas`
--

CREATE TABLE `citas` (
  `id` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `tipo` varchar(100) DEFAULT 'consulta',
  `observaciones` text DEFAULT NULL,
  `urgencia` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reminder_24_sent` tinyint(1) NOT NULL DEFAULT 0,
  `reminder_2_sent` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `citas`
--

INSERT INTO `citas` (`id`, `fecha`, `tipo`, `observaciones`, `urgencia`, `created_at`, `reminder_24_sent`, `reminder_2_sent`) VALUES
(5, '2025-09-07 00:08:07', 'control', 'Prueba de reminder 2h', 0, '2025-09-07 02:08:07', 0, 0),
(6, '2025-09-07 22:08:07', 'vacuna', 'Prueba de reminder 24h', 0, '2025-09-07 02:08:07', 0, 0),
(33, '2025-09-03 02:07:00', 'consulta', 'asdasd', 0, '2025-09-07 05:07:16', 0, 0),
(34, '2025-09-16 02:07:00', 'consulta', 'asdasdasdasd', 0, '2025-09-07 05:08:05', 0, 0),
(35, '2025-09-09 19:24:00', 'consulta', 'sdfsdf', 0, '2025-09-07 22:24:45', 0, 0),
(36, '2025-09-10 19:38:00', 'consulta', 'test', 0, '2025-09-07 22:38:37', 0, 0),
(37, '2025-09-10 20:38:00', 'consulta', 'test', 0, '2025-09-07 22:41:18', 0, 0),
(38, '2025-09-11 19:41:00', 'consulta', 'asfdasd', 0, '2025-09-07 22:41:59', 0, 0),
(39, '2025-09-10 21:59:00', 'consulta', 'test', 0, '2025-09-08 01:00:16', 0, 0),
(40, '2025-09-11 22:07:00', 'consulta', 'werwer', 0, '2025-09-08 01:07:21', 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas_mascotas`
--

CREATE TABLE `citas_mascotas` (
  `cita_id` int(11) NOT NULL,
  `pet_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `citas_mascotas`
--

INSERT INTO `citas_mascotas` (`cita_id`, `pet_id`) VALUES
(5, 1),
(6, 1),
(33, 2),
(34, 2),
(35, 2),
(36, 2),
(37, 2),
(38, 2),
(39, 3),
(40, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consultas`
--

CREATE TABLE `consultas` (
  `id` int(11) NOT NULL,
  `pet_id` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `diagnostico` text DEFAULT NULL,
  `tratamiento` text DEFAULT NULL,
  `vacunas` text DEFAULT NULL,
  `anexos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`anexos`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `consultas`
--

INSERT INTO `consultas` (`id`, `pet_id`, `fecha`, `motivo`, `diagnostico`, `tratamiento`, `vacunas`, `anexos`, `created_at`) VALUES
(1, 2, '2025-09-10 21:58:00', 'control', 'test', 'test', 'test', NULL, '2025-09-08 00:58:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documentos`
--

CREATE TABLE `documentos` (
  `id` int(11) NOT NULL,
  `pet_id` int(11) NOT NULL,
  `tipo` enum('cert_hosp','cert_cirugia','cert_eutanasia','cert_salida_pais','receta','presupuesto') NOT NULL,
  `datos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`datos`)),
  `archivo_path` varchar(255) DEFAULT NULL,
  `creado_por` varchar(100) DEFAULT 'sistema',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `documentos`
--

INSERT INTO `documentos` (`id`, `pet_id`, `tipo`, `datos`, `archivo_path`, `creado_por`, `created_at`) VALUES
(1, 1, 'receta', '{\"medicamentos\":\"dsdf\",\"indicaciones\":\"sdfsdf\"}', NULL, 'sistema', '2025-09-08 00:58:48');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pets`
--

CREATE TABLE `pets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name_pet` varchar(100) NOT NULL,
  `especie` enum('perro','gato','otro') DEFAULT 'perro',
  `raza` varchar(100) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pets`
--

INSERT INTO `pets` (`id`, `user_id`, `name_pet`, `especie`, `raza`, `age`, `created_at`) VALUES
(1, 1, 'lady', 'perro', 'kiltro', 8, '2025-09-07 01:58:12'),
(2, 2, 'chunchun', 'perro', 'kiltro', 8, '2025-09-07 02:30:51'),
(3, 3, 'pity', 'gato', 'kiltro', 4, '2025-09-08 00:57:31');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `fono` varchar(20) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `fono`, `password`, `created_at`) VALUES
(1, 'mao', 'test@test.cl', '999999999', NULL, '2025-09-07 01:57:45'),
(2, 'Mario', 'mario.garrido@cjgconsultores.com', '+56950014595', NULL, '2025-09-07 02:30:27'),
(3, 'saul', 'juan@example.com', '999999999', NULL, '2025-09-08 00:56:59');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `agenda_config`
--
ALTER TABLE `agenda_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dia_semana` (`dia_semana`);

--
-- Indices de la tabla `citas`
--
ALTER TABLE `citas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `citas_mascotas`
--
ALTER TABLE `citas_mascotas`
  ADD PRIMARY KEY (`cita_id`,`pet_id`),
  ADD KEY `fk_cm_pet` (`pet_id`);

--
-- Indices de la tabla `consultas`
--
ALTER TABLE `consultas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_consultas_pet` (`pet_id`);

--
-- Indices de la tabla `documentos`
--
ALTER TABLE `documentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_doc_pet` (`pet_id`);

--
-- Indices de la tabla `pets`
--
ALTER TABLE `pets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pets_user` (`user_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `agenda_config`
--
ALTER TABLE `agenda_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `citas`
--
ALTER TABLE `citas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `consultas`
--
ALTER TABLE `consultas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `documentos`
--
ALTER TABLE `documentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `pets`
--
ALTER TABLE `pets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `citas_mascotas`
--
ALTER TABLE `citas_mascotas`
  ADD CONSTRAINT `fk_cm_cita` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cm_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `consultas`
--
ALTER TABLE `consultas`
  ADD CONSTRAINT `fk_consultas_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `documentos`
--
ALTER TABLE `documentos`
  ADD CONSTRAINT `fk_doc_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pets`
--
ALTER TABLE `pets`
  ADD CONSTRAINT `fk_pets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
