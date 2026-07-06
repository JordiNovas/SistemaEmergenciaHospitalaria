/* ============================================================
   Datos de prueba (uso local, no forma parte del script oficial)
   ============================================================ */

Use SistemaEmergenciaHospitalaria;
Go

Declare @PacienteID Int, @ConsultaID Int;

-- Paciente: Ana Lucia (Naranja)
Exec sp_RegistrarPaciente
    @Cedula = '00134567890',
    @NombreCompleto = 'Ana Lucía Jiménez Castro',
    @FechaNacimiento = '1991-07-08',
    @TipoSangre = 'B+',
    @Sexo = 'Femenino',
    @TelefonoContacto = '809-555-0103',
    @Alergias = 'Ninguna conocida',
    @NuevoPacienteID = @PacienteID Output;

Exec sp_RegistrarConsulta
    @PacienteID = @PacienteID,
    @ModoLlegada = 'Por pie propio',
    @NivelTriage = 'Naranja',
    @MotivoConsulta = 'Dolor abdominal intenso de 3 horas de evolucion.',
    @Peso = 145.5,
    @Talla = 1.65,
    @NuevaConsultaID = @ConsultaID Output;

-- Paciente: Carlos Mendoza (Rojo)
Exec sp_RegistrarPaciente
    @Cedula = '00112345678',
    @NombreCompleto = 'Carlos Mendoza',
    @FechaNacimiento = '1985-04-12',
    @TipoSangre = 'O+',
    @Sexo = 'Masculino',
    @TelefonoContacto = '809-555-0111',
    @Alergias = 'Ninguna',
    @NuevoPacienteID = @PacienteID Output;

Exec sp_RegistrarConsulta
    @PacienteID = @PacienteID,
    @ModoLlegada = 'Ambulancia',
    @NivelTriage = 'Rojo',
    @MotivoConsulta = 'Dolor toracico y dificultad respiratoria.',
    @PresionArterial = '150/95',
    @FrecuenciaCardiaca = 110,
    @SaturacionOxigeno = 91,
    @Temperatura = 37.2,
    @FrecuenciaRespiratoria = 22,
    @Peso = 180.0,
    @Talla = 1.75,
    @Observaciones = 'Paciente diaforetico, se traslada a resucitacion de inmediato.',
    @NuevaConsultaID = @ConsultaID Output;

-- Paciente: Pedro Ramirez (Azul)
Exec sp_RegistrarPaciente
    @Cedula = '00145678901',
    @NombreCompleto = 'Pedro Ramírez',
    @FechaNacimiento = '2001-06-15',
    @TipoSangre = 'A-',
    @Sexo = 'Masculino',
    @TelefonoContacto = '809-555-0122',
    @Alergias = 'Penicilina',
    @NuevoPacienteID = @PacienteID Output;

Exec sp_RegistrarConsulta
    @PacienteID = @PacienteID,
    @ModoLlegada = 'Por pie propio',
    @NivelTriage = 'Azul',
    @MotivoConsulta = 'Esguince de tobillo leve.',
    @PresionArterial = '110/70',
    @FrecuenciaCardiaca = 68,
    @SaturacionOxigeno = 99,
    @Temperatura = 36.5,
    @FrecuenciaRespiratoria = 14,
    @Peso = 160.0,
    @Talla = 1.78,
    @NuevaConsultaID = @ConsultaID Output;

-- Ver la sala de espera completa (ordenada por prioridad)
Exec sp_ObtenerConsultas;

-- Probar busqueda de paciente (sin tildes, debe encontrar "Jiménez")
Exec sp_BuscarPaciente @Filtro = 'Jimenez';

/* ============================================================
   Pruebas de actualizacion individual (cada campo se actualiza
   solo, sin afectar el resto de los datos ya guardados)
   ============================================================ */

-- Estado antes de actualizar (Consulta de Ana Lucia, ConsultaID = 1)
Exec sp_ObtenerConsultaPorId @ConsultaID = 1;

-- Actualizar SOLO el Estado (el resto de los campos debe permanecer igual)
Exec sp_ActualizarConsulta @ConsultaID = 1, @Estado = 'En atencion';
Exec sp_ObtenerConsultaPorId @ConsultaID = 1;

-- Actualizar SOLO el Nivel de Triage (ej: el paciente empeoro y se reclasifica)
Exec sp_ActualizarConsulta @ConsultaID = 1, @NivelTriage = 'Rojo';
Exec sp_ObtenerConsultaPorId @ConsultaID = 1;

-- Actualizar SOLO el Motivo de Consulta (correccion de texto)
Exec sp_ActualizarConsulta @ConsultaID = 1, @MotivoConsulta = 'Dolor abdominal intenso, ahora con vomitos.';
Exec sp_ObtenerConsultaPorId @ConsultaID = 1;

-- Actualizar SOLO los signos vitales (Presion y Frecuencia Cardiaca), sin tocar Triage/Estado/Motivo
Exec sp_ActualizarConsulta @ConsultaID = 1, @PresionArterial = '140/90', @FrecuenciaCardiaca = 105;
Exec sp_ObtenerConsultaPorId @ConsultaID = 1;

-- Actualizar SOLO el Modo de Llegada
Exec sp_ActualizarConsulta @ConsultaID = 1, @ModoLlegada = 'Ambulancia';
Exec sp_ObtenerConsultaPorId @ConsultaID = 1;

-- Datos personales antes de actualizar (Paciente de Ana Lucia, PacienteID = 1)
Exec sp_ObtenerPacientePorId @PacienteID = 1;

-- Actualizar SOLO el Telefono de Contacto (no debe borrar Alergias, TipoSangre, etc.)
Exec sp_ActualizarPaciente @PacienteID = 1, @TelefonoContacto = '809-555-9999';
Exec sp_ObtenerPacientePorId @PacienteID = 1;

-- Actualizar SOLO las Alergias
Exec sp_ActualizarPaciente @PacienteID = 1, @Alergias = 'Penicilina, Latex';
Exec sp_ObtenerPacientePorId @PacienteID = 1;

-- Actualizar SOLO el Nombre Completo (ej: correccion de un error de tipeo)
Exec sp_ActualizarPaciente @PacienteID = 1, @NombreCompleto = 'Ana Lucía Jiménez C.';
Exec sp_ObtenerPacientePorId @PacienteID = 1;

/* ============================================================
   Usuarios de prueba (para el login)
   ============================================================ */

Declare @UsuarioID Int;

Exec sp_RegistrarUsuario
    @Cedula = '00100000001', @NombreCompleto = 'Laura Martinez',
    @Contrasena = '1234', @Rol = 'Enfermera', @NuevoUsuarioID = @UsuarioID Output;

Exec sp_RegistrarUsuario
    @Cedula = '00100000002', @NombreCompleto = 'Dr. Alan Bertrand',
    @Contrasena = '1234', @Rol = 'Medico', @NuevoUsuarioID = @UsuarioID Output;

Exec sp_RegistrarUsuario
    @Cedula = '00100000003', @NombreCompleto = 'Admin Sistema',
    @Contrasena = '1234', @Rol = 'Administrador', @NuevoUsuarioID = @UsuarioID Output;

Exec sp_ValidarLogin @Cedula = '00100000001', @Contrasena = '1234';
Exec sp_ObtenerUsuarios;

/* ============================================================
   Pruebas de validaciones del login
   ============================================================ */

-- Login con contrasena incorrecta (NO debe devolver ninguna fila)
Exec sp_ValidarLogin @Cedula = '00100000001', @Contrasena = 'incorrecta';

-- Login con cedula que no existe (NO debe devolver ninguna fila)
Exec sp_ValidarLogin @Cedula = '00199999999', @Contrasena = '1234';

-- Registrar usuario con cedula duplicada (DEBE fallar con mensaje claro)
-- Exec sp_RegistrarUsuario @Cedula = '00100000001', @NombreCompleto = 'Duplicado', @Contrasena = '1234', @Rol = 'Medico', @NuevoUsuarioID = @UsuarioID Output;

-- Registrar usuario con contrasena muy corta (DEBE fallar con mensaje claro)
-- Exec sp_RegistrarUsuario @Cedula = '00100000009', @NombreCompleto = 'Prueba Corta', @Contrasena = '12', @Rol = 'Medico', @NuevoUsuarioID = @UsuarioID Output;

-- Desactivar un usuario (Administrador desactiva a Laura Martinez)
Exec sp_ActualizarUsuario @UsuarioID = 1, @Activo = 0;

-- Intentar iniciar sesion con un usuario desactivado (NO debe devolver ninguna fila)
Exec sp_ValidarLogin @Cedula = '00100000001', @Contrasena = '1234';

-- Reactivar el usuario para dejarlo disponible de nuevo
Exec sp_ActualizarUsuario @UsuarioID = 1, @Activo = 1;

-- Cambiar la contrasena de un usuario
Exec sp_CambiarContrasenaUsuario @UsuarioID = 1, @NuevaContrasena = '5678';

-- Confirmar que la contrasena vieja YA NO funciona
Exec sp_ValidarLogin @Cedula = '00100000001', @Contrasena = '1234';

-- Confirmar que la contrasena nueva SI funciona
Exec sp_ValidarLogin @Cedula = '00100000001', @Contrasena = '5678';

/* ============================================================
   Pruebas de eliminacion (Paciente y Usuario)
   ============================================================ */

-- Ver la sala de espera ANTES de eliminar (deben aparecer los 3 pacientes)
Exec sp_ObtenerConsultas;

-- Eliminar al paciente Pedro Ramirez (PacienteID = 3)
-- Gracias al On Delete Cascade, su Consulta se elimina automaticamente tambien
Exec sp_EliminarPaciente @PacienteID = 3;

-- Ver la sala de espera DESPUES de eliminar (ya no debe aparecer Pedro Ramirez)
Exec sp_ObtenerConsultas;

-- Confirmar que tambien desaparecio de la tabla Paciente
Exec sp_BuscarPaciente @Filtro = 'Ramirez';

-- Ver los usuarios ANTES de eliminar
Exec sp_ObtenerUsuarios;

-- Eliminar al usuario Administrador de prueba (UsuarioID = 3)
Exec sp_EliminarUsuario @UsuarioID = 3;

-- Ver los usuarios DESPUES de eliminar (ya no debe aparecer "Admin Sistema")
Exec sp_ObtenerUsuarios;