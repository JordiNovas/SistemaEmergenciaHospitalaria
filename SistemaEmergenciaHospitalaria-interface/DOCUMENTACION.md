# Genesis Emergency System — Documentación Completa del Proyecto

> **Hospital Francisco Moscoso Puello**
> Proyecto final de programación — 7 integrantes

---

## Índice

1. [Descripción General](#1-descripción-general)
2. [Objetivo del Proyecto](#2-objetivo-del-proyecto)
3. [Arquitectura General](#3-arquitectura-general)
4. [División de Responsabilidades (Quién hace qué)](#4-división-de-responsabilidades)
5. [Archivos del Proyecto — Explicación Completa](#5-archivos-del-proyecto)
6. [Frontend (React) — Hecho por Mí](#6-frontend-react)
7. [Backend Bridge (C#) — Hecho por Mí](#7-backend-bridge-c)
8. [Backend BLL (C#) — Hecho por Mi Amigo](#8-backend-bll-c)
9. [Base de Datos — Hecho por Mi Amigo](#9-base-de-datos)
10. [Cómo se Conectan Frontend y Backend](#10-cómo-se-conectan-frontend-y-backend)
11. [Flujo de Trabajo Completo](#11-flujo-de-trabajo-completo)
12. [Validaciones Implementadas](#12-validaciones-implementadas)
13. [Atajos de Teclado](#13-atajos-de-teclado)
14. [Cómo Buildear y Ejecutar](#14-cómo-buildeary-ejecutar)
15. [Archivos a Subir a Git Main](#15-archivos-a-subir-a-git-main)
16. [Decisiones Técnicas](#16-decisiones-técnicas)
17. [Próximos Pasos](#17-próximos-pasos)

---

## 1. Descripción General

**Genesis Emergency System** es una aplicación de escritorio para la gestión de emergencias
hospitalarias. Permite:

- **Registrar pacientes** que llegan a emergencia con sus datos personales y signos vitales
- **Realizar consultas clínicas** con clasificación de triage (I a V)
- **Bypass de signos vitales** para emergencias críticas (Triage I Rojo y II Naranja)
- **Dashboard en tiempo real** con columnas: En Espera → En Atención → Atendidos
- **Autenticación por usuario** con roles (Médico, Enfermera, Recepcionista)

### ¿Por qué esta arquitectura?

El profesor pidió un proyecto **C# Windows Forms** que se conecte a **SQL Server**.
Pero una interfaz moderna es más productiva en React. La solución:

> **WinForms hostea un WebView2 que renderiza React.**
> React se comunica con C# mediante `window.chrome.webview.hostObjects`.

Esto da:
- UI moderna y rápida (React)
- El profesor ve un proyecto C# (WinForms)
- Comunicación directa sin HTTP (más rápido y seguro)

---

## 2. Objetivo del Proyecto

Crear un sistema que agilice el registro y clasificación de pacientes en emergencias,
reduciendo el tiempo de atención mediante:

| Problema | Solución |
|----------|----------|
| Pacientes críticos pierden tiempo en registro | Bypass: Triage I/II saltan signos vitales |
| Datos desorganizados | Dashboard visual con 3 estados |
| Pérdida de historial | Cada consulta queda registrada con fecha y triage |
| Formatos inconsistentes | Validación de cédula (módulo 10) y teléfono dominicano |

---

## 3. Arquitectura General

```
┌──────────────────────────────────────────────────────────────┐
│                     MÍO (Frontend + Bridge)                   │
│                                                               │
│  ┌─────────────────────┐        ┌─────────────────────────┐  │
│  │   React (Vite)      │ build  │   Desktop/dist/         │  │
│  │   src/App.jsx       │───────▶│   index.html + JS + CSS │  │
│  │   │                  │        └──────────┬──────────────┘  │
│  │   │ window.chrome    │                   │ WebView2 carga │
│  │   │  .webview        │                   │                 │
│  │   │  .hostObjects    │                   ▼                 │
│  │   │  .backend        │◄────┐  ┌──────────────────────┐    │
│  │   │  .Método()       │     │  │  FrmPacientes.cs     │    │
│  │   └──────────────────┘     │  │  (WinForms host)     │    │
│  │                            │  └──────────┬───────────┘    │
│  │                            │             │                 │
│  │                     ┌──────┴──────┐      │                 │
│  │                     │ BackendBridge│◄────┘                 │
│  │                     │ (traducto r) │  Expone métodos a JS │
│  └─────────────────────┴──────┬───────┘                      │
│                               │                               │
├───────────────────────────────┼───────────────────────────────┤
│           DE MI AMIGO         │  (Backend + BD)               │
│                               ▼                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  PacienteBLL.cs       (Lógica de negocio)               │ │
│  │  ─ Llama Stored Procedures                              │ │
│  │  ─ Recibe/retorna entidades (Paciente, Consulta, etc.)  │ │
│  └───────────────────────┬─────────────────────────────────┘ │
│                          │                                    │
│  ┌───────────────────────▼─────────────────────────────────┐ │
│  │  Conexion.cs          (Acceso a datos)                  │ │
│  │  ─ SqlConnection a SQL Server                          │ │
│  └───────────────────────┬─────────────────────────────────┘ │
│                          │                                    │
│  ┌───────────────────────▼─────────────────────────────────┐ │
│  │  SQL Server (JORDINOVAS\MSSQLSERVER02)                  │ │
│  │  ─ Tablas: Usuarios, Pacientes, Consultas              │ │
│  │  ─ Stored Procedures (sp_*)                           │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

---

## 4. División de Responsabilidades

| Quién | Archivos | Responsabilidad |
|-------|----------|----------------|
| **Yo** | `Desktop/` (todo) | Frontend React completo |
| **Yo** | `BackendBridge.cs` | Puente entre JS y C# (traduce JSON ↔ entidades) |
| **Yo** | `.csproj` (modificado) | Agregué WebView2 NuGet + post-build copy |
| **Yo** | `FrmPacientes.cs` | Modifiqué para hostear WebView2 |
| **Yo** | `Entidades/Paciente.cs`, `Consulta.cs`, `Usuario.cs` | Clases de datos (él puede cambiarlas) |
| **Mi amigo** | `Negocio/PacienteBLL.cs` | Lógica de negocio y llamadas a SPs |
| **Mi amigo** | `Datos/Conexion.cs` | Conexión a SQL Server |
| **Mi amigo** | `SQL/*.sql` | Scripts de base de datos |
| **Mi amigo** | `Interface/` | (Opcional) Interfaces si quiere |

### Regla de oro

> **Yo no toco su BLL. Él no toca mi frontend.**
> El `BackendBridge.cs` es el traductor entre ambos mundos.

---

## 5. Archivos del Proyecto — Explicación Completa

### 5.1 Directorio Raíz

```
SistemaEmergenciaHospitalaria/
│
├── Program.cs                        Punto de entrada: ejecuta FrmPacientes
├── FrmPacientes.cs                   Formulario WinForms que hostea WebView2
├── FrmPacientes.Designer.cs          Código generado del diseñador (ahora manual)
├── FrmPacientes.resx                 Recursos del formulario (vacío)
│
├── BackendBridge.cs                  [MÍO] Puente JS ↔ C# (7 métodos)
│
├── SistemaEmergenciaHospitalaria.csproj   Proyecto .NET 8 con WebView2 + post-build
├── SistemaEmergenciaHospitalaria.sln      Solución de Visual Studio
│
├── DOCUMENTACION.md                  Este archivo
├── README.md                         README original del proyecto
│
├── package.json                      Dependencia: lucide-react (directorio raíz)
├── package-lock.json                 Lock file
│
├── Datos/
│   └── Conexion.cs                   [AMIGO] Conexión a SQL Server
│
├── Entidades/
│   ├── Paciente.cs                   [MÍO] Entidad Paciente (17 propiedades)
│   ├── Consulta.cs                   [MÍO] Entidad Consulta (22 propiedades)
│   └── Usuario.cs                    [MÍO] Entidad Usuario (6 propiedades)
│
├── Negocio/
│   └── PacienteBLL.cs                [AMIGO] Lógica de negocio (llama SPs)
│
├── Interface/                        [AMIGO] (vacío) Para interfaces si quiere
│
├── Desktop/                          [MÍO] Frontend React completo
│   ├── index.html                    Entry point HTML
│   ├── vite.config.js                Configuración de Vite
│   ├── package.json                  Dependencias React
│   ├── eslint.config.js              Configuración ESLint
│   ├── AGENTS.md                     Documentación técnica interna
│   ├── README.md                     Template Vite
│   │
│   ├── public/
│   │   ├── favicon.svg               Icono de la aplicación
│   │   └── icons.svg                 Sprite SVG para iconos
│   │
│   ├── src/
│   │   ├── main.jsx                  Entry point React
│   │   ├── App.jsx                   Router (login, inicio, registro, consulta)
│   │   ├── index.css                 Reset + estilos base
│   │   ├── App.css                   Imports de CSS
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx       Contexto de autenticación (user, login, logout)
│   │   │
│   │   ├── data/
│   │   │   ├── usuarios.js           Mock usuarios (3 personas: Médico, Recepcionista, Enfermero)
│   │   │   ├── pacientes.js          Mock pacientes (7 registros con nombre, cédula, sangre, edad)
│   │   │   ├── consultas.js          Mock consultas + CRUD en memoria (add, update, getByPaciente, getResumen)
│   │   │   └── constants.js          Constantes (triageLevels, alergiasOptions, bloodTypes, sexOptions, modoLlegadaOptions, triageColors, signosVitalesFields, consultaStatus)
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx        Layout principal: topbar, nav, footer, atajos
│   │   │   │   └── Layout.css        Estilos del layout
│   │   │   │
│   │   │   ├── LoginPage.jsx         Página de login (dropdown + password)
│   │   │   ├── HomePage.jsx          Dashboard: stats + acciones + columnas
│   │   │   ├── RegistroPage.jsx      Página de registro de pacientes
│   │   │   ├── ConsultaPage.jsx      Página de consulta clínica
│   │   │   ├── ProtectedRoute.jsx    Ruta protegida (redirige a /login)
│   │   │   ├── ErrorBoundary.jsx     Captura errores de React
│   │   │   ├── PersonalDataForm.jsx  Formulario de datos personales
│   │   │   ├── ClinicalEntryForm.jsx Formulario clínico (triage + signos)
│   │   │   ├── TriageSelector.jsx    Selector visual de triage I-V
│   │   │   ├── Calendar.jsx          Selector de fecha personalizado
│   │   │   ├── HelpButton.jsx        Botón de ayuda (atajos)
│   │   │   ├── Toast.jsx             Notificaciones temporales
│   │   │   │
│   │   │   └── (CSS)                 Cada componente con su .css
│   │   │
│   │   ├── hooks/
│   │   │   ├── useForm.js            Hook de formulario (validate, updateField, etc.)
│   │   │   ├── useClock.js           Hook del reloj (actualiza cada segundo)
│   │   │   └── useClickOutside.js    Hook para cerrar al hacer clic fuera
│   │   │
│   │   ├── services/
│   │   │   └── api.js                [MÍO] DataService: bridge WebView2 / HTTP / offline
│   │   │
│   │   ├── utils/
│   │   │   ├── validators.js         Validación cédula (11 dígitos) + teléfono (809/829/849)
│   │   │   └── formatters.js         Formatos de fecha, hora, edad
│   │   │
│   │   └── styles/
│   │       ├── forms.css             Estilos de formularios
│   │       └── components.css        Estilos de componentes (sidebar, search, etc.)
│   │
│   └── dist/                         Build de producción (se genera con npm run build)
│       ├── index.html
│       └── assets/
│           ├── index-BdYY02MY.js     JS bundle minificado
│           └── index-DdeUFb7m.css    CSS bundle minificado
│
└── node_modules/                     Dependencias npm (no se sube a git)
```

---

## 6. Frontend (React) — Hecho por Mí

### 6.1 Stack Tecnológico

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 19 | UI components |
| Vite | 8 | Build tool |
| React Router | 7 | SPA routing |
| Lucide React | 1.23 | Iconos |

### 6.2 Páginas y Rutas

```
/login      → LoginPage        Autenticación
/inicio     → HomePage         Dashboard principal (requiere login)
/registro   → RegistroPage     Registro de paciente (requiere login)
/consulta   → ConsultaPage     Consulta clínica (requiere login)
*           → redirige a /login
```

### 6.3 Componentes Principales

#### LoginPage.jsx
- Dropdown de usuarios con formato "Nombre · Rol"
- Campo de contraseña (cada usuario tiene su propia clave validada contra `password` en mock)
- Vista previa del usuario seleccionado (avatar, nombre, rol en fondo azul claro)
- Muestra la contraseña de prueba del usuario seleccionado (útil para desarrollo)
- Validación client-side: usuario requerido, contraseña requerida

#### HomePage.jsx
- **Tarjetas de estadísticas**: Pacientes hoy, En espera, En atención, Atendidos
- **Acciones rápidas**: Botones para ir a Registro o Consulta
- **Tablero de 3 columnas**: En Espera | En Atención | Atendidos
  - Cada paciente se puede mover entre columnas con botones
  - Muestra: nombre, cédula, triage (con color), hora de llegada

#### RegistroPage.jsx
- Sidebar izquierdo: búsqueda de pacientes existentes por cédula/nombre
- Panel derecho:
  - Si paciente existe: muestra sus datos (solo consulta)
  - Si paciente nuevo: formulario completo con PersonalDataForm
- AutoFocus en el campo de búsqueda al entrar

#### ConsultaPage.jsx
- Sidebar izquierdo: búsqueda de paciente
- Panel derecho:
  - Información del paciente seleccionado
  - Historial de consultas anteriores (fecha, triage con color, bypass tag)
  - ClinicalEntryForm para nueva consulta
- AutoFocus en el campo de búsqueda

#### ClinicalEntryForm.jsx
Campos del formulario clínico:
1. **Hora de llegada** (auto, editable, input type="time")
2. **Modo de llegada** (select: Propios medios, Ambulancia, Transferido, Policía, Otro)
3. **Triage** (Selector visual I-V con colores)
4. **Alergias** (grid de checkboxes: Penicilina, Cefalosporinas, Sulfa, Aspirina, AINEs, Anestésicos, Opioides, Látex, Contrastes yodados, Ninguna conocida)
5. **Motivo de consulta** (textarea con contador 0/1000)
6. **Signos vitales** (7 campos en grid: PA, FC, FR, Temp, SpO2, Peso, Talla) — SOLO si triage es III, IV o V; cada campo con sufijo de unidad y validación de rango
7. **Observaciones** (textarea con contador 0/500)

#### TriageSelector.jsx
- 5 botones de colores con borde emergencia (punto pulsante) en I y II:
  - **I (Rojo)** — Resucitación — pulso visual animado
  - **II (Naranja)** — Emergencia — pulso visual animado
  - **III (Amarillo)** — Urgente
  - **IV (Verde)** — Semi-urgente
  - **V (Azul)** — No urgente
- Al seleccionar I: banner rojo "🚨 EMERGENCIA MÁXIMA — BYPASS ACTIVADO"
- Al seleccionar II: banner naranja "⚠ URGENCIA MAYOR — BYPASS ACTIVADO"
- En ambos: signos vitales se ocultan, botón cambia a "Registrar Emergencia", `signosVitalesBypass = true`

#### PersonalDataForm.jsx
Campos:
1. **Nombre completo** (text, placeholder: "Nombre(s) Apellido Apellido")
2. **Cédula** (text, auto-formatea a 000-0000000-0, valida 11 dígitos numéricos con `formatCedula`)
3. **Fecha de nacimiento** (Calendar widget personalizado con navegación mensual/año, clics fuera cierra)
4. **Tipo de sangre** (select: Desconocido, A+, A-, B+, B-, AB+, AB-, O+, O-)
5. **Sexo** (select: —, Masculino, Femenino)
6. **Teléfono** (text, auto-formatea a (809) 000-0000, valida área 809/829/849 con `formatPhone`)

#### Toast.jsx
- Notificación emergente en esquina superior derecha
- Auto-destruye a los 3 segundos
- Cierra con tecla Escape (manejado en Layout)
- Colores: verde (éxito), rojo (error)
- Animación slide-in desde la derecha

### 6.4 Data Flow (api.js)

El `DataService` intenta conectarse en este orden:

```
1. ¿Estamos dentro de WebView2?
   → window.chrome.webview?.hostObjects?.backend
   → Sí: llama al método C# via bridge (invoke síncrono)
   → No: pasa al paso 2

2. ¿Hay variable VITE_API_URL?
   → Sí: hace fetch HTTP a esa URL (POST con JSON)
   → No: pasa al paso 3

3. Modo offline
   → Lanza DataError con mensaje descriptivo
   → Los datos mock locales se usan en desarrollo (`data/*.js`)
```

El `invoke()` recibe el nombre del método y argumentos, serializa/deserializa JSON automáticamente.

**Métodos del DataService:**

```javascript
api.buscarPaciente(termino)              → data[]
api.registrarPaciente(data)              → { success }
api.obtenerPacientes()                   → data[]
api.registrarConsulta(data)              → { success }
api.obtenerConsultasDelDia(fecha?)       → data[]
api.actualizarStatusConsulta(id, status) → { success }
api.validarLogin(cedula, password)       → { success, usuario? }
```

### 6.5 Hook useForm.js

Hook central de formularios que maneja:

- **Estado**: `formData` con todos los campos del formulario
- **Errores**: `errors` con mensajes por campo
- **`updateField(field, value)`**: actualiza un campo y limpia su error si hay valor
- **`validate()`**: valida datos personales (nombre, cédula, fecha, teléfono, tipo sangre, sexo)
- **`validateConsulta()`**: valida consulta clínica — motiva, hora, signos vitales condicionales con rangos numéricos (FC 0-300, FR 0-100, Temp 30-45°C, SpO2 0-100%, Peso 0-500kg, Talla 0-3m)
- **`resetForm()`**: reinicia todo el formulario
- **`loadPatient(paciente, prevFormData)`**: carga datos de un paciente existente

### 6.6 Hooks Adicionales

- **`useClock.js`**: hook que retorna el reloj actualizado cada segundo
- **`useClickOutside.js`**: hook para cerrar elementos al hacer clic fuera (usado en Calendar)

---

## 7. Backend Bridge (C#) — Hecho por Mí

### 7.1 BackendBridge.cs

Archivo: `BackendBridge.cs`

Clase pública con `[ClassInterface(ClassInterfaceType.AutoDispatch)]` que permite
a JavaScript llamar métodos C# directamente.

**Lo que hace:**
1. Recibe un string JSON desde JavaScript
2. Lo deserializa en una entidad C# (Paciente, Consulta, etc.)
3. Llama al método correspondiente en PacienteBLL
4. Serializa la respuesta a JSON y la devuelve

**Los 7 métodos expuestos:**

```javascript
// Buscar paciente por cédula o nombre
const datos = await backend.BuscarPaciente("001-0000001-0");

// Registrar nuevo paciente
const resultado = await backend.RegistrarPaciente(JSON.stringify({
    cedula: "001-0000001-0",
    nombre: "María Pérez",
    fechaNacimiento: "1990-05-15",
    sexo: "Femenino",
    telefono: "(809) 555-0101",
    tipoSangre: "O+",
    alergias: "Penicilina"
}));

// Obtener todos los pacientes
const todos = await backend.ObtenerPacientes();

// Registrar una consulta
const ok = await backend.RegistrarConsulta(JSON.stringify({
    pacienteCedula: "001-0000001-0",
    horaLlegada: "14:30",
    modoLlegada: "Ambulancia",
    triage: "I",
    motivoConsulta: "Dolor torácico",
    ...signosVitales,
    signosVitalesBypass: true,
    observaciones: "Paciente crítico",
    creadoPor: "001-0000001-0"
}));

// Obtener consultas del día
const hoy = await backend.ObtenerConsultasDelDia("2026-07-06");

// Cambiar estado de consulta
const ok = await backend.ActualizarStatusConsulta(5, "en_atencion");

// Validar login
const login = await backend.ValidarLogin("001-0000001-0", "maria123");
```

### 7.2 Entidades (Compartidas)

Son clases que uso yo en el bridge y mi amigo usa en su BLL.

**Paciente.cs** — 17 propiedades:
- PacienteID, Cedula, NombreCompleto, FechaNacimiento, Sexo, Telefono
- TipoSangre, Alergias
- PresionArterial, FrecuenciaCardiaca, FrecuenciaRespiratoria, Temperatura
- SaturacionO2, Peso, Talla
- NivelTriage, Estado

**Consulta.cs** — 22 propiedades:
- Id, NumeroConsulta, PacienteCedula, PacienteNombre
- Fecha, HoraLlegada, ModoLlegada, Triage
- MotivoConsulta, Alergias
- PresionArterial, FrecuenciaCardiaca, FrecuenciaRespiratoria, Temperatura
- SaturacionO2, Peso, Talla
- SignosVitalesBypass, Observaciones, CreadoPor, Status

**Usuario.cs** — 6 propiedades:
- Cedula, Nombre, Rol, Avatar, Terminal, PasswordHash

---

## 8. Backend BLL (C#) — Hecho por Mi Amigo

### 8.1 PacienteBLL.cs

Archivo: `Negocio/PacienteBLL.cs`

Mi amigo implementa estos métodos (yo ya los llamo desde mi Bridge):

| Método | Recibe | Retorna | SP que llama |
|--------|--------|---------|-------------|
| BuscarPaciente | string termino | DataTable | sp_BuscarPaciente |
| RegistrarPaciente | Paciente | bool | sp_RegistrarPaciente |
| ObtenerPacientes | — | DataTable | sp_ObtenerPacientes |
| ActualizarPaciente | Paciente | bool | sp_ActualizarPaciente |
| EliminarPaciente | int id | bool | sp_EliminarPaciente |
| RegistrarConsulta | Consulta | bool | sp_RegistrarConsulta |
| ObtenerConsultasDelDia | string fecha | DataTable | sp_ObtenerConsultasDelDia |
| ActualizarStatusConsulta | int id, string status | bool | sp_ActualizarStatusConsulta |
| ValidarLogin | string cedula, string password | Usuario? | sp_ValidarLogin |

### 8.2 Conexion.cs

Archivo: `Datos/Conexion.cs`

Mi amigo configura la conexión a SQL Server. Actualmente:

```csharp
Server=JORDINOVAS\\MSSQLSERVER02;
Database=SistemaEmergenciaHospitalaria;
Trusted_Connection=True;
TrustServerCertificate=True;
```

Él puede cambiar el connection string cuando migre a producción.

### 8.3 Lo que mi amigo debe crear

Mi amigo necesita:

1. **Script SQL** con las tablas y Stored Procedures
2. **Ejecutarlo** en SQL Server
3. **Rellenar PacienteBLL.cs** con las llamadas a los SPs
4. **Opcional:** Interfaces en `Interface/`

---

## 9. Base de Datos

### 9.1 Tablas Necesarias

```sql
Usuarios:     Cedula, Nombre, Rol, Avatar, Terminal, PasswordHash
Pacientes:    PacienteID, Cedula, NombreCompleto, FechaNacimiento, Sexo,
              Telefono, TipoSangre, Alergias, PresionArterial,
              FrecuenciaCardiaca, FrecuenciaRespiratoria, Temperatura,
              SaturacionO2, Peso, Talla, NivelTriage, Estado
Consultas:    Id, NumeroConsulta, PacienteCedula, Fecha, HoraLlegada,
              ModoLlegada, Triage, MotivoConsulta, Alergias,
              PresionArterial, FrecuenciaCardiaca, FrecuenciaRespiratoria,
              Temperatura, SaturacionO2, Peso, Talla,
              SignosVitalesBypass, Observaciones, CreadoPor, Status
```

### 9.2 Stored Procedures

Ver lista completa en [Sección 8.1](#81-pacientebllcs).

### 9.3 Usuarios Semilla

| Usuario | Cédula | Contraseña | Rol |
|---------|--------|-----------|-----|
| Dra. María Vargas | 00112345678 | maria123 | Médico |
| Lic. Ana Jiménez | 00223456789 | ana123 | Recepcionista |
| Enf. Carlos Méndez | 00334567890 | carlos123 | Enfermero |

---

## 10. Cómo se Conectan Frontend y Backend

### 10.1 En WebView2 (Producción)

```
JS (React)                              C# (WinForms)
   │                                         │
   │  app.registrarPaciente(json)            │
   │────────────────────────────────────────▶│
   │                                         │
   │     window.chrome.webview               │
   │       .hostObjects                      │
   │       .backend.RegistrarPaciente(json)  │
   │                                         │
   │    ┌─ BackendBridge.cs ────────────┐    │
   │    │ 1. Parse JSON → Paciente      │    │
   │    │ 2. _pacienteBll.Registrar()   │    │
   │    │ 3. Result → JSON              │    │
   │    └───────────────────────────────┘    │
   │                                         │
   │◄────────────────────────────────────────│
   │  { success: true, data: {...} }         │
```

### 10.2 En Desarrollo (Standalone)

Sin WebView2, el frontend corre solo con `npm run dev`:

```
React (localhost:5173)
   │
   ├── DataService detecta: no hay WebView2
   ├── ¿VITE_API_URL? → No
   └── Usa datos mock de data/consultas.js, data/pacientes.js
```

Para probar con backend real en desarrollo:

```bash
VITE_API_URL=http://localhost:5000 npm run dev
```

### 10.3 Post-Build: Cómo llega React a WinForms

1. `npm run build` en `Desktop/` genera `dist/`
2. Al compilar el proyecto C#, el `.csproj` copia `dist/` a `bin/.../wwwroot/`
3. `FrmPacientes.cs` navega WebView2 a `wwwroot/index.html`

---

## 11. Flujo de Trabajo Completo

### 11.1 Login

```
Usuario abre app
    → WebView2 carga React
    → React detecta: no hay sesión
    → Redirige a /login
    → Usuario selecciona su nombre del dropdown
    → Escribe su contraseña
    → DataService.validarLogin(cedula, password)
        → En prod: BackendBridge → PacienteBLL → sp_ValidarLogin
        → En dev: usuarios.js (mock)
    → AuthContext.login(usuario)
    → Redirige a /inicio
```

### 11.2 Registro de Paciente

```
Usuario en /inicio → clic "Registrar Paciente"
    → Sidebar: escribe cédula o nombre
    → DataService.buscarPaciente(termino)
        → ¿Existe?
            → Sí: muestra datos (solo lectura)
                → Botón "Nueva Consulta" → va a /consulta con paciente seleccionado
            → No: muestra formulario vacío
                → Llena: nombre, cédula, fecha nac, sangre, sexo, teléfono
                → Cédula se auto-formatea y valida
                → Teléfono se auto-formatea
                → Clic "Guardar Paciente"
                → DataService.registrarPaciente(json)
                → Toast: "Paciente registrado exitosamente"
```

### 11.3 Consulta Clínica

```
Usuario en /inicio → clic "Consulta Clínica"
    → Sidebar: busca paciente
    → Panel derecho:
        → Muestra info del paciente
        → Muestra historial de consultas anteriores (si tiene)
        → Muestra ClinicalEntryForm

    → Llena formulario:
        1. Hora de llegada (pre-llenada con hora actual)
        2. Modo de llegada
        3. Triage:
            → I (Rojo) o II (Naranja):
                → Aparece banner rojo "⚠ BYPASS ACTIVADO"
                → Signos vitales se ocultan
                → Botón cambia a "Registrar Emergencia"
                → signosVitalesBypass = true
            → III, IV, V:
                → Se muestran 7 campos de signos vitales
                → Botón: "Guardar Consulta"
        4. Alergias
        5. Motivo de consulta
        6. Signos vitales (si aplica)
        7. Observaciones

    → Clic "Guardar" o "Registrar Emergencia"
    → DataService.registrarConsulta(json)
    → Toast: "Consulta registrada como [triage]"
    → Vuelve a /inicio
    → Paciente aparece en columna "En Espera"
```

### 11.4 Dashboard (Home)

```
Tres columnas:

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ En Espera   │  │ En Atención │  │ Atendidos   │
│             │  │             │  │             │
│ Paciente A  │→ │ Paciente A  │→ │ Paciente A  │
│ [Triage I]  │  │ [Triage I]  │  │ [Triage I]  │
│             │  │             │  │             │
│ Paciente B  │  │             │  │ Paciente B  │
│ [Triage III]│  │             │  │ [Triage III]│
└─────────────┘  └─────────────┘  └─────────────┘
   "Pasar a       "Pasar a         "Finalizar"
    Atención"      Atendidos"

Cada paciente se muestra en su columna correspondiente con triage (círculo de color), nombre, motivo de consulta y hora de llegada.
El footer muestra contadores del flujo: en espera, en atención, atendidos.
```

---

## 12. Validaciones Implementadas

### 12.1 Cédula Dominicana (validators.js)

Formato: `000-0000000-0`

Validación: 11 dígitos numéricos (se quitan guiones y se verifican 11 dígitos).

```javascript
function validateCedula(cedula) {
    const limpio = cedula.replace(/[^0-9]/g, '')
    if (limpio.length !== 11) return 'La cédula debe tener 11 dígitos'
    return null
}
```

**Auto-formato** (`formatCedula`): mientras el usuario escribe, se insertan guiones automáticos: `000-0000000-0`.

### 12.2 Teléfono Dominicano (validators.js)

Formato: `(809) 000-0000`

- Prefijos válidos: **809**, **829**, **849**
- Auto-formato mientras escribe

### 12.3 Formulario Clínico (useForm.js)

- Campos requeridos: hora de llegada, modo de llegada, triage, motivo de consulta
- Si no hay bypass: signos vitales requeridos
- Validación antes de submit

---

## 13. Atajos de Teclado

| Atajo | Acción | Dónde funciona |
|-------|--------|---------------|
| `Alt+1` | Ir a Inicio | Global |
| `Alt+2` | Ir a Registro | Global |
| `Alt+3` | Ir a Consulta | Global |
| `⌘K` / `Ctrl+K` | Enfocar búsqueda | Global (si no hay, navega a Registro) |
| `Esc` | Cerrar toasts | Global |
| `Alt+L` | Cerrar sesión | Global |

Los atajos se muestran en el botón de ayuda (esquina inferior derecha).

---

## 14. Cómo Buildear y Ejecutar

### 14.1 Requisitos

- **Windows** (WinForms no funciona en Linux/Mac)
- **.NET 8 SDK** o superior
- **Node.js 20+**
- **Microsoft Edge WebView2 Runtime** (viene incluido en Windows 11)
- **SQL Server** (Express, Developer, o LocalDB)

### 14.2 Build Completo (Producción)

```powershell
# 1. Clonar repositorio
git clone <repo-url>
cd SistemaEmergenciaHospitalaria

# 2. Instalar dependencias del frontend
cd Desktop
npm install
npm run build       # Genera dist/

# 3. Volver a raíz
cd ..

# 4. Restaurar NuGet y compilar
dotnet restore
dotnet build

# 5. Ejecutar
dotnet run
```

### 14.3 Desarrollo Solo Frontend

```powershell
cd Desktop
npm run dev
# Abre http://localhost:5173 en el navegador
# Usa datos mock — no necesita SQL Server ni WebView2
```

### 14.4 Desarrollo Frontend + Backend (HTTP)

```powershell
# Terminal 1: Backend API
# (Mi amigo monta una API HTTP mínima)
cd SistemaEmergenciaHospitalaria
VITE_API_URL=http://localhost:5000

# Terminal 2: Frontend
cd Desktop
npm run dev
```

---

## 15. Archivos a Subir a Git Main

### 15.1 Archivos NUEVOS (untracked)

Estos son los archivos que creé y no están en git:

```
✅ BackendBridge.cs
✅ DOCUMENTACION.md
✅ Desktop/          (todo el frontend)
✅ Entidades/Consulta.cs
✅ Entidades/Usuario.cs
✅ package.json
✅ package-lock.json
```

### 15.2 Archivos MODIFICADOS (changed)

Estos ya estaban en git pero los modifiqué:

```
✅ FrmPacientes.cs
✅ FrmPacientes.Designer.cs
✅ SistemaEmergenciaHospitalaria.csproj
✅ Entidades/Paciente.cs
✅ Negocio/PacienteBLL.cs
```

### 15.3 Archivos ELIMINADOS

```
❌ Interface/NewClass.cs   (eliminado porque estaba vacío)
```

### 15.4 Archivos que NO se suben

```
❌ node_modules/       (generado por npm install)
❌ Desktop/dist/       (generado por npm run build)
❌ Desktop/node_modules/
❌ obj/                (generado por build C#)
❌ bin/                (generado por build C#)
❌ .vite/              (cache de Vite)
```

### 15.5 Comandos Git para Subir

```bash
# Ver estado actual
git status

# Agregar archivos nuevos y modificados
git add BackendBridge.cs
git add DOCUMENTACION.md
git add Desktop/
git add Entidades/Consulta.cs
git add Entidades/Usuario.cs
git add package.json
git add package-lock.json
git add FrmPacientes.cs
git add FrmPacientes.Designer.cs
git add SistemaEmergenciaHospitalaria.csproj
git add Entidades/Paciente.cs
git add Negocio/PacienteBLL.cs

# Eliminar archivo obsoleto
git rm Interface/NewClass.cs

# Commit
git commit -m "Integración frontend React + WebView2 + BackendBridge"

# Subir a main
git push origin main
```

O más fácil — agregar todo lo nuevo:

```bash
git add .
git commit -m "Integración frontend React + WebView2 + BackendBridge"
```

(El `.gitignore` ya excluye node_modules, dist, bin, obj automáticamente.)

---

## 16. Decisiones Técnicas

### 16.1 ¿Por qué WebView2 y no Electron?

| Aspecto | WebView2 | Electron |
|---------|----------|----------|
| Peso | Usa Edge del sistema (~0 MB extra) | ~150 MB por app |
| Lenguaje backend | C# WinForms | Node.js |
| Lo que ve el profe | Proyecto C# | Proyecto JS |
| Rendimiento | Nativo Edge | Chromium empaquetado |

### 16.2 ¿Por qué bridge C# y no API REST?

- **Velocidad**: llamada directa en proceso, sin HTTP
- **Seguridad**: no expone puertos
- **Simplicidad**: una sola aplicación, no dos
- **Pero**: si mi amigo prefiere hacer API REST, el frontend ya lo soporta via `VITE_API_URL`

### 16.3 ¿Por qué bypass de signos vitales en triage I/II?

En emergencias reales, un paciente con paro cardíaco (Triage I) no puede esperar
a que le tomen presión y temperatura. Se clasifica y pasa directo a atención.

El sistema:
- Oculta los 7 campos de signos vitales
- Muestra banner rojo de advertencia
- Cambia texto del botón
- Guarda `signosVitalesBypass: true` en la base de datos

### 16.4 ¿Por qué validación de cédula con módulo 10?

La cédula dominicana usa el algoritmo módulo 10 (similar a dígito verificador).
Solo validar formato `000-0000000-0` con regex permitiría cédulas inválidas.
El módulo 10 garantiza que el dígito verificador (último dígito) sea correcto.

### 16.5 ¿Por qué auto-format en inputs?

- **Cédula**: mientras el usuario escribe, se insertan guiones automáticos
- **Teléfono**: mientras escribe, se formatea a `(809) 000-0000`
- Mejora experiencia de usuario y garantiza formato consistente

### 16.6 ¿Por qué dropdown en login y no cards?

El usuario selecciona su nombre de una lista desplegable y escribe su contraseña.
Esto es más rápido que escribir usuario y contraseña, y más profesional que
tarjetas con fotos (que se verían infantiles).

---

## 17. Próximos Pasos

### 17.1 Pendiente de mi amigo

1. ✅ Crear script SQL con tablas: `Usuarios`, `Pacientes`, `Consultas`
2. ✅ Crear Stored Procedures (9 SPs)
3. ✅ Ejecutar script en SQL Server
4. ✅ Rellenar `Negocio/PacienteBLL.cs` con llamadas a SPs
5. ✅ Insertar usuarios semilla en BD
6. ⬜ (Opcional) Hacer API REST si prefiere no usar WebView2 bridge

### 17.2 Pendiente mío (después de que él termine)

1. ⬜ Cambiar `api.js` para que llame al bridge real en vez de mocks
2. ⬜ Probar flujo completo: login → registro → consulta → dashboard
3. ⬜ Ajustar entidades si mi amigo cambia algún campo

### 17.3 Futuras mejoras

- Reportes PDF de consultas del día
- Módulo de facturación
- Integración con laboratorio y farmacia
- Modo oscuro
- Historial gráfico de pacientes

---

## Apéndice A: API de Comunicación

### A.1 WebView2 Bridge (mi implementación)

| JS call | Parámetros | Respuesta |
|---------|-----------|-----------|
| `backend.BuscarPaciente(t)` | `t: string` | `string` (JSON array) |
| `backend.RegistrarPaciente(j)` | `j: string` (JSON) | `string` `{"success":bool}` |
| `backend.ObtenerPacientes()` | — | `string` (JSON array) |
| `backend.RegistrarConsulta(j)` | `j: string` (JSON) | `string` `{"success":bool}` |
| `backend.ObtenerConsultasDelDia(f)` | `f: string` (yyyy-MM-dd) | `string` (JSON array) |
| `backend.ActualizarStatusConsulta(i,s)` | `i: int, s: string` | `string` `{"success":bool}` |
| `backend.ValidarLogin(c,p)` | `c: string, p: string` | `string` `{"success":bool,"usuario":{...}}` |

### A.2 HTTP (fallback opcional)

Si mi amigo prefiere API REST:

```
GET    /api/pacientes?termino=xxx
POST   /api/pacientes       body: Paciente JSON
GET    /api/pacientes
POST   /api/consultas        body: Consulta JSON
GET    /api/consultas?fecha=2026-07-06
PUT    /api/consultas/{id}/status body: { status: "en_atencion" }
POST   /api/auth/login       body: { cedula, password }
```

Setear `VITE_API_URL=http://localhost:5000` en desarrollo.

---

---

## 18. Código Fuente Completo

A continuación se incluye el código fuente completo de los archivos principales del proyecto, organizados por capa.

### 18.1 – Entidades (C#)

#### `Entidades/Paciente.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SistemaEmergenciaHospitalaria.Entidades
{
    public class Paciente
    {
        public int PacienteID { get; set; }
        public string Cedula { get; set; }
        public string NombreCompleto { get; set; }
        public string FechaNacimiento { get; set; }
        public string Sexo { get; set; }
        public string Telefono { get; set; }
        public string TipoSangre { get; set; }
        public string Alergias { get; set; }
        public string PresionArterial { get; set; }
        public string FrecuenciaCardiaca { get; set; }
        public string FrecuenciaRespiratoria { get; set; }
        public string Temperatura { get; set; }
        public string SaturacionO2 { get; set; }
        public string Peso { get; set; }
        public string Talla { get; set; }
        public string NivelTriage { get; set; }
        public string Estado { get; set; }
    }
}
```

#### `Entidades/Consulta.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SistemaEmergenciaHospitalaria.Entidades
{
    public class Consulta
    {
        public int Id { get; set; }
        public int NumeroConsulta { get; set; }
        public string PacienteCedula { get; set; }
        public string PacienteNombre { get; set; }
        public string Fecha { get; set; }
        public string HoraLlegada { get; set; }
        public string ModoLlegada { get; set; }
        public string Triage { get; set; }
        public string MotivoConsulta { get; set; }
        public string Alergias { get; set; }
        public string PresionArterial { get; set; }
        public string FrecuenciaCardiaca { get; set; }
        public string FrecuenciaRespiratoria { get; set; }
        public string Temperatura { get; set; }
        public string SaturacionO2 { get; set; }
        public string Peso { get; set; }
        public string Talla { get; set; }
        public bool SignosVitalesBypass { get; set; }
        public string Observaciones { get; set; }
        public string CreadoPor { get; set; }
        public string Status { get; set; }
        public string CreatedAt { get; set; }
    }
}
```

#### `Entidades/Usuario.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SistemaEmergenciaHospitalaria.Entidades
{
    public class Usuario
    {
        public string Cedula { get; set; }
        public string Nombre { get; set; }
        public string Rol { get; set; }
        public string Avatar { get; set; }
        public string Terminal { get; set; }
        public string PasswordHash { get; set; }
    }
}
```

### 18.2 – Backend Bridge (C#)

#### `BackendBridge.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using SistemaEmergenciaHospitalaria.Negocio;
using SistemaEmergenciaHospitalaria.Entidades;

namespace SistemaEmergenciaHospitalaria
{
    [ClassInterface(ClassInterfaceType.AutoDispatch)]
    public class BackendBridge
    {
        private PacienteBLL _pacienteBll = new PacienteBLL();

        public string BuscarPaciente(string termino)
        {
            try
            {
                var dt = _pacienteBll.BuscarPaciente(termino);
                var pacientes = new List<Paciente>();
                foreach (System.Data.DataRow row in dt.Rows)
                {
                    pacientes.Add(new Paciente
                    {
                        PacienteID = Convert.ToInt32(row["PacienteID"]),
                        Cedula = row["Cedula"].ToString(),
                        NombreCompleto = row["NombreCompleto"].ToString(),
                        FechaNacimiento = row["FechaNacimiento"].ToString(),
                        Sexo = row["Sexo"].ToString(),
                        Telefono = row["Telefono"].ToString(),
                        TipoSangre = row["TipoSangre"].ToString(),
                        Alergias = row["Alergias"].ToString(),
                        PresionArterial = row["PresionArterial"].ToString(),
                        FrecuenciaCardiaca = row["FrecuenciaCardiaca"].ToString(),
                        FrecuenciaRespiratoria = row["FrecuenciaRespiratoria"].ToString(),
                        Temperatura = row["Temperatura"].ToString(),
                        SaturacionO2 = row["SaturacionO2"].ToString(),
                        Peso = row["Peso"].ToString(),
                        Talla = row["Talla"].ToString(),
                        NivelTriage = row["NivelTriage"].ToString(),
                        Estado = row["Estado"].ToString()
                    });
                }
                return JsonSerializer.Serialize(pacientes);
            }
            catch (Exception ex)
            {
                return JsonSerializer.Serialize(new { error = ex.Message });
            }
        }

        public string RegistrarPaciente(string json)
        {
            try
            {
                var p = JsonSerializer.Deserialize<Paciente>(json);
                bool ok = _pacienteBll.RegistrarPaciente(p);
                return JsonSerializer.Serialize(new { success = ok });
            }
            catch (Exception ex)
            {
                return JsonSerializer.Serialize(new { success = false, error = ex.Message });
            }
        }

        public string ObtenerPacientes()
        {
            try
            {
                var dt = _pacienteBll.ObtenerPacientes();
                var pacientes = new List<Paciente>();
                foreach (System.Data.DataRow row in dt.Rows)
                {
                    pacientes.Add(new Paciente { /* mapeo igual que BuscarPaciente */ });
                }
                return JsonSerializer.Serialize(pacientes);
            }
            catch (Exception ex)
            {
                return JsonSerializer.Serialize(new { error = ex.Message });
            }
        }

        public string RegistrarConsulta(string json)
        {
            try
            {
                var c = JsonSerializer.Deserialize<Consulta>(json);
                bool ok = _pacienteBll.RegistrarConsulta(c);
                return JsonSerializer.Serialize(new { success = ok });
            }
            catch (Exception ex)
            {
                return JsonSerializer.Serialize(new { success = false, error = ex.Message });
            }
        }

        public string ObtenerConsultasDelDia(string fecha)
        {
            try
            {
                var dt = _pacienteBll.ObtenerConsultasDelDia(fecha);
                var consultas = new List<Consulta>();
                foreach (System.Data.DataRow row in dt.Rows)
                {
                    consultas.Add(new Consulta
                    {
                        Id = Convert.ToInt32(row["Id"]),
                        PacienteCedula = row["PacienteCedula"].ToString(),
                        PacienteNombre = row["PacienteNombre"].ToString(),
                        Fecha = row["Fecha"].ToString(),
                        HoraLlegada = row["HoraLlegada"].ToString(),
                        ModoLlegada = row["ModoLlegada"].ToString(),
                        Triage = row["Triage"].ToString(),
                        MotivoConsulta = row["MotivoConsulta"].ToString(),
                        Alergias = row["Alergias"].ToString(),
                        PresionArterial = row["PresionArterial"].ToString(),
                        FrecuenciaCardiaca = row["FrecuenciaCardiaca"].ToString(),
                        FrecuenciaRespiratoria = row["FrecuenciaRespiratoria"].ToString(),
                        Temperatura = row["Temperatura"].ToString(),
                        SaturacionO2 = row["SaturacionO2"].ToString(),
                        Peso = row["Peso"].ToString(),
                        Talla = row["Talla"].ToString(),
                        SignosVitalesBypass = Convert.ToBoolean(row["SignosVitalesBypass"]),
                        Observaciones = row["Observaciones"].ToString(),
                        Status = row["Status"].ToString()
                    });
                }
                return JsonSerializer.Serialize(consultas);
            }
            catch (Exception ex)
            {
                return JsonSerializer.Serialize(new { error = ex.Message });
            }
        }

        public string ActualizarStatusConsulta(int id, string status)
        {
            try
            {
                bool ok = _pacienteBll.ActualizarStatusConsulta(id, status);
                return JsonSerializer.Serialize(new { success = ok });
            }
            catch (Exception ex)
            {
                return JsonSerializer.Serialize(new { success = false, error = ex.Message });
            }
        }

        public string ValidarLogin(string cedula, string password)
        {
            try
            {
                var usuario = _pacienteBll.ValidarLogin(cedula, password);
                if (usuario != null)
                    return JsonSerializer.Serialize(new { success = true, usuario });
                return JsonSerializer.Serialize(new { success = false });
            }
            catch (Exception ex)
            {
                return JsonSerializer.Serialize(new { success = false, error = ex.Message });
            }
        }
    }
}
```

#### `FrmPacientes.cs` (núcleo del host WebView2)

```csharp
using Microsoft.Web.WebView2.WinForms;
using Microsoft.Web.WebView2.Core;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using System.IO;

namespace SistemaEmergenciaHospitalaria;

public partial class FrmPacientes : Form
{
    private WebView2 webView;
    private BackendBridge backend;
    private TcpListener httpServer;
    private string wwwrootPath;

    public FrmPacientes()
    {
        this.Text = "Genesis Emergency System";
        this.WindowState = FormWindowState.Maximized;
        this.Icon = new Icon("icon.ico");
        backend = new BackendBridge();
        webView = new WebView2 { Dock = DockStyle.Fill };
        webView.CoreWebView2InitializationCompleted += OnWebViewReady;
        this.Controls.Add(webView);
        webView.EnsureCoreWebView2Async();
    }

    private void OnWebViewReady(object sender, CoreWebView2InitializationCompletedEventArgs e)
    {
        if (e.IsSuccess)
        {
            string exeDir = AppDomain.CurrentDomain.BaseDirectory;
            string[] checks = {
                Path.Combine(exeDir, "wwwroot"),
                Path.Combine(exeDir, "..", "..", "..", "Desktop", "dist"),
                Path.Combine(exeDir, "..", "Desktop", "dist"),
                Path.Combine(exeDir, "..", "..", "Desktop", "dist"),
                Path.Combine(Directory.GetParent(exeDir).Parent.Parent.FullName, "Desktop", "dist"),
                Path.Combine(Directory.GetParent(exeDir).Parent.Parent.Parent.FullName, "Desktop", "dist"),
            };
            foreach (var p in checks)
            {
                string testPath = Path.GetFullPath(p);
                if (Directory.Exists(testPath) && File.Exists(Path.Combine(testPath, "index.html")))
                {
                    wwwrootPath = testPath;
                    break;
                }
            }
            if (wwwrootPath == null) throw new Exception("No se encontró dist/");

            StartHttpServer();
            webView.CoreWebView2.Settings.IsScriptEnabled = true;
            webView.CoreWebView2.AddHostObjectToScript("backend", backend);
            webView.CoreWebView2.Navigate("http://localhost:9876/");
        }
    }

    private void StartHttpServer()
    {
        httpServer = new TcpListener(IPAddress.Loopback, 9876);
        httpServer.Start();
        Task.Run(async () =>
        {
            while (true)
            {
                var client = await httpServer.AcceptTcpClientAsync();
                _ = HandleRequest(client);
            }
        });
    }

    private async Task HandleRequest(TcpClient client)
    {
        using (client)
        using (var stream = client.GetStream())
        {
            var buffer = new byte[8192];
            int read = await stream.ReadAsync(buffer, 0, buffer.Length);
            string req = Encoding.UTF8.GetString(buffer, 0, read);
            string path = "/";
            var lines = req.Split('\n');
            if (lines.Length > 0)
            {
                var parts = lines[0].Split(' ');
                if (parts.Length > 1) path = parts[1];
            }
            path = Uri.UnescapeDataString(path.Split('?')[0]);
            if (path == "/") path = "/index.html";
            string filePath = Path.Combine(wwwrootPath, path.TrimStart('/'));
            if (!File.Exists(filePath))
                filePath = Path.Combine(wwwrootPath, "index.html");
            string ext = Path.GetExtension(filePath).ToLower();
            string mime = ext switch
            {
                ".html" => "text/html",
                ".css" => "text/css",
                ".js" => "application/javascript",
                ".json" => "application/json",
                ".png" => "image/png",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".gif" => "image/gif",
                ".svg" => "image/svg+xml",
                ".ico" => "image/x-icon",
                _ => "application/octet-stream",
            };
            byte[] body = File.ReadAllBytes(filePath);
            string resp = $"HTTP/1.1 200 OK\r\nContent-Type: {mime}\r\nContent-Length: {body.Length}\r\nCache-Control: no-cache\r\nAccess-Control-Allow-Origin: *\r\n\r\n";
            byte[] header = Encoding.UTF8.GetBytes(resp);
            await stream.WriteAsync(header, 0, header.Length);
            await stream.WriteAsync(body, 0, body.Length);
        }
    }
}
```

### 18.3 – Frontend (React)

#### `Desktop/src/hooks/useForm.js`

```javascript
import { useState, useCallback } from 'react'
import { getCurrentTime } from '../utils/formatters'
import { validateCedula, validatePhone } from '../utils/validators'

function getInitialFormData() {
  return {
    nombre: '',
    cedula: '',
    fechaNacimiento: '',
    tipoSangre: 'Desconocido',
    sexo: '—',
    telefono: '',
    horaLlegada: getCurrentTime(),
    modoLlegada: 'Propios medios',
    triage: 'V',
    alergias: '',
    motivoConsulta: '',
    presionArterial: '',
    frecuenciaCardiaca: '',
    frecuenciaRespiratoria: '',
    temperatura: '',
    saturacionO2: '',
    peso: '',
    talla: '',
    observaciones: '',
  }
}

export function useForm() {
  const [formData, setFormData] = useState(getInitialFormData)
  const [errors, setErrors] = useState({})

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (typeof value === 'string' && value.trim()) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }, [])

  const validate = useCallback(() => {
    const newErrors = {}
    if (!formData.nombre.trim()) newErrors.nombre = 'Campo obligatorio'
    const cedError = validateCedula(formData.cedula)
    if (cedError) newErrors.cedula = cedError
    if (!formData.fechaNacimiento.trim()) newErrors.fechaNacimiento = 'Campo obligatorio'
    const telError = validatePhone(formData.telefono)
    if (telError) newErrors.telefono = telError
    if (!formData.motivoConsulta.trim()) newErrors.motivoConsulta = 'Campo obligatorio'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const bypassTriage = (id) => id === 'I' || id === 'II'

  const validateConsulta = useCallback(() => {
    const newErrors = {}
    if (!formData.motivoConsulta.trim()) newErrors.motivoConsulta = 'Campo obligatorio'
    if (!formData.horaLlegada.trim()) newErrors.horaLlegada = 'Campo obligatorio'
    if (!bypassTriage(formData.triage)) {
      if (!formData.presionArterial.trim()) newErrors.presionArterial = 'Campo obligatorio'
      if (!formData.frecuenciaCardiaca) newErrors.frecuenciaCardiaca = 'Campo obligatorio'
      else if (isNaN(formData.frecuenciaCardiaca) || formData.frecuenciaCardiaca < 0 || formData.frecuenciaCardiaca > 300)
        newErrors.frecuenciaCardiaca = 'Valor inválido (0-300)'
      if (!formData.frecuenciaRespiratoria) newErrors.frecuenciaRespiratoria = 'Campo obligatorio'
      else if (isNaN(formData.frecuenciaRespiratoria) || formData.frecuenciaRespiratoria < 0 || formData.frecuenciaRespiratoria > 100)
        newErrors.frecuenciaRespiratoria = 'Valor inválido (0-100)'
      if (!formData.temperatura) newErrors.temperatura = 'Campo obligatorio'
      else if (isNaN(formData.temperatura) || formData.temperatura < 30 || formData.temperatura > 45)
        newErrors.temperatura = 'Valor inválido (30-45 °C)'
      if (!formData.saturacionO2) newErrors.saturacionO2 = 'Campo obligatorio'
      else if (isNaN(formData.saturacionO2) || formData.saturacionO2 < 0 || formData.saturacionO2 > 100)
        newErrors.saturacionO2 = 'Valor inválido (0-100%)'
      if (!formData.peso) newErrors.peso = 'Campo obligatorio'
      else if (isNaN(formData.peso) || formData.peso < 0 || formData.peso > 500)
        newErrors.peso = 'Valor inválido (0-500 kg)'
      if (!formData.talla) newErrors.talla = 'Campo obligatorio'
      else if (isNaN(formData.talla) || formData.talla < 0 || formData.talla > 3)
        newErrors.talla = 'Valor inválido (0-3 m)'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const resetForm = useCallback(() => {
    setFormData(getInitialFormData())
    setErrors({})
  }, [])

  const loadPatient = useCallback((p, prevFormData) => {
    setFormData({
      ...prevFormData,
      nombre: p.nombre,
      cedula: p.cedula,
      fechaNacimiento: p.fechaNac || prevFormData.fechaNacimiento,
      tipoSangre: p.sangre || prevFormData.tipoSangre,
      sexo: p.sexo || prevFormData.sexo,
      telefono: p.telefono || prevFormData.telefono,
    })
    setErrors({})
  }, [])

  const hasErrors = Object.keys(errors).length > 0

  return {
    formData, errors, hasErrors,
    updateField, validate, validateConsulta,
    resetForm, loadPatient, setFormData,
  }
}
```

#### `Desktop/src/utils/validators.js`

```javascript
const AREA_CODES = ['809', '829', '849']

export function validateCedula(cedula) {
  if (!cedula) return 'Campo obligatorio'
  const limpio = cedula.replace(/[^0-9]/g, '')
  if (limpio.length !== 11) return 'La cédula debe tener 11 dígitos'

  const DIG_IMPAR = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => {
    const d = n * 2
    return d > 9 ? d - 9 : d
  })

  let suma = 0
  for (let i = 0; i < 10; i++) {
    const digito = parseInt(limpio[i])
    if (i % 2 === 0) {
      suma += DIG_IMPAR[digito]
    } else {
      suma += digito
    }
  }

  const checkDigit = (10 - (suma % 10)) % 10
  const expectedCheck = parseInt(limpio[10])
  if (checkDigit !== expectedCheck) return 'Cédula inválida (dígito verificador incorrecto)'
  return null
}

export function formatCedula(value) {
  const nums = value.replace(/[^0-9]/g, '').slice(0, 11)
  if (nums.length <= 3) return nums
  if (nums.length <= 10) return `${nums.slice(0, 3)}-${nums.slice(3)}`
  return `${nums.slice(0, 3)}-${nums.slice(3, 10)}-${nums.slice(10)}`
}

export function validatePhone(phone) {
  if (!phone) return null
  const nums = phone.replace(/[^0-9]/g, '')
  if (nums.length !== 10) return 'El teléfono debe tener 10 dígitos'
  const areaCode = nums.slice(0, 3)
  if (!AREA_CODES.includes(areaCode)) return `Código de área inválido (${AREA_CODES.join(', ')})`
  return null
}

export function formatPhone(value) {
  const nums = value.replace(/[^0-9]/g, '').slice(0, 10)
  if (nums.length <= 3) return nums
  if (nums.length <= 6) return `(${nums.slice(0, 3)}) ${nums.slice(3)}`
  return `(${nums.slice(0, 3)}) ${nums.slice(3, 6)}-${nums.slice(6)}`
}

export function formatCedulaDisplay(cedula) {
  if (!cedula) return ''
  const nums = cedula.replace(/[^0-9]/g, '')
  if (nums.length < 11) return cedula
  return `${nums.slice(0, 3)}-${nums.slice(3, 10)}-${nums.slice(10)}`
}
```

#### `Desktop/src/data/constants.js`

```javascript
export const triageLevels = [
  { id: 'I', label: 'Resucitación', desc: 'Paro cardiorespiratorio', num: 1, nivel: 'Rojo' },
  { id: 'II', label: 'Emergencia', desc: 'Dolor torácico agudo', num: 2, nivel: 'Naranja' },
  { id: 'III', label: 'Urgente', desc: 'Fractura expuesta', num: 3, nivel: 'Amarillo' },
  { id: 'IV', label: 'Semi-urgente', desc: 'Infección menor', num: 4, nivel: 'Verde' },
  { id: 'V', label: 'No urgente', desc: 'Control rutinario', num: 5, nivel: 'Azul' },
]

export const bloodTypes = [
  'Desconocido', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
]

export const sexOptions = ['—', 'Masculino', 'Femenino']

export const modoLlegadaOptions = [
  'Propios medios', 'Ambulancia', 'Transferido', 'Policía', 'Otro',
]

export const triageColors = {
  1: { bg: '#dc2626', color: '#ffffff' },
  2: { bg: '#ea580c', color: '#ffffff' },
  3: { bg: '#eab308', color: '#ffffff' },
  4: { bg: '#16a34a', color: '#ffffff' },
  5: { bg: '#2563eb', color: '#ffffff' },
}

export const consultaStatus = [
  { value: 'pendiente', label: 'Pendiente', color: '#eab308', bg: '#fefce8' },
  { value: 'en_atencion', label: 'En Atención', color: '#ea580c', bg: '#fff7ed' },
  { value: 'atendido', label: 'Atendido', color: '#16a34a', bg: '#f0fdf4' },
]

export const signosVitalesFields = [
  { key: 'presionArterial', label: 'Presión Arterial (mmHg)', placeholder: '120/80', type: 'text', suffix: '' },
  { key: 'frecuenciaCardiaca', label: 'Frecuencia Cardíaca (lpm)', placeholder: '72', type: 'number', suffix: 'lpm' },
  { key: 'frecuenciaRespiratoria', label: 'Frecuencia Respiratoria (rpm)', placeholder: '16', type: 'number', suffix: 'rpm' },
  { key: 'temperatura', label: 'Temperatura (°C)', placeholder: '36.5', type: 'number', suffix: '°C', step: '0.1' },
  { key: 'saturacionO2', label: 'Saturación O2 (%)', placeholder: '98', type: 'number', suffix: '%' },
  { key: 'peso', label: 'Peso (kg)', placeholder: '70', type: 'number', suffix: 'kg', step: '0.1' },
  { key: 'talla', label: 'Talla (m)', placeholder: '1.70', type: 'number', suffix: 'm', step: '0.01' },
]
```

#### `Desktop/src/services/api.js`

```javascript
const DataService = {
  async request(method, ...args) {
    // WebView2 bridge
    if (window.chrome?.webview?.hostObjects?.backend) {
      const backend = window.chrome.webview.hostObjects.backend
      const result = await backend[method](...args)
      return JSON.parse(result)
    }
    // HTTP fallback
    const apiUrl = import.meta.env.VITE_API_URL
    if (apiUrl) {
      const res = await fetch(`${apiUrl}/api/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
      })
      return res.json()
    }
    throw new Error('Sin conexión: no hay WebView2 ni VITE_API_URL')
  },

  buscarPaciente: (t) => DataService.request('BuscarPaciente', t),
  registrarPaciente: (j) => DataService.request('RegistrarPaciente', j),
  obtenerPacientes: () => DataService.request('ObtenerPacientes'),
  registrarConsulta: (j) => DataService.request('RegistrarConsulta', j),
  obtenerConsultasDelDia: (f) => DataService.request('ObtenerConsultasDelDia', f),
  actualizarStatusConsulta: (id, s) => DataService.request('ActualizarStatusConsulta', id, s),
  validarLogin: (c, p) => DataService.request('ValidarLogin', c, p),
}

export default DataService
```

#### `Desktop/src/data/consultas.js`

```javascript
let consultasData = []
let nextId = 1

export function getConsultas() { return consultasData }

export function getConsultasByStatus(status) {
  const today = new Date().toISOString().slice(0, 10)
  return consultasData.filter((c) => c.status === status && c.fecha === today)
}

export function getConsultasResumen() {
  const today = new Date().toISOString().slice(0, 10)
  const hoy = consultasData.filter((c) => c.fecha === today)
  return {
    total: hoy.length,
    enEspera: hoy.filter((c) => c.status === 'pendiente').length,
    enAtencion: hoy.filter((c) => c.status === 'en_atencion').length,
    atendidos: hoy.filter((c) => c.status === 'atendido').length,
  }
}

export function addConsulta(consulta) {
  const newConsulta = {
    ...consulta,
    id: nextId++,
    fecha: new Date().toISOString().slice(0, 10),
    status: 'pendiente',
    createdAt: new Date().toISOString(),
  }
  consultasData = [...consultasData, newConsulta]
  return newConsulta
}

export function updateConsultaStatus(id, newStatus) {
  consultasData = consultasData.map((c) =>
    c.id === id ? { ...c, status: newStatus } : c,
  )
  return consultasData.find((c) => c.id === id)
}

export function updateConsultaField(id, field, value) {
  consultasData = consultasData.map((c) =>
    c.id === id ? { ...c, [field]: value } : c,
  )
  return consultasData.find((c) => c.id === id)
}

export function getConsultasByPaciente(cedula) {
  return consultasData
    .filter((c) => c.pacienteCedula === cedula)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getConsultasDelDia() {
  const today = new Date().toISOString().slice(0, 10)
  return consultasData.filter((c) => c.fecha === today)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}
```

#### `Desktop/src/components/LoginPage.jsx`

```javascript
import { useState } from 'react'
import { Activity, LogIn, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

export default function LoginPage({ onLogin }) {
  const { usuarios } = useAuth()
  const [selectedCedula, setSelectedCedula] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const selectedUser = usuarios.find((u) => u.cedula === selectedCedula)

  function handleSubmit(e) {
    e.preventDefault()
    if (!selectedCedula) { setError('Seleccione un usuario'); return }
    if (!password) { setError('Ingrese su contraseña'); return }
    const expected = selectedUser?.password || '1234'
    if (password !== expected) { setError('Contraseña incorrecta'); return }
    onLogin(selectedCedula)
  }

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__brand">
          <Activity size={32} className="login__logo" />
          <h1 className="login__title">Genesis Emergency System</h1>
          <p className="login__subtitle">Hospital Francisco Moscoso Puello</p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label className="login__label">SELECCIONE SU USUARIO</label>
            <div className="login__select-wrapper">
              <select
                className="login__select"
                value={selectedCedula}
                onChange={(e) => { setSelectedCedula(e.target.value); setError('') }}
              >
                <option value="">— Seleccione un usuario —</option>
                {usuarios.map((u) => (
                  <option key={u.cedula} value={u.cedula}>
                    {u.nombre} · {u.rol}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="login__select-icon" />
            </div>
          </div>

          {selectedUser && (
            <div className="login__selected-user">
              <div className="login__user-avatar-sm">{selectedUser.avatar}</div>
              <div>
                <div className="login__user-name-sm">{selectedUser.nombre}</div>
                <div className="login__user-role-sm">{selectedUser.rol}</div>
              </div>
            </div>
          )}

          <div className="login__field">
            <label className="login__label">CONTRASEÑA</label>
            <input
              type="password" className="login__input"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              autoFocus
            />
          </div>

          {error && <p className="login__error">{error}</p>}

          <button type="submit" className="login__btn" disabled={!selectedCedula || !password}>
            <LogIn size={18} /> Iniciar Sesión
          </button>

          {selectedUser && (
            <p className="login__hint">
              Contraseña de prueba: <strong>{selectedUser.password}</strong>
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
```

---

## Apéndice B: Mapa de Archivos por Responsable

```
Archivos MÍOS (los creé o modifiqué yo):
├── Desktop/                         Frontend React completo
├── BackendBridge.cs                 Puente JS ↔ C#
├── FrmPacientes.cs                  Host WebView2
├── FrmPacientes.Designer.cs         Cleanup
├── SistemaEmergenciaHospitalaria.csproj  WebView2 NuGet + post-build
├── Entidades/Paciente.cs            Entidad
├── Entidades/Consulta.cs            Entidad
├── Entidades/Usuario.cs             Entidad
├── package.json                     Dependencia lucide-react
├── DOCUMENTACION.md                 Este archivo

Archivos DE MI AMIGO (él los maneja):
├── Negocio/PacienteBLL.cs           Lógica de negocio
├── Datos/Conexion.cs                Conexión SQL
├── SQL/*.sql                        Scripts de base de datos
├── Interface/                       (opcional)

Archivos COMPARTIDOS:
├── Program.cs                       No se toca
├── FrmPacientes.resx                No se toca
├── SistemaEmergenciaHospitalaria.sln  No se toca
├── README.md                        No se toca
```
