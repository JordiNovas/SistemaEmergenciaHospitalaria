/* ============================================================
   Sistema de Emergencia Hospitalaria - Script de Base de Datos
   ============================================================ */

-- Creacion de la base de datos
If Not Exists (Select name From sys.databases Where name = 'SistemaEmergenciaHospitalaria')
Begin
    Create Database SistemaEmergenciaHospitalaria;
End
Go

Use SistemaEmergenciaHospitalaria;
Go

/* ============================================================
   Tabla Paciente (Datos personales - se registra una sola vez)
   ============================================================ */
If Object_id('dbo.Consulta', 'U') Is Not Null
    Drop Table dbo.Consulta;
Go
If Object_id('dbo.Paciente', 'U') Is Not Null
    Drop Table dbo.Paciente;
Go

Create Table dbo.Paciente (
    PacienteID          Int Identity(1,1) Primary Key,
    Cedula              Varchar(11)    Not Null Unique,   -- Solo numeros, sin guiones
    NombreCompleto      Nvarchar(150)  Not Null,
    FechaNacimiento     Date           Not Null,
    TipoSangre          Varchar(3)     Null
        Constraint CK_Paciente_TipoSangre
        Check (TipoSangre In ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
    Sexo                Varchar(10)    Null
        Constraint CK_Paciente_Sexo
        Check (Sexo In ('Masculino', 'Femenino')),
    TelefonoContacto    Varchar(15)    Null,
    Alergias            Nvarchar(255)  Null,   -- Dato persistente
    Peso                Decimal(5,1)   Null
        Constraint CK_Paciente_Peso
        Check (Peso Between 1 And 800),        -- libras
    Altura              Decimal(4,2)   Null
        Constraint CK_Paciente_Altura
        Check (Altura Between 0.50 And 2.80),  -- metros
    FechaRegistro       Datetime       Not Null Default Getdate()
);
Go

Create Index IX_Paciente_NombreCompleto On dbo.Paciente (NombreCompleto);
Go

/* ============================================================
   Tabla Consulta (Entrada clinica / Triage - una fila por visita)
   ============================================================ */
Create Table dbo.Consulta (
    ConsultaID          Int Identity(1,1) Primary Key,
    PacienteID          Int            Not Null
        Constraint FK_Consulta_Paciente References dbo.Paciente(PacienteID)
        On Delete Cascade,

    FechaHoraLlegada    Datetime       Not Null Default Getdate(),
    ModoLlegada         Varchar(30)    Null
        Constraint CK_Consulta_ModoLlegada
        Check (ModoLlegada In ('Por pie propio', 'Ambulancia', 'Traido por otros', 'Otro')),
    NivelTriage         Varchar(20)    Null
        Constraint CK_Consulta_NivelTriage
        Check (NivelTriage In ('Rojo', 'Naranja', 'Amarillo', 'Verde', 'Azul')),
    MotivoConsulta      Nvarchar(1000) Null,

    PresionArterial         Varchar(15)   Null
        Constraint CK_Consulta_PresionArterial
        Check (PresionArterial Like '[0-9][0-9][0-9]/[0-9][0-9]' Or PresionArterial Like '[0-9][0-9]/[0-9][0-9]'),
    FrecuenciaCardiaca      Int           Null
        Constraint CK_Consulta_FrecuenciaCardiaca
        Check (FrecuenciaCardiaca Between 20 And 250),
    SaturacionOxigeno       Int           Null
        Constraint CK_Consulta_SaturacionOxigeno
        Check (SaturacionOxigeno Between 0 And 100),
    Temperatura             Decimal(4,1)  Null
        Constraint CK_Consulta_Temperatura
        Check (Temperatura Between 25.0 And 45.0),
    FrecuenciaRespiratoria  Int           Null
        Constraint CK_Consulta_FrecuenciaRespiratoria
        Check (FrecuenciaRespiratoria Between 5 And 80),

    Estado                  Varchar(20)   Not Null Default 'En espera',
    FechaHoraModificacion   Datetime      Null
);
Go

Create Index IX_Consulta_PacienteID On dbo.Consulta (PacienteID);
Go

/* ============================================================
   Procedimientos: Paciente (datos personales)
   ============================================================ */

-- Registrar paciente
Create Or Alter Procedure sp_RegistrarPaciente
    @Cedula Varchar(11),
    @NombreCompleto Nvarchar(150),
    @FechaNacimiento Date,
    @TipoSangre Varchar(3) = Null,
    @Sexo Varchar(10) = Null,
    @TelefonoContacto Varchar(15) = Null,
    @Alergias Nvarchar(255) = Null,
    @Peso Decimal(5,1) = Null,      -- libras
    @Altura Decimal(4,2) = Null,    -- metros
    @NuevoPacienteID Int Output
As
Begin
    Set Nocount On;
    Set @Cedula = Ltrim(Rtrim(@Cedula));

    If Exists (Select 1 From dbo.Paciente Where Cedula = @Cedula)
    Begin
        Throw 50003, 'Ya existe un paciente registrado con esa cedula.', 1;
        Return;
    End

    Insert Into dbo.Paciente (Cedula, NombreCompleto, FechaNacimiento, TipoSangre, Sexo, TelefonoContacto, Alergias, Peso, Altura)
    Values (@Cedula, @NombreCompleto, @FechaNacimiento, @TipoSangre, @Sexo, @TelefonoContacto, @Alergias, @Peso, @Altura);

    Set @NuevoPacienteID = Scope_identity();
End
Go

-- Actualizar datos personales (cada campo se actualiza solo si se pasa un valor no NULL)
Create Or Alter Procedure sp_ActualizarPaciente
    @PacienteID Int,
    @NombreCompleto Nvarchar(150) = Null,
    @FechaNacimiento Date = Null,
    @TipoSangre Varchar(3) = Null,
    @Sexo Varchar(10) = Null,
    @TelefonoContacto Varchar(15) = Null,
    @Alergias Nvarchar(255) = Null,
    @Peso Decimal(5,1) = Null,
    @Altura Decimal(4,2) = Null
As
Begin
    Set Nocount On;
    Update dbo.Paciente
    Set NombreCompleto = Isnull(@NombreCompleto, NombreCompleto),
        FechaNacimiento = Isnull(@FechaNacimiento, FechaNacimiento),
        TipoSangre = Isnull(@TipoSangre, TipoSangre),
        Sexo = Isnull(@Sexo, Sexo),
        TelefonoContacto = Isnull(@TelefonoContacto, TelefonoContacto),
        Alergias = Isnull(@Alergias, Alergias),
        Peso = Isnull(@Peso, Peso),
        Altura = Isnull(@Altura, Altura)
    Where PacienteID = @PacienteID;
End
Go

-- Eliminar paciente (elimina tambien sus consultas por el On Delete Cascade)
Create Or Alter Procedure sp_EliminarPaciente
    @PacienteID Int
As
Begin
    Set Nocount On;
    Delete From dbo.Paciente Where PacienteID = @PacienteID;
End
Go

-- Obtener un paciente por su ID (incluye Peso y Altura)
Create Or Alter Procedure sp_ObtenerPacientePorId
    @PacienteID Int
As
Begin
    Set Nocount On;
    Select PacienteID, Cedula, NombreCompleto, FechaNacimiento, TipoSangre, Sexo, TelefonoContacto, Alergias,
           Peso, Altura, FechaRegistro
    From dbo.Paciente
    Where PacienteID = @PacienteID;
End
Go

-- Buscar paciente (por cedula o nombre, sin importar tildes) incluye Peso y Altura
Create Or Alter Procedure sp_BuscarPaciente
    @Filtro Nvarchar(150)
As
Begin
    Set Nocount On;
    Select PacienteID, Cedula, NombreCompleto, FechaNacimiento, TipoSangre, Sexo, TelefonoContacto, Alergias,
           Peso, Altura, FechaRegistro
    From dbo.Paciente
    Where Cedula Like '%' + @Filtro + '%'
       Or NombreCompleto Collate Latin1_General_CI_AI Like '%' + @Filtro + '%' Collate Latin1_General_CI_AI;
End
Go

/* ============================================================
   Procedimientos: Consulta (entrada clinica / triage / atencion)
   ============================================================ */

-- Registrar una nueva consulta para un paciente ya existente
Create Or Alter Procedure sp_RegistrarConsulta
    @PacienteID Int,
    @ModoLlegada Varchar(30) = Null,
    @NivelTriage Varchar(20) = Null,
    @MotivoConsulta Nvarchar(1000) = Null,
    @PresionArterial Varchar(15) = Null,
    @FrecuenciaCardiaca Int = Null,
    @SaturacionOxigeno Int = Null,
    @Temperatura Decimal(4,1) = Null,
    @FrecuenciaRespiratoria Int = Null,
    @NuevaConsultaID Int Output
As
Begin
    Set Nocount On;

    If Not Exists (Select 1 From dbo.Paciente Where PacienteID = @PacienteID)
    Begin
        Throw 50004, 'El paciente indicado no existe. Registrelo primero.', 1;
        Return;
    End

    Insert Into dbo.Consulta
        (PacienteID, ModoLlegada, NivelTriage, MotivoConsulta,
         PresionArterial, FrecuenciaCardiaca, SaturacionOxigeno, Temperatura, FrecuenciaRespiratoria)
    Values
        (@PacienteID, @ModoLlegada, @NivelTriage, @MotivoConsulta,
         @PresionArterial, @FrecuenciaCardiaca, @SaturacionOxigeno, @Temperatura, @FrecuenciaRespiratoria);

    Set @NuevaConsultaID = Scope_identity();
End
Go

-- Actualizar una consulta (signos vitales, triage, estado, etc.)
Create Or Alter Procedure sp_ActualizarConsulta
    @ConsultaID Int,
    @ModoLlegada Varchar(30) = Null,
    @NivelTriage Varchar(20) = Null,
    @MotivoConsulta Nvarchar(1000) = Null,
    @PresionArterial Varchar(15) = Null,
    @FrecuenciaCardiaca Int = Null,
    @SaturacionOxigeno Int = Null,
    @Temperatura Decimal(4,1) = Null,
    @FrecuenciaRespiratoria Int = Null,
    @Estado Varchar(20) = Null
As
Begin
    Set Nocount On;
    Update dbo.Consulta
    Set ModoLlegada = Isnull(@ModoLlegada, ModoLlegada),
        NivelTriage = Isnull(@NivelTriage, NivelTriage),
        MotivoConsulta = Isnull(@MotivoConsulta, MotivoConsulta),
        PresionArterial = Isnull(@PresionArterial, PresionArterial),
        FrecuenciaCardiaca = Isnull(@FrecuenciaCardiaca, FrecuenciaCardiaca),
        SaturacionOxigeno = Isnull(@SaturacionOxigeno, SaturacionOxigeno),
        Temperatura = Isnull(@Temperatura, Temperatura),
        FrecuenciaRespiratoria = Isnull(@FrecuenciaRespiratoria, FrecuenciaRespiratoria),
        Estado = Isnull(@Estado, Estado),
        FechaHoraModificacion = Getdate()
    Where ConsultaID = @ConsultaID;
End
Go

-- Eliminar una consulta
Create Or Alter Procedure sp_EliminarConsulta
    @ConsultaID Int
As
Begin
    Set Nocount On;
    Delete From dbo.Consulta Where ConsultaID = @ConsultaID;
End
Go

-- Obtener todas las consultas (sala de espera), con datos del paciente incluidos,
-- ordenadas por prioridad de Triage (incluye Peso y Altura)
Create Or Alter Procedure sp_ObtenerConsultas
As
Begin
    Set Nocount On;
    Select c.ConsultaID, c.PacienteID, p.Cedula, p.NombreCompleto, p.FechaNacimiento,
           p.TipoSangre, p.Sexo, p.TelefonoContacto, p.Alergias,
           p.Peso, p.Altura,
           c.FechaHoraLlegada, c.ModoLlegada, c.NivelTriage, c.MotivoConsulta,
           c.PresionArterial, c.FrecuenciaCardiaca, c.SaturacionOxigeno, c.Temperatura, c.FrecuenciaRespiratoria,
           c.Estado, c.FechaHoraModificacion
    From dbo.Consulta c
    Inner Join dbo.Paciente p On p.PacienteID = c.PacienteID
    Order By
        Case c.NivelTriage
            When 'Rojo' Then 1
            When 'Naranja' Then 2
            When 'Amarillo' Then 3
            When 'Verde' Then 4
            When 'Azul' Then 5
            Else 6
        End,
        c.FechaHoraLlegada Asc;
End
Go

-- Obtener una consulta por su ID (para pantalla de edicion/atencion) incluye Peso y Altura
Create Or Alter Procedure sp_ObtenerConsultaPorId
    @ConsultaID Int
As
Begin
    Set Nocount On;
    Select c.ConsultaID, c.PacienteID, p.Cedula, p.NombreCompleto, p.FechaNacimiento,
           p.TipoSangre, p.Sexo, p.TelefonoContacto, p.Alergias,
           p.Peso, p.Altura,
           c.FechaHoraLlegada, c.ModoLlegada, c.NivelTriage, c.MotivoConsulta,
           c.PresionArterial, c.FrecuenciaCardiaca, c.SaturacionOxigeno, c.Temperatura, c.FrecuenciaRespiratoria,
           c.Estado, c.FechaHoraModificacion
    From dbo.Consulta c
    Inner Join dbo.Paciente p On p.PacienteID = c.PacienteID
    Where c.ConsultaID = @ConsultaID;
End
Go

/* ============================================================
   Modulo de Login (Tabla Usuario)
   ============================================================ */

If Object_id('dbo.Usuario', 'U') Is Not Null
    Drop Table dbo.Usuario;
Go

Create Table dbo.Usuario (
    UsuarioID       Int Identity(1,1) Primary Key,
    Cedula          Varchar(11)    Not Null Unique,
    NombreCompleto  Nvarchar(150)  Not Null,
    ContrasenaHash  Varbinary(64)  Not Null,
    Rol             Varchar(20)    Not Null
        Constraint CK_Usuario_Rol
        Check (Rol In ('Enfermera', 'Medico', 'Administrador')),
    Activo          Bit            Not Null Default 1,
    FechaCreacion   Datetime       Not Null Default Getdate(),
    UltimoAcceso    Datetime       Null
);
Go

Create Or Alter Procedure sp_RegistrarUsuario
    @Cedula Varchar(11),
    @NombreCompleto Nvarchar(150),
    @Contrasena Nvarchar(100),
    @Rol Varchar(20),
    @NuevoUsuarioID Int Output
As
Begin
    Set Nocount On;
    Set @Cedula = Ltrim(Rtrim(@Cedula));
    Set @NombreCompleto = Ltrim(Rtrim(@NombreCompleto));

    If Len(Ltrim(Rtrim(@Contrasena))) < 4
    Begin
        Throw 50001, 'La contrasena debe tener al menos 4 caracteres.', 1;
        Return;
    End

    If Exists (Select 1 From dbo.Usuario Where Cedula = @Cedula)
    Begin
        Throw 50002, 'Ya existe un usuario registrado con esa cedula.', 1;
        Return;
    End

    Insert Into dbo.Usuario (Cedula, NombreCompleto, ContrasenaHash, Rol)
    Values (@Cedula, @NombreCompleto, HashBytes('SHA2_256', @Contrasena), @Rol);

    Set @NuevoUsuarioID = Scope_identity();
End
Go

Create Or Alter Procedure sp_ValidarLogin
    @Cedula Varchar(11),
    @Contrasena Nvarchar(100)
As
Begin
    Set Nocount On;
    Set @Cedula = Ltrim(Rtrim(@Cedula));

    Declare @UsuarioID Int;

    Select @UsuarioID = UsuarioID
    From dbo.Usuario
    Where Cedula = @Cedula
      And ContrasenaHash = HashBytes('SHA2_256', @Contrasena)
      And Activo = 1;

    If @UsuarioID Is Not Null
    Begin
        Update dbo.Usuario Set UltimoAcceso = Getdate() Where UsuarioID = @UsuarioID;

        Select UsuarioID, Cedula, NombreCompleto, Rol, UltimoAcceso
        From dbo.Usuario
        Where UsuarioID = @UsuarioID;
    End
End
Go

Create Or Alter Procedure sp_ObtenerUsuarios
As
Begin
    Set Nocount On;
    Select UsuarioID, Cedula, NombreCompleto, Rol, Activo, FechaCreacion, UltimoAcceso
    From dbo.Usuario
    Order By NombreCompleto Asc;
End
Go

Create Or Alter Procedure sp_ActualizarUsuario
    @UsuarioID Int,
    @NombreCompleto Nvarchar(150) = Null,
    @Rol Varchar(20) = Null,
    @Activo Bit = Null
As
Begin
    Set Nocount On;
    Update dbo.Usuario
    Set NombreCompleto = Isnull(@NombreCompleto, NombreCompleto),
        Rol = Isnull(@Rol, Rol),
        Activo = Isnull(@Activo, Activo)
    Where UsuarioID = @UsuarioID;
End
Go

Create Or Alter Procedure sp_CambiarContrasenaUsuario
    @UsuarioID Int,
    @NuevaContrasena Nvarchar(100)
As
Begin
    Set Nocount On;

    If Len(Ltrim(Rtrim(@NuevaContrasena))) < 4
    Begin
        Throw 50005, 'La contrasena debe tener al menos 4 caracteres.', 1;
        Return;
    End

    Update dbo.Usuario
    Set ContrasenaHash = HashBytes('SHA2_256', @NuevaContrasena)
    Where UsuarioID = @UsuarioID;
End
Go

Create Or Alter Procedure sp_EliminarUsuario
    @UsuarioID Int
As
Begin
    Set Nocount On;
    Delete From dbo.Usuario Where UsuarioID = @UsuarioID;
End
Go