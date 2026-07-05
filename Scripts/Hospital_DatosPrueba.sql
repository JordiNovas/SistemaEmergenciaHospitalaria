

/* ============================================================
                GENESIS EMERGENCY SYSTEM (GES)
      Script de Datos de Prueba - Hospital_DatosPrueba.sql
                [Datos para realizar pruebas]
   ============================================================ */

Use SistemaEmergenciaHospitalaria;
Go

--prueba de inserción de pacientes con diferentes niveles de Triage

-- Paciente crítico (Rojo)
Exec sp_RegistrarPaciente
    @Cedula = '00112345678',
    @NombreCompleto = 'Carlos Mendoza',
    @FechaNacimiento = '1985-04-12',
    @Alergias = 'Ninguna',
    @PresionArterial = '150/95',
    @FrecuenciaCardiaca = 110,
    @SaturacionOxigeno = 91,
    @Temperatura = 37.2,
    @FrecuenciaRespiratoria = 22,
    @NivelTriage = 'Rojo';

-- Paciente muy urgente (Naranja)
Exec sp_RegistrarPaciente
    @Cedula = '00123456789',
    @NombreCompleto = 'Juan Pérez',
    @FechaNacimiento = '1990-01-20',
    @Alergias = 'Ibuprofeno',
    @PresionArterial = '120/80',
    @FrecuenciaCardiaca = 85,
    @SaturacionOxigeno = 97,
    @Temperatura = 39.4,
    @FrecuenciaRespiratoria = 20,
    @NivelTriage = 'Naranja';

-- Paciente urgente (Amarillo)
Exec sp_RegistrarPaciente
    @Cedula = '00134567890',
    @NombreCompleto = 'María Santos',
    @FechaNacimiento = '1978-11-05',
    @Alergias = 'Ninguna',
    @PresionArterial = '130/85',
    @FrecuenciaCardiaca = 95,
    @SaturacionOxigeno = 95,
    @Temperatura = 38.1,
    @FrecuenciaRespiratoria = 19,
    @NivelTriage = 'Amarillo';

-- Paciente menor urgencia (Verde)
Exec sp_RegistrarPaciente
    @Cedula = '00198765432',
    @NombreCompleto = 'Ana Gómez',
    @FechaNacimiento = '1998-09-30',
    @Alergias = 'Penicilina',
    @PresionArterial = '115/75',
    @FrecuenciaCardiaca = 72,
    @SaturacionOxigeno = 99,
    @Temperatura = 36.6,
    @FrecuenciaRespiratoria = 16,
    @NivelTriage = 'Verde';

-- Paciente no urgente (Azul)
Exec sp_RegistrarPaciente
    @Cedula = '00145678901',
    @NombreCompleto = 'Pedro Ramírez',
    @FechaNacimiento = '2001-06-15',
    @Alergias = 'Ninguna',
    @PresionArterial = '110/70',
    @FrecuenciaCardiaca = 68,
    @SaturacionOxigeno = 99,
    @Temperatura = 36.5,
    @FrecuenciaRespiratoria = 14,
    @NivelTriage = 'Azul';

-- Ver todos los pacientes registrados (ordenados por prioridad de Triage)
Exec sp_ObtenerPacientes;

-- Probar búsqueda por nombre
Exec sp_BuscarPaciente @Filtro = 'Pedro';

-- Probar búsqueda por cédula
Exec sp_BuscarPaciente @Filtro = '00123456789';

-- Probar obtener paciente por ID
Exec sp_ObtenerPacientePorId @PacienteID = 1;

-- Probar actualización de cliente (Unicamente el nivel de Triage)
Exec sp_ActualizarPaciente @PacienteID = 2, @NivelTriage = 'Rojo';

-- Probar actualización de cliente (Unicamente el Estado)
Exec sp_ActualizarPaciente @PacienteID = 3, @Estado = 'Atendido';

-- Probar actualización
Exec sp_ActualizarPaciente
    @PacienteID = 1,
    @NombreCompleto = 'Carlos Mendoza Pérez',
    @NivelTriage = 'Naranja',
    @Estado = 'En atención';

-- Probar eliminación
-- Exec sp_EliminarPaciente @PacienteID = 5;