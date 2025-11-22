-- Base de datos Clinica Pucara (estructura sin datos)
DROP DATABASE IF EXISTS `clinica_pucara`;
CREATE DATABASE IF NOT EXISTS `clinica_pucara`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `clinica_pucara`;

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
  `id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `tipo` varchar(60) DEFAULT NULL,
  `especie` varchar(40) DEFAULT NULL,
  `dosis` varchar(60) DEFAULT NULL,
  `via` varchar(40) DEFAULT NULL,
  `frecuencia` varchar(60) DEFAULT NULL,
  `activo_bool` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cirugia`
--

CREATE TABLE `cirugia` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `propietario_id` bigint(20) NOT NULL,
  `veterinario_id` bigint(20) NOT NULL,
  `fecha` datetime NOT NULL,
  `tipo_cirugia` varchar(150) DEFAULT NULL,
  `diagnostico_preoperatorio` text DEFAULT NULL,
  `diagnostico_postoperatorio` text DEFAULT NULL,
  `procedimiento` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'Programada',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cirugia_detalle`
--

CREATE TABLE `cirugia_detalle` (
  `id` bigint(20) NOT NULL,
  `cirugia_id` bigint(20) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `materiales` text DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cirugia_recuperacion`
--

CREATE TABLE `cirugia_recuperacion` (
  `id` bigint(20) NOT NULL,
  `cirugia_id` bigint(20) NOT NULL,
  `fecha_control` datetime NOT NULL,
  `estado` varchar(100) DEFAULT NULL,
  `indicaciones` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cita`
--

CREATE TABLE `cita` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `propietario_id` bigint(20) NOT NULL,
  `veterinario_id` bigint(20) NOT NULL,
  `fecha` datetime NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'Pendiente',
  `tipo` varchar(50) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `es_urgencia` tinyint(1) NOT NULL DEFAULT 0,
  `hospitalizacion_id` bigint(20) DEFAULT NULL,
  `recordatorio_enviado` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_recordatorio` datetime DEFAULT NULL,
  `duracion_minutos` int(11) NOT NULL DEFAULT 30
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comisiones`
--

CREATE TABLE `comisiones` (
  `id` bigint(20) NOT NULL,
  `veterinario_id` bigint(20) NOT NULL,
  `porcentaje` decimal(5,2) NOT NULL DEFAULT 0.00,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion_clinica`
--

CREATE TABLE `configuracion_clinica` (
  `id` int(11) NOT NULL,
  `nombre_clinica` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `horario_atencion` varchar(255) DEFAULT NULL,
  `logo_mime` varchar(100) DEFAULT NULL,
  `logo_blob` longblob DEFAULT NULL,
  `config_json` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consultas`
--

CREATE TABLE `consultas` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) DEFAULT NULL,
  `propietario_id` bigint(20) DEFAULT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `fecha_consulta` datetime NOT NULL,
  `motivo` text DEFAULT NULL,
  `diagnostico` text DEFAULT NULL,
  `tratamiento` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `peso` decimal(5,2) DEFAULT NULL,
  `temperatura` decimal(4,1) DEFAULT NULL,
  `frecuencia_cardiaca` int(11) DEFAULT NULL,
  `frecuencia_respiratoria` int(11) DEFAULT NULL,
  `estado_general` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `proxima_cita` datetime DEFAULT NULL,
  `tipo_consulta` varchar(50) DEFAULT NULL,
  `es_urgencia` tinyint(1) NOT NULL DEFAULT 0,
  `hospitalizacion_id` bigint(20) DEFAULT NULL,
  `triage` varchar(50) DEFAULT NULL,
  `notas_triage` text DEFAULT NULL,
  `signos_vitales_json` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consultas_archivos`
--

CREATE TABLE `consultas_archivos` (
  `id` bigint(20) NOT NULL,
  `consulta_id` bigint(20) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `archivo_blob` longblob NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consultas_tratamientos`
--

CREATE TABLE `consultas_tratamientos` (
  `id` bigint(20) NOT NULL,
  `consulta_id` bigint(20) NOT NULL,
  `medicamento` varchar(255) DEFAULT NULL,
  `dosis` varchar(255) DEFAULT NULL,
  `frecuencia` varchar(255) DEFAULT NULL,
  `duracion` varchar(255) DEFAULT NULL,
  `instrucciones` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `examenes`
--

CREATE TABLE `examenes` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) DEFAULT NULL,
  `propietario_id` bigint(20) DEFAULT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `consulta_id` bigint(20) DEFAULT NULL,
  `tipo_examen` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `resultado` text DEFAULT NULL,
  `fecha_examen` datetime NOT NULL,
  `observaciones` text DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `archivo_mime` varchar(100) DEFAULT NULL,
  `archivo_blob` longblob DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `laboratorio_externo` varchar(150) DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `examenes_tipo`
--

CREATE TABLE `examenes_tipo` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ficha_medica`
--

CREATE TABLE `ficha_medica` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `propietario_id` bigint(20) NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `estado` varchar(50) DEFAULT 'Activa',
  `antecedentes` text DEFAULT NULL,
  `alergias` text DEFAULT NULL,
  `enfermedades_cronicas` text DEFAULT NULL,
  `cirugias_previas` text DEFAULT NULL,
  `observaciones_generales` text DEFAULT NULL,
  `ultimo_control` datetime DEFAULT NULL,
  `proximo_control` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ficha_medica_historial`
--

CREATE TABLE `ficha_medica_historial` (
  `id` bigint(20) NOT NULL,
  `ficha_medica_id` bigint(20) NOT NULL,
  `tipo_evento` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_evento` datetime NOT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `hospitalizacion`
--

CREATE TABLE `hospitalizacion` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `propietario_id` bigint(20) NOT NULL,
  `veterinario_id` bigint(20) NOT NULL,
  `fecha_ingreso` datetime NOT NULL,
  `fecha_egreso` datetime DEFAULT NULL,
  `motivo` text DEFAULT NULL,
  `diagnostico` text DEFAULT NULL,
  `tratamiento` text DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'En curso',
  `observaciones` text DEFAULT NULL,
  `cama` varchar(50) DEFAULT NULL,
  `alimentacion` text DEFAULT NULL,
  `signos_vitales_json` json DEFAULT NULL,
  `indicaciones_especiales` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `costo_estimado` decimal(10,2) DEFAULT 0.00,
  `costo_final` decimal(10,2) DEFAULT 0.00,
  `es_urgencia` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `hospitalizacion_evolucion`
--

CREATE TABLE `hospitalizacion_evolucion` (
  `id` bigint(20) NOT NULL,
  `hospitalizacion_id` bigint(20) NOT NULL,
  `fecha_registro` datetime NOT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `signos_vitales` json DEFAULT NULL,
  `alimentacion` text DEFAULT NULL,
  `eliminaciones` text DEFAULT NULL,
  `peso` decimal(5,2) DEFAULT NULL,
  `temperatura` decimal(4,1) DEFAULT NULL,
  `frecuencia_cardiaca` int(11) DEFAULT NULL,
  `frecuencia_respiratoria` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `estado_general` varchar(100) DEFAULT NULL,
  `medicamentos` text DEFAULT NULL,
  `procedimientos` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `hospitalizacion_files`
--

CREATE TABLE `hospitalizacion_files` (
  `id` bigint(20) NOT NULL,
  `hospitalizacion_id` bigint(20) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `archivo_blob` longblob NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notas`
--

CREATE TABLE `notas` (
  `id` bigint(20) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `contenido` text NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `prioridad` varchar(50) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `recordatorio` datetime DEFAULT NULL,
  `usuario_id` bigint(20) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `propietario`
--

CREATE TABLE `propietario` (
  `id` bigint(20) NOT NULL,
  `rut` varchar(12) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `comuna` varchar(100) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `observaciones` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` bigint(20) DEFAULT NULL,
  `numero_direccion` varchar(50) DEFAULT NULL,
  `departamento` varchar(50) DEFAULT NULL,
  `referencia` varchar(255) DEFAULT NULL,
  `es_usuario` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` varchar(20) DEFAULT NULL,
  `estado_civil` varchar(50) DEFAULT NULL,
  `profesion` varchar(100) DEFAULT NULL,
  `telefono_secundario` varchar(50) DEFAULT NULL,
  `whatsapp` varchar(50) DEFAULT NULL,
  `acepta_comunicaciones` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `receta`
--

CREATE TABLE `receta` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `propietario_id` bigint(20) NOT NULL,
  `veterinario_id` bigint(20) NOT NULL,
  `fecha` datetime NOT NULL,
  `diagnostico` text DEFAULT NULL,
  `indicaciones_generales` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `tipo_receta` varchar(50) DEFAULT NULL,
  `validez_dias` int(11) DEFAULT NULL,
  `numero_receta` varchar(100) DEFAULT NULL,
  `firma_digital` longblob DEFAULT NULL,
  `hash_documento` varchar(255) DEFAULT NULL,
  `es_receta_controlada` tinyint(1) NOT NULL DEFAULT 0,
  `estado` varchar(50) DEFAULT 'Activa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `receta_antibiotico`
--

CREATE TABLE `receta_antibiotico` (
  `id` bigint(20) NOT NULL,
  `receta_id` bigint(20) NOT NULL,
  `antibiotico_id` int(11) NOT NULL,
  `dosis` varchar(100) DEFAULT NULL,
  `frecuencia` varchar(100) DEFAULT NULL,
  `duracion` varchar(100) DEFAULT NULL,
  `via_administracion` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registro_comision`
--

CREATE TABLE `registro_comision` (
  `id` bigint(20) NOT NULL,
  `veterinario_id` bigint(20) NOT NULL,
  `fecha` date NOT NULL,
  `monto_bruto` decimal(10,2) NOT NULL DEFAULT 0.00,
  `porcentaje` decimal(5,2) NOT NULL DEFAULT 0.00,
  `monto_comision` decimal(10,2) NOT NULL DEFAULT 0.00,
  `detalle` text DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'Pendiente',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `mes` int(11) DEFAULT NULL,
  `anio` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `tipo_comision` varchar(50) DEFAULT NULL,
  `origen` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `id` bigint(20) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tipo` varchar(50) DEFAULT NULL,
  `duracion_minutos` int(11) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `requiere_cita` tinyint(1) NOT NULL DEFAULT 1,
  `es_urgencia` tinyint(1) NOT NULL DEFAULT 0,
  `categoria` varchar(100) DEFAULT NULL,
  `subcategoria` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `stock_historial`
--

CREATE TABLE `stock_historial` (
  `id` bigint(20) NOT NULL,
  `tipo_item` varchar(50) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `tipo_movimiento` varchar(50) NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `fecha_movimiento` datetime NOT NULL DEFAULT current_timestamp(),
  `usuario_id` bigint(20) DEFAULT NULL,
  `stock_anterior` int(11) DEFAULT NULL,
  `stock_nuevo` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `origen` varchar(50) DEFAULT NULL,
  `referencia_id` bigint(20) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `triaje`
--

CREATE TABLE `triaje` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `propietario_id` bigint(20) NOT NULL,
  `veterinario_id` bigint(20) DEFAULT NULL,
  `fecha` datetime NOT NULL,
  `motivo_consulta` text DEFAULT NULL,
  `signos_vitales` json DEFAULT NULL,
  `nivel_prioridad` varchar(50) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'En espera',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `tipo_triaje` varchar(50) DEFAULT NULL,
  `origen` varchar(50) DEFAULT NULL,
  `cita_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `id` bigint(20) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vacuna`
--

CREATE TABLE `vacuna` (
  `id` bigint(20) NOT NULL,
  `mascota_id` bigint(20) NOT NULL,
  `veterinario_id` bigint(20) NOT NULL,
  `fecha` datetime NOT NULL,
  `tipo_vacuna` varchar(150) NOT NULL,
  `lote` varchar(100) DEFAULT NULL,
  `laboratorio` varchar(150) DEFAULT NULL,
  `proxima_dosis` datetime DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `via_administracion` varchar(50) DEFAULT NULL,
  `sitio_aplicacion` varchar(100) DEFAULT NULL,
  `reacciones` text DEFAULT NULL,
  `tarjeta_vacuna_emitida` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `veterinario`
--

CREATE TABLE `veterinario` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `nombre` varchar(150) NOT NULL,
  `rut` varchar(12) DEFAULT NULL,
  `especialidad` varchar(150) DEFAULT NULL,
  `registro_profesional` varchar(100) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `firma_mime` varchar(100) DEFAULT NULL,
  `firma_blob` longblob DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `antiparasitario`
--
ALTER TABLE `antiparasitario`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cirugia`
--
ALTER TABLE `cirugia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `propietario_id` (`propietario_id`),
  ADD KEY `veterinario_id` (`veterinario_id`);

--
-- Indices de la tabla `cirugia_detalle`
--
ALTER TABLE `cirugia_detalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cirugia_id` (`cirugia_id`);

--
-- Indices de la tabla `cirugia_recuperacion`
--
ALTER TABLE `cirugia_recuperacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cirugia_id` (`cirugia_id`);

--
-- Indices de la tabla `cita`
--
ALTER TABLE `cita`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `propietario_id` (`propietario_id`),
  ADD KEY `veterinario_id` (`veterinario_id`),
  ADD KEY `hospitalizacion_id` (`hospitalizacion_id`);

--
-- Indices de la tabla `comisiones`
--
ALTER TABLE `comisiones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `veterinario_id` (`veterinario_id`);

--
-- Indices de la tabla `configuracion_clinica`
--
ALTER TABLE `configuracion_clinica`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `consultas`
--
ALTER TABLE `consultas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `propietario_id` (`propietario_id`),
  ADD KEY `veterinario_id` (`veterinario_id`),
  ADD KEY `consulta_id` (`consulta_id`),
  ADD KEY `hospitalizacion_id` (`hospitalizacion_id`);

--
-- Indices de la tabla `consultas_archivos`
--
ALTER TABLE `consultas_archivos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `consulta_id` (`consulta_id`);

--
-- Indices de la tabla `consultas_tratamientos`
--
ALTER TABLE `consultas_tratamientos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `consulta_id` (`consulta_id`);

--
-- Indices de la tabla `examenes`
--
ALTER TABLE `examenes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `propietario_id` (`propietario_id`),
  ADD KEY `veterinario_id` (`veterinario_id`),
  ADD KEY `consulta_id` (`consulta_id`);

--
-- Indices de la tabla `examenes_tipo`
--
ALTER TABLE `examenes_tipo`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `ficha_medica`
--
ALTER TABLE `ficha_medica`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `propietario_id` (`propietario_id`);

--
-- Indices de la tabla `ficha_medica_historial`
--
ALTER TABLE `ficha_medica_historial`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ficha_medica_id` (`ficha_medica_id`),
  ADD KEY `veterinario_id` (`veterinario_id`);

--
-- Indices de la tabla `hospitalizacion`
--
ALTER TABLE `hospitalizacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `propietario_id` (`propietario_id`),
  ADD KEY `veterinario_id` (`veterinario_id`);

--
-- Indices de la tabla `hospitalizacion_evolucion`
--
ALTER TABLE `hospitalizacion_evolucion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hospitalizacion_id` (`hospitalizacion_id`),
  ADD KEY `veterinario_id` (`veterinario_id`);

--
-- Indices de la tabla `hospitalizacion_files`
--
ALTER TABLE `hospitalizacion_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hospitalizacion_id` (`hospitalizacion_id`);

--
-- Indices de la tabla `notas`
--
ALTER TABLE `notas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `propietario`
--
ALTER TABLE `propietario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rut` (`rut`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `receta`
--
ALTER TABLE `receta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `propietario_id` (`propietario_id`),
  ADD KEY `veterinario_id` (`veterinario_id`);

--
-- Indices de la tabla `receta_antibiotico`
--
ALTER TABLE `receta_antibiotico`
  ADD PRIMARY KEY (`id`),
  ADD KEY `receta_id` (`receta_id`),
  ADD KEY `antibiotico_id` (`antibiotico_id`);

--
-- Indices de la tabla `registro_comision`
--
ALTER TABLE `registro_comision`
  ADD PRIMARY KEY (`id`),
  ADD KEY `veterinario_id` (`veterinario_id`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `stock_historial`
--
ALTER TABLE `stock_historial`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `triaje`
--
ALTER TABLE `triaje`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `propietario_id` (`propietario_id`),
  ADD KEY `veterinario_id` (`veterinario_id`),
  ADD KEY `cita_id` (`cita_id`);

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
  ADD KEY `mascota_id` (`mascota_id`),
  ADD KEY `veterinario_id` (`veterinario_id`);

--
-- Indices de la tabla `veterinario`
--
ALTER TABLE `veterinario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rut` (`rut`),
  ADD KEY `user_id` (`user_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cirugia`
--
ALTER TABLE `cirugia`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cirugia_detalle`
--
ALTER TABLE `cirugia_detalle`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cirugia_recuperacion`
--
ALTER TABLE `cirugia_recuperacion`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cita`
--
ALTER TABLE `cita`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `comisiones`
--
ALTER TABLE `comisiones`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `configuracion_clinica`
--
ALTER TABLE `configuracion_clinica`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `consultas`
--
ALTER TABLE `consultas`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `consultas_archivos`
--
ALTER TABLE `consultas_archivos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `consultas_tratamientos`
--
ALTER TABLE `consultas_tratamientos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `examenes`
--
ALTER TABLE `examenes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `examenes_tipo`
--
ALTER TABLE `examenes_tipo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ficha_medica`
--
ALTER TABLE `ficha_medica`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ficha_medica_historial`
--
ALTER TABLE `ficha_medica_historial`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `hospitalizacion`
--
ALTER TABLE `hospitalizacion`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `hospitalizacion_evolucion`
--
ALTER TABLE `hospitalizacion_evolucion`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `hospitalizacion_files`
--
ALTER TABLE `hospitalizacion_files`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notas`
--
ALTER TABLE `notas`
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
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `stock_historial`
--
ALTER TABLE `stock_historial`
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
-- Filtros para la tabla `cirugia`
--
ALTER TABLE `cirugia`
  ADD CONSTRAINT `cirugia_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `cirugia_ibfk_2` FOREIGN KEY (`propietario_id`) REFERENCES `propietario` (`id`),
  ADD CONSTRAINT `cirugia_ibfk_3` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `cirugia_detalle`
--
ALTER TABLE `cirugia_detalle`
  ADD CONSTRAINT `cirugia_detalle_ibfk_1` FOREIGN KEY (`cirugia_id`) REFERENCES `cirugia` (`id`);

--
-- Filtros para la tabla `cirugia_recuperacion`
--
ALTER TABLE `cirugia_recuperacion`
  ADD CONSTRAINT `cirugia_recuperacion_ibfk_1` FOREIGN KEY (`cirugia_id`) REFERENCES `cirugia` (`id`);

--
-- Filtros para la tabla `cita`
--
ALTER TABLE `cita`
  ADD CONSTRAINT `cita_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `cita_ibfk_2` FOREIGN KEY (`propietario_id`) REFERENCES `propietario` (`id`),
  ADD CONSTRAINT `cita_ibfk_3` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`),
  ADD CONSTRAINT `fk_cita_hosp` FOREIGN KEY (`hospitalizacion_id`) REFERENCES `hospitalizacion` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `comisiones`
--
ALTER TABLE `comisiones`
  ADD CONSTRAINT `comisiones_ibfk_1` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `consultas`
--
ALTER TABLE `consultas`
  ADD CONSTRAINT `consultas_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `consultas_ibfk_2` FOREIGN KEY (`propietario_id`) REFERENCES `propietario` (`id`),
  ADD CONSTRAINT `consultas_ibfk_3` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`),
  ADD CONSTRAINT `fk_consulta_hosp` FOREIGN KEY (`hospitalizacion_id`) REFERENCES `hospitalizacion` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `consultas_archivos`
--
ALTER TABLE `consultas_archivos`
  ADD CONSTRAINT `consultas_archivos_ibfk_1` FOREIGN KEY (`consulta_id`) REFERENCES `consultas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `consultas_tratamientos`
--
ALTER TABLE `consultas_tratamientos`
  ADD CONSTRAINT `consultas_tratamientos_ibfk_1` FOREIGN KEY (`consulta_id`) REFERENCES `consultas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `examenes`
--
ALTER TABLE `examenes`
  ADD CONSTRAINT `examenes_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `examenes_ibfk_2` FOREIGN KEY (`propietario_id`) REFERENCES `propietario` (`id`),
  ADD CONSTRAINT `examenes_ibfk_3` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`),
  ADD CONSTRAINT `examenes_ibfk_4` FOREIGN KEY (`consulta_id`) REFERENCES `consultas` (`id`);

--
-- Filtros para la tabla `ficha_medica`
--
ALTER TABLE `ficha_medica`
  ADD CONSTRAINT `ficha_medica_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `ficha_medica_ibfk_2` FOREIGN KEY (`propietario_id`) REFERENCES `propietario` (`id`);

--
-- Filtros para la tabla `ficha_medica_historial`
--
ALTER TABLE `ficha_medica_historial`
  ADD CONSTRAINT `ficha_medica_historial_ibfk_1` FOREIGN KEY (`ficha_medica_id`) REFERENCES `ficha_medica` (`id`),
  ADD CONSTRAINT `ficha_medica_historial_ibfk_2` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `hospitalizacion`
--
ALTER TABLE `hospitalizacion`
  ADD CONSTRAINT `hospitalizacion_ibfk_1` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`),
  ADD CONSTRAINT `hospitalizacion_ibfk_2` FOREIGN KEY (`propietario_id`) REFERENCES `propietario` (`id`),
  ADD CONSTRAINT `hospitalizacion_ibfk_3` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `hospitalizacion_evolucion`
--
ALTER TABLE `hospitalizacion_evolucion`
  ADD CONSTRAINT `hospitalizacion_evolucion_ibfk_1` FOREIGN KEY (`hospitalizacion_id`) REFERENCES `hospitalizacion` (`id`),
  ADD CONSTRAINT `hospitalizacion_evolucion_ibfk_2` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinario` (`id`);

--
-- Filtros para la tabla `hospitalizacion_files`
--
ALTER TABLE `hospitalizacion_files`
  ADD CONSTRAINT `hospitalizacion_files_ibfk_1` FOREIGN KEY (`hospitalizacion_id`) REFERENCES `hospitalizacion` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `notas`
--
ALTER TABLE `notas`
  ADD CONSTRAINT `notas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `user` (`id`);

--
-- Filtros para la tabla `propietario`
--
ALTER TABLE `propietario`
  ADD CONSTRAINT `propietario_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Filtros para la tabla `receta`
--
ALTER TABLE `receta`
  ADD CONSTRAINT `Receta_mascota_id_fkey` FOREIGN KEY (`mascota_id`) REFERENCES `mascota` (`id`) ON UPDATE CASCADE,
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
