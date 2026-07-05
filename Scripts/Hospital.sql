

/* ============================================================
                GENESIS EMERGENCY SYSTEM (GES)
            Script de Base de Datos - Hospital.sql
   ============================================================ */

-- Creación de la base de datos
If Not Exists (Select name From sys.databases Where name = 'SistemaEmergenciaHospitalaria')
Begin
    Create Database SistemaEmergenciaHospitalaria;
End
Go

Use SistemaEmergenciaHospitalaria;
Go

-- Tabla principal: Paciente
If Object_id('dbo.Paciente', 'U') Is Not Null
    Drop Table dbo.Paciente;
Go

Create Table dbo.Paciente (
    PacienteID          Int Identity(1,1) Primary Key,
    Cedula              Varchar(11)   Not Null Unique,   -- Solo números, sin guiones (ej: 00112345678)
    NombreCompleto      Nvarchar(150) Not Null,
    FechaNacimiento     Date          Null,
    Alergias            Nvarchar(255) Null,

    -- Signos vitales (capturados en el registro de Triage)
    PresionArterial         Varchar(15)   Null,   -- Ej: "120/80"
    FrecuenciaCardiaca      Int           Null,   -- lpm
    SaturacionOxigeno       Int           Null,   -- %
    Temperatura             Decimal(4,1)  Null,   -- °C
    FrecuenciaRespiratoria  Int           Null,   -- rpm

    -- Clasificación de Triage (solo acepta los 5 colores del protocolo estándar)
    NivelTriage         Varchar(20)   Null
        Constraint CK_Paciente_NivelTriage
        Check (NivelTriage In ('Rojo', 'Naranja', 'Amarillo', 'Verde', 'Azul')),

    -- Control de tiempos
    FechaHoraLlegada       Datetime   Not Null Default Getdate(),
    FechaHoraModificacion  Datetime   Null,   -- Se actualiza automáticamente en cada edición (auditoría)
    Estado                 Varchar(20) Not Null Default 'En espera' -- En espera / En atención / Atendido
);
Go

-- Índices para acelerar búsquedas frecuentes (RNF-01: tiempo de respuesta)
Create Index IX_Paciente_NombreCompleto On dbo.Paciente (NombreCompleto);
Go

-- Procedimientos almacenados (CRUD)

-- Insertar / Registrar paciente
Create Or Alter Procedure sp_RegistrarPaciente
    @Cedula Varchar(11),
    @NombreCompleto Nvarchar(150),
    @FechaNacimiento Date = Null,
    @Alergias Nvarchar(255) = Null,
    @PresionArterial Varchar(15) = Null,
    @FrecuenciaCardiaca Int = Null,
    @SaturacionOxigeno Int = Null,
    @Temperatura Decimal(4,1) = Null,
    @FrecuenciaRespiratoria Int = Null,
    @NivelTriage Varchar(20) = Null
As
Begin
    Set Nocount On;
    Insert Into dbo.Paciente
        (Cedula, NombreCompleto, FechaNacimiento, Alergias,
         PresionArterial, FrecuenciaCardiaca, SaturacionOxigeno,
         Temperatura, FrecuenciaRespiratoria, NivelTriage)
    Values
        (@Cedula, @NombreCompleto, @FechaNacimiento, @Alergias,
         @PresionArterial, @FrecuenciaCardiaca, @SaturacionOxigeno,
         @Temperatura, @FrecuenciaRespiratoria, @NivelTriage);

    Select Scope_identity() As NuevoPacienteID;
End
Go

-- Actualizar paciente
Create Or Alter Procedure sp_ActualizarPaciente
    @PacienteID Int,
    @NombreCompleto Nvarchar(150) = Null,
    @FechaNacimiento Date = Null,
    @Alergias Nvarchar(255) = Null,
    @PresionArterial Varchar(15) = Null,
    @FrecuenciaCardiaca Int = Null,
    @SaturacionOxigeno Int = Null,
    @Temperatura Decimal(4,1) = Null,
    @FrecuenciaRespiratoria Int = Null,
    @NivelTriage Varchar(20) = Null,
    @Estado Varchar(20) = Null
As
Begin
    Set Nocount On;
    Update dbo.Paciente
    Set NombreCompleto = Isnull(@NombreCompleto, NombreCompleto),
        FechaNacimiento = Isnull(@FechaNacimiento, FechaNacimiento),
        Alergias = Isnull(@Alergias, Alergias),
        PresionArterial = Isnull(@PresionArterial, PresionArterial),
        FrecuenciaCardiaca = Isnull(@FrecuenciaCardiaca, FrecuenciaCardiaca),
        SaturacionOxigeno = Isnull(@SaturacionOxigeno, SaturacionOxigeno),
        Temperatura = Isnull(@Temperatura, Temperatura),
        FrecuenciaRespiratoria = Isnull(@FrecuenciaRespiratoria, FrecuenciaRespiratoria),
        NivelTriage = Isnull(@NivelTriage, NivelTriage),
        Estado = Isnull(@Estado, Estado),
        FechaHoraModificacion = Getdate()
    Where PacienteID = @PacienteID;
End
Go

-- Eliminar paciente
Create Or Alter Procedure sp_EliminarPaciente
    @PacienteID Int
As
Begin
    Set Nocount On;
    Delete From dbo.Paciente Where PacienteID = @PacienteID;
End
Go

-- Obtener todos los pacientes (ordenados por prioridad de Triage)
Create Or Alter Procedure sp_ObtenerPacientes
As
Begin
    Set Nocount On;
    Select PacienteID, Cedula, NombreCompleto, FechaNacimiento, Alergias,
           PresionArterial, FrecuenciaCardiaca, SaturacionOxigeno,
           Temperatura, FrecuenciaRespiratoria, NivelTriage,
           FechaHoraLlegada, FechaHoraModificacion, Estado
    From dbo.Paciente
    Order By
        Case NivelTriage
            When 'Rojo' Then 1
            When 'Naranja' Then 2
            When 'Amarillo' Then 3
            When 'Verde' Then 4
            When 'Azul' Then 5
            Else 6
        End,
        FechaHoraLlegada Asc;
End
Go

-- Buscar paciente (por cédula o nombre)
Create Or Alter Procedure sp_BuscarPaciente
    @Filtro Nvarchar(150)
As
Begin
    Set Nocount On;
    Select PacienteID, Cedula, NombreCompleto, FechaNacimiento, Alergias,
           PresionArterial, FrecuenciaCardiaca, SaturacionOxigeno,
           Temperatura, FrecuenciaRespiratoria, NivelTriage,
           FechaHoraLlegada, FechaHoraModificacion, Estado
    From dbo.Paciente
    Where Cedula Like '%' + @Filtro + '%'
       Or NombreCompleto Collate Latin1_General_CI_AI Like '%' + @Filtro + '%' Collate Latin1_General_CI_AI;
End
Go

-- Obtener un solo paciente por su ID (para cargar el formulario de edición)
Create Or Alter Procedure sp_ObtenerPacientePorId
    @PacienteID Int
As
Begin
    Set Nocount On;
    Select PacienteID, Cedula, NombreCompleto, FechaNacimiento, Alergias,
           PresionArterial, FrecuenciaCardiaca, SaturacionOxigeno,
           Temperatura, FrecuenciaRespiratoria, NivelTriage,
           FechaHoraLlegada, FechaHoraModificacion, Estado
    From dbo.Paciente
    Where PacienteID = @PacienteID;
End
Go

/* ============================================================
               MÓDULO DE LOGIN (Tabla Usuario)
   ============================================================ */

-- Tabla de Usuarios
If Object_id('dbo.Usuario', 'U') Is Not Null
    Drop Table dbo.Usuario;
Go

Create Table dbo.Usuario (
    UsuarioID       Int Identity(1,1) Primary Key,
    Cedula          Varchar(11)    Not Null Unique,     -- Se usa para iniciar sesión
    NombreCompleto  Nvarchar(150)  Not Null,
    ContrasenaHash  Varbinary(64)  Not Null,             -- Contraseña protegida (hash SHA2_256)
    Rol             Varchar(20)    Not Null
        Constraint CK_Usuario_Rol
        Check (Rol In ('Enfermera', 'Medico', 'Administrador')),
    Activo          Bit            Not Null Default 1,   -- Permite desactivar sin borrar el usuario
    FechaCreacion   Datetime       Not Null Default Getdate(),
    UltimoAcceso    Datetime       Null                   -- Se actualiza en cada login exitoso
);
Go

-- Registrar un nuevo usuario
Create Or Alter Procedure sp_RegistrarUsuario
    @Cedula Varchar(11),
    @NombreCompleto Nvarchar(150),
    @Contrasena Nvarchar(100),   -- Se recibe en texto plano y se hashea aquí mismo
    @Rol Varchar(20)
As
Begin
    Set Nocount On;

    -- Limpiar espacios accidentales
    Set @Cedula = Ltrim(Rtrim(@Cedula));
    Set @NombreCompleto = Ltrim(Rtrim(@NombreCompleto));

    -- Validar que la contraseña tenga un mínimo de 4 caracteres
    If Len(Ltrim(Rtrim(@Contrasena))) < 4
    Begin
        Throw 50001, 'La contraseña debe tener al menos 4 caracteres.', 1;
        Return;
    End

    -- Validar que la cédula no esté ya registrada (mensaje claro en vez de error crudo de SQL)
    If Exists (Select 1 From dbo.Usuario Where Cedula = @Cedula)
    Begin
        Throw 50002, 'Ya existe un usuario registrado con esa cédula.', 1;
        Return;
    End

    Insert Into dbo.Usuario (Cedula, NombreCompleto, ContrasenaHash, Rol)
    Values (@Cedula, @NombreCompleto, HashBytes('SHA2_256', @Contrasena), @Rol);

    Select Scope_identity() As NuevoUsuarioID;
End
Go

-- Validar login (recibe cédula + contraseña en texto plano, compara con el hash guardado)
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
    -- Si @UsuarioID queda Null, no se devuelve ninguna fila: cédula o contraseña incorrectas,
    -- o el usuario está desactivado (Activo = 0)
End
Go

-- Obtener todos los usuarios (para pantalla de administración)
Create Or Alter Procedure sp_ObtenerUsuarios
As
Begin
    Set Nocount On;
    Select UsuarioID, Cedula, NombreCompleto, Rol, Activo, FechaCreacion, UltimoAcceso
    From dbo.Usuario
    Order By NombreCompleto Asc;
End
Go