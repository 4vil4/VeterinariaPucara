-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-11-2025 a las 00:34:59
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
-- Estructura de tabla para la tabla `accesorios`
--

CREATE TABLE `accesorios` (
  `id` bigint(20) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) NOT NULL DEFAULT 0,
  `foto_mime` varchar(100) DEFAULT NULL,
  `foto_blob` longblob DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alimentos`
--

CREATE TABLE `alimentos` (
  `id` bigint(20) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) NOT NULL DEFAULT 0,
  `foto_mime` varchar(100) DEFAULT NULL,
  `foto_blob` longblob DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `antibiotico`
--

CREATE TABLE `antibiotico` (
  `id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `forma` varchar(60) DEFAULT NULL,
  `concentracion` varchar(60) DEFAULT NULL,
  `via` varchar(40) DEFAULT NULL,
  `fabricante` varchar(80) DEFAULT NULL,
  `registro_isp` varchar(40) DEFAULT NULL,
  `activo_bool` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Estructura de tabla para la tabla `certificado`
--

CREATE TABLE `certificado` (
  `id` bigint(20) NOT NULL,
  `tipo` enum('salud_sag') NOT NULL,
  `fecha_emision` datetime NOT NULL DEFAULT current_timestamp(),
  `mascota_id` bigint(20) NOT NULL,
  `propietario_id` bigint(20) NOT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `data_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data_json`)),
  `file_path` varchar(255) DEFAULT NULL,
  `file_mime` varchar(64) DEFAULT NULL,
  `file_size` int(10) UNSIGNED DEFAULT NULL,
  `version` tinyint(3) UNSIGNED NOT NULL DEFAULT 1,
  `created_by` bigint(20) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `certificados_autorizacion_cirugia`
--

CREATE TABLE `certificados_autorizacion_cirugia` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `propietario_id` bigint(20) NOT NULL,
  `veterinario_id` bigint(20) NOT NULL,
  `prop_nombre` varchar(255) NOT NULL,
  `prop_rut` varchar(50) DEFAULT NULL,
  `prop_movil` varchar(50) DEFAULT NULL,
  `prop_direccion` varchar(255) DEFAULT NULL,
  `prop_correo` varchar(150) DEFAULT NULL,
  `mas_nombre` varchar(255) NOT NULL,
  `mas_especie` varchar(100) DEFAULT NULL,
  `mas_raza` varchar(150) DEFAULT NULL,
  `mas_fecha_nacimiento` datetime DEFAULT NULL,
  `mas_peso_kg` decimal(8,2) DEFAULT NULL,
  `mas_sexo` varchar(20) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `fecha_autorizacion` date NOT NULL,
  `procedimientos` varchar(500) DEFAULT NULL,
  `examenes_pre` enum('SI','NO') DEFAULT 'NO',
  `aranceles` varchar(100) DEFAULT NULL,
  `fecha_cert` date NOT NULL,
  `vet_nombre` varchar(255) NOT NULL,
  `vet_rut` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `certificados_defuncion`
--

CREATE TABLE `certificados_defuncion` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `propietario_id` bigint(20) NOT NULL,
  `veterinario_id` bigint(20) NOT NULL,
  `prop_nombre` varchar(255) NOT NULL,
  `prop_rut` varchar(50) DEFAULT NULL,
  `prop_movil` varchar(50) DEFAULT NULL,
  `prop_direccion` varchar(255) DEFAULT NULL,
  `mas_nombre` varchar(255) NOT NULL,
  `mas_especie` varchar(100) DEFAULT NULL,
  `mas_fecha_nacimiento` datetime DEFAULT NULL,
  `mas_raza` varchar(150) DEFAULT NULL,
  `mas_peso_kg` decimal(8,2) DEFAULT NULL,
  `mas_sexo` varchar(20) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `fecha_defuncion` date NOT NULL,
  `lugar_defuncion` varchar(255) DEFAULT NULL,
  `motivo_defuncion` text DEFAULT NULL,
  `fecha_cert` date NOT NULL,
  `vet_nombre` varchar(255) NOT NULL,
  `vet_rut` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `certificado_epicrisis`
--

CREATE TABLE `certificado_epicrisis` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `propietario_id` bigint(20) NOT NULL,
  `veterinario_id` bigint(20) NOT NULL,
  `mas_nombre` varchar(120) NOT NULL,
  `mas_especie` varchar(30) DEFAULT NULL,
  `mas_raza` varchar(80) DEFAULT NULL,
  `mas_sexo` varchar(20) DEFAULT NULL,
  `mas_edad_anios` decimal(6,3) DEFAULT NULL,
  `mas_peso_kg` decimal(6,2) DEFAULT NULL,
  `prop_nombre` varchar(120) NOT NULL,
  `prop_rut` varchar(30) DEFAULT NULL,
  `prop_movil` varchar(30) DEFAULT NULL,
  `prop_direccion` varchar(200) DEFAULT NULL,
  `vet_nombre` varchar(120) NOT NULL,
  `vet_rut` varchar(30) DEFAULT NULL,
  `fecha_ingreso` date NOT NULL,
  `fecha_egreso` date NOT NULL,
  `sintomas` text DEFAULT NULL,
  `diagnostico_ingreso` text DEFAULT NULL,
  `diagnostico_egreso` text DEFAULT NULL,
  `causa_egreso` enum('alta_medica','alta_relativa','alta_solicitada') DEFAULT NULL,
  `examenes` text DEFAULT NULL,
  `tratamiento_realizado` text DEFAULT NULL,
  `tratamiento_seguir` text DEFAULT NULL,
  `recomendaciones` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `certificado_salud_pucara`
--

CREATE TABLE `certificado_salud_pucara` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `propietario_id` bigint(20) NOT NULL,
  `veterinario_id` bigint(20) NOT NULL,
  `mas_nombre` varchar(120) NOT NULL,
  `mas_especie` varchar(40) DEFAULT NULL,
  `mas_raza` varchar(120) DEFAULT NULL,
  `mas_sexo` varchar(20) DEFAULT NULL,
  `mas_edad_anios` decimal(5,2) DEFAULT NULL,
  `mas_peso_kg` decimal(6,2) DEFAULT NULL,
  `prop_nombre` varchar(120) NOT NULL,
  `prop_movil` varchar(40) DEFAULT NULL,
  `prop_direccion` varchar(180) DEFAULT NULL,
  `fecha_cert` date NOT NULL,
  `relato_html` mediumtext DEFAULT NULL,
  `vet_nombre` varchar(120) NOT NULL,
  `vet_rut` varchar(30) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `certificado_salud_sag`
--

CREATE TABLE `certificado_salud_sag` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `propietario_id` bigint(20) NOT NULL,
  `veterinario_id` bigint(20) NOT NULL,
  `mas_nombre` varchar(120) NOT NULL,
  `mas_raza` varchar(120) DEFAULT NULL,
  `mas_peso_kg` decimal(6,2) DEFAULT NULL,
  `mas_especie` varchar(40) DEFAULT NULL,
  `mas_edad_anios` decimal(5,2) DEFAULT NULL,
  `mas_color` varchar(60) DEFAULT NULL,
  `mas_sexo` varchar(20) DEFAULT NULL,
  `mas_microchip` varchar(80) DEFAULT NULL,
  `chip_fecha` date DEFAULT NULL,
  `chip_sitio` varchar(60) DEFAULT NULL,
  `prop_nombre` varchar(120) NOT NULL,
  `prop_rut` varchar(30) DEFAULT NULL,
  `prop_direccion` varchar(180) DEFAULT NULL,
  `prop_fono` varchar(40) DEFAULT NULL,
  `fecha_cert` date NOT NULL,
  `fecha_inspeccion` date NOT NULL,
  `vet_nombre` varchar(120) NOT NULL,
  `vet_rut` varchar(30) DEFAULT NULL,
  `vet_fono` varchar(40) DEFAULT NULL,
  `vet_direccion` varchar(180) DEFAULT NULL,
  `vacunacion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`vacunacion_json`)),
  `desparasitacion_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`desparasitacion_json`)),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Estructura de tabla para la tabla `documento`
--

CREATE TABLE `documento` (
  `id_documento` int(11) NOT NULL,
  `nombre_documento` varchar(255) NOT NULL,
  `formato` varchar(45) NOT NULL,
  `id_solicitud` int(11) NOT NULL,
  `id_tipo_documento` int(11) NOT NULL,
  `archivo` longblob NOT NULL,
  `mime_type` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

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
-- Estructura de tabla para la tabla `hospitalizacion_monitoreo`
--

CREATE TABLE `hospitalizacion_monitoreo` (
  `id` bigint(20) NOT NULL,
  `hospitalizacion_id` bigint(20) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `temperatura_c` decimal(4,1) DEFAULT NULL,
  `lpm` int(11) DEFAULT NULL,
  `fr` int(11) DEFAULT NULL,
  `peso_kg` decimal(6,2) DEFAULT NULL,
  `deshidratacion` varchar(50) DEFAULT NULL,
  `tlc_seg` decimal(3,1) DEFAULT NULL,
  `pa` varchar(20) DEFAULT NULL,
  `pas` int(11) DEFAULT NULL,
  `pad` int(11) DEFAULT NULL,
  `pam` int(11) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `hospitalizacion_observacion`
--

CREATE TABLE `hospitalizacion_observacion` (
  `id` bigint(20) NOT NULL,
  `hospitalizacion_id` bigint(20) NOT NULL,
  `fecha` date NOT NULL,
  `texto` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `esterilizado` tinyint(1) DEFAULT NULL,
  `nro_microchip` varchar(50) DEFAULT NULL,
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicamentos`
--

CREATE TABLE `medicamentos` (
  `id` bigint(20) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) NOT NULL DEFAULT 0,
  `foto_mime` varchar(100) DEFAULT NULL,
  `foto_blob` longblob DEFAULT NULL,
  `requiere_rx` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `receta`
--

CREATE TABLE `receta` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `propietario_id` bigint(20) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `diagnostico` text DEFAULT NULL,
  `indicaciones` text DEFAULT NULL,
  `medicamentos` text DEFAULT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `firmado_por` varchar(120) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `antibiotico_bool` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `receta_antibiotico`
--

CREATE TABLE `receta_antibiotico` (
  `id` bigint(20) NOT NULL,
  `receta_id` bigint(20) NOT NULL,
  `antibiotico_id` int(11) NOT NULL,
  `dosis` varchar(80) DEFAULT NULL,
  `duracion_dias` int(11) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `enviado_sag_bool` tinyint(1) NOT NULL DEFAULT 0,
  `enviado_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Indices de la tabla `accesorios`
--
ALTER TABLE `accesorios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `alimentos`
--
ALTER TABLE `alimentos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `antibiotico`
--
ALTER TABLE `antibiotico`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ant_nombre` (`nombre`);

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
-- Indices de la tabla `certificado`
--
ALTER TABLE `certificado`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cert_mascota` (`mascota_id`),
  ADD KEY `idx_cert_propietario` (`propietario_id`);

--
-- Indices de la tabla `certificados_autorizacion_cirugia`
--
ALTER TABLE `certificados_autorizacion_cirugia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_aut_cirg_mascota` (`mascota_id`),
  ADD KEY `fk_aut_cirg_propietario` (`propietario_id`),
  ADD KEY `fk_aut_cirg_veterinario` (`veterinario_id`);

--
-- Indices de la tabla `certificados_defuncion`
--
ALTER TABLE `certificados_defuncion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_def_mascota` (`mascota_id`),
  ADD KEY `fk_def_propietario` (`propietario_id`),
  ADD KEY `fk_def_veterinario` (`veterinario_id`);

--
-- Indices de la tabla `certificado_epicrisis`
--
ALTER TABLE `certificado_epicrisis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ce_m` (`mascota_id`),
  ADD KEY `fk_ce_p` (`propietario_id`),
  ADD KEY `fk_ce_v` (`veterinario_id`);

--
-- Indices de la tabla `certificado_salud_pucara`
--
ALTER TABLE `certificado_salud_pucara`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_puc_mascota` (`mascota_id`),
  ADD KEY `fk_puc_propietario` (`propietario_id`),
  ADD KEY `fk_puc_veterinario` (`veterinario_id`);

--
-- Indices de la tabla `certificado_salud_sag`
--
ALTER TABLE `certificado_salud_sag`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_cert_mascota` (`mascota_id`),
  ADD KEY `ix_cert_propietario` (`propietario_id`),
  ADD KEY `ix_cert_veterinario` (`veterinario_id`);

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
-- Indices de la tabla `documento`
--
ALTER TABLE `documento`
  ADD PRIMARY KEY (`id_documento`),
  ADD KEY `fk_Documento_Solicitud1_idx` (`id_solicitud`),
  ADD KEY `fk_Documento_Tipo_documento1_idx` (`id_tipo_documento`);

--
-- Indices de la tabla `hospitalizacion`
--
ALTER TABLE `hospitalizacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `fk_hospitalizacion_veterinario` (`veterinario_id`);

--
-- Indices de la tabla `hospitalizacion_monitoreo`
--
ALTER TABLE `hospitalizacion_monitoreo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_hosp_fecha_hora` (`hospitalizacion_id`,`fecha`,`hora`);

--
-- Indices de la tabla `hospitalizacion_observacion`
--
ALTER TABLE `hospitalizacion_observacion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_obs` (`hospitalizacion_id`,`fecha`);

--
-- Indices de la tabla `mascota`
--
ALTER TABLE `mascota`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Mascota_propietario_id_fkey` (`propietario_id`);

--
-- Indices de la tabla `medicamentos`
--
ALTER TABLE `medicamentos`
  ADD PRIMARY KEY (`id`);

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
-- Indices de la tabla `receta`
--
ALTER TABLE `receta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_receta_vet` (`veterinario_id`),
  ADD KEY `idx_receta_fecha` (`fecha`),
  ADD KEY `idx_receta_mascota` (`mascota_id`),
  ADD KEY `idx_receta_propietario` (`propietario_id`);

--
-- Indices de la tabla `receta_antibiotico`
--
ALTER TABLE `receta_antibiotico`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ra_receta` (`receta_id`),
  ADD KEY `idx_ra_antib` (`antibiotico_id`);

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
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `accesorios`
--
ALTER TABLE `accesorios`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `alimentos`
--
ALTER TABLE `alimentos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `antibiotico`
--
ALTER TABLE `antibiotico`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT de la tabla `certificado`
--
ALTER TABLE `certificado`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `certificados_autorizacion_cirugia`
--
ALTER TABLE `certificados_autorizacion_cirugia`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `certificados_defuncion`
--
ALTER TABLE `certificados_defuncion`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `certificado_epicrisis`
--
ALTER TABLE `certificado_epicrisis`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `certificado_salud_pucara`
--
ALTER TABLE `certificado_salud_pucara`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `certificado_salud_sag`
--
ALTER TABLE `certificado_salud_sag`
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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `consulta`
--
ALTER TABLE `consulta`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT de la tabla `documento`
--
ALTER TABLE `documento`
  MODIFY `id_documento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `hospitalizacion`
--
ALTER TABLE `hospitalizacion`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `hospitalizacion_monitoreo`
--
ALTER TABLE `hospitalizacion_monitoreo`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `hospitalizacion_observacion`
--
ALTER TABLE `hospitalizacion_observacion`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mascota`
--
ALTER TABLE `mascota`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `medicamentos`
--
ALTER TABLE `medicamentos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `receta`
--
ALTER TABLE `receta`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `receta_antibiotico`
--
ALTER TABLE `receta_antibiotico`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `vacuna`
--
ALTER TABLE `vacuna`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `veterinario`
--
ALTER TABLE `veterinario`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

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
-- Filtros para la tabla `certificado`
--
ALTER TABLE `certificado`
  ADD CONSTRAINT `fk_cert_mascota` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cert_propietario` FOREIGN KEY (`propietario_id`) REFERENCES `propietario` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `certificados_autorizacion_cirugia`
--
ALTER TABLE `certificados_autorizacion_cirugia`
  ADD CONSTRAINT `fk_aut_cirg_mascota` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `fk_aut_cirg_propietario` FOREIGN KEY (`propietario_id`) REFERENCES `propietario` (`id`),
  ADD CONSTRAINT `fk_aut_cirg_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `certificados_defuncion`
--
ALTER TABLE `certificados_defuncion`
  ADD CONSTRAINT `fk_def_mascota` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `fk_def_propietario` FOREIGN KEY (`propietario_id`) REFERENCES `propietario` (`id`),
  ADD CONSTRAINT `fk_def_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `certificado_epicrisis`
--
ALTER TABLE `certificado_epicrisis`
  ADD CONSTRAINT `fk_ce_m` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `fk_ce_p` FOREIGN KEY (`propietario_id`) REFERENCES `propietario` (`id`),
  ADD CONSTRAINT `fk_ce_v` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `certificado_salud_pucara`
--
ALTER TABLE `certificado_salud_pucara`
  ADD CONSTRAINT `fk_puc_mascota` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `fk_puc_propietario` FOREIGN KEY (`propietario_id`) REFERENCES `propietario` (`id`),
  ADD CONSTRAINT `fk_puc_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `certificado_salud_sag`
--
ALTER TABLE `certificado_salud_sag`
  ADD CONSTRAINT `fk_cert_sag__mascota` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cert_sag__propietario` FOREIGN KEY (`propietario_id`) REFERENCES `propietario` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cert_sag__veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`) ON UPDATE CASCADE;

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
-- Filtros para la tabla `documento`
--
ALTER TABLE `documento`
  ADD CONSTRAINT `fk_Documento_Solicitud1` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitud` (`id_solicitud`),
  ADD CONSTRAINT `fk_Documento_Tipo_documento1` FOREIGN KEY (`id_tipo_documento`) REFERENCES `tipo_documento` (`id_tipo_documento`);

--
-- Filtros para la tabla `hospitalizacion`
--
ALTER TABLE `hospitalizacion`
  ADD CONSTRAINT `fk_hospitalizacion_veterinario` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`),
  ADD CONSTRAINT `hospitalizacion_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`);

--
-- Filtros para la tabla `hospitalizacion_monitoreo`
--
ALTER TABLE `hospitalizacion_monitoreo`
  ADD CONSTRAINT `fk_hosp_mon_hosp` FOREIGN KEY (`hospitalizacion_id`) REFERENCES `hospitalizacion` (`id`);

--
-- Filtros para la tabla `hospitalizacion_observacion`
--
ALTER TABLE `hospitalizacion_observacion`
  ADD CONSTRAINT `hospitalizacion_observacion_ibfk_1` FOREIGN KEY (`hospitalizacion_id`) REFERENCES `hospitalizacion` (`id`);

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
-- Filtros para la tabla `receta`
--
ALTER TABLE `receta`
  ADD CONSTRAINT `fk_receta_mascota` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `fk_receta_propietario` FOREIGN KEY (`propietario_id`) REFERENCES `propietario` (`id`),
  ADD CONSTRAINT `fk_receta_vet` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `receta_antibiotico`
--
ALTER TABLE `receta_antibiotico`
  ADD CONSTRAINT `fk_ra_antib` FOREIGN KEY (`antibiotico_id`) REFERENCES `antibiotico` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ra_receta` FOREIGN KEY (`receta_id`) REFERENCES `receta` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
