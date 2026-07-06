# Genesis Emergency System — Frontend

Interfaz de usuario para el Sistema de Emergencia Hospitalaria, construida con **React 19 + Vite 8**.

---

## Requisitos

- **Node.js** 20 o superior
- **npm** 10 o superior

## Instalación

```bash
cd Desktop
npm install
```

## Desarrollo (sin backend)

```bash
npm run dev
```

Abre `http://localhost:5173` en el navegador. Sin WebView2, el frontend usa **datos mock** locales basados en el script `Scripts/Hospital_DatosPrueba.sql`.

**Usuarios de prueba:**

| Usuario | Cédula | Contraseña | Rol |
|---------|--------|------------|-----|
| Laura Martinez | `00100000001` | `1234` | Enfermera |
| Dr. Alan Bertrand | `00100000002` | `1234` | Medico |
| Admin Sistema | `00100000003` | `1234` | Administrador |

**Pacientes de prueba:** Ana Lucía Jiménez, Carlos Mendoza, Pedro Ramírez.

## Build para producción

```bash
npm run build
```

Genera la carpeta `dist/` con el frontend listo para producción.

## Integración con WinForms + WebView2

El frontend se carga dentro de un control **WebView2** en la aplicación de Windows Forms.

1. Haz build del frontend: `npm run build`
2. Compila el proyecto C#: `dotnet build` (o desde Visual Studio)
3. La clase `BackendBridge.cs` se expone al JavaScript mediante `window.chrome.webview.hostObjects.backend`
4. El `dist/` se copia automáticamente a `wwwroot/` en el output del proyecto

## Arquitectura

```
React (Vite)
    │  npm run build → dist/
    │
    ▼  window.chrome.webview.hostObjects.backend.*
BackendBridge.cs (C#, expuesto al JS)
    │
    ▼
PacienteBLL.cs (lógica de negocio)
    │
    ▼
SQL Server (stored procedures)
```

## Canales API (bridge C# ↔ JS)

| JS | C# | Descripción |
|----|-----|-------------|
| `BuscarPaciente(termino)` | `string BuscarPaciente(string)` | Búsqueda por nombre/cédula |
| `RegistrarPaciente(json)` | `string RegistrarPaciente(string)` | Crear paciente |
| `ObtenerPacientes()` | `string ObtenerPacientes()` | Todos los pacientes |
| `RegistrarConsulta(json)` | `string RegistrarConsulta(string)` | Crear consulta con triage |
| `ObtenerConsultasDelDia(fecha)` | `string ObtenerConsultasDelDia(string)` | Consultas del día |
| `ActualizarStatusConsulta(id, status)` | `string ActualizarStatusConsulta(int, string)` | Cambiar estado |
| `ValidarLogin(cedula, password)` | `string ValidarLogin(string, string)` | Autenticación |

## Estructura del proyecto

```
Desktop/
├── index.html              # Entry point HTML
├── package.json
├── vite.config.js
├── dist/                   # Build output (generado)
└── src/
    ├── main.jsx            # Punto de entrada React
    ├── App.jsx             # Rutas y layout
    ├── App.css
    ├── index.css           # CSS global
    ├── components/         # Componentes React
    │   ├── layout/Layout.jsx    # Barra superior, footer, atajos
    │   ├── LoginPage.jsx        # Pantalla de login
    │   ├── HomePage.jsx         # Dashboard con estadísticas
    │   ├── RegistroPage.jsx     # Registro de pacientes
    │   ├── ConsultaPage.jsx     # Consulta clínica con triage
    │   ├── PersonalDataForm.jsx # Formulario de datos personales
    │   ├── ClinicalEntryForm.jsx # Formulario de entrada clínica
    │   ├── TriageSelector.jsx   # Selector de nivel de triage
    │   ├── Calendar.jsx         # Calendario para fechas
    │   ├── ErrorBoundary.jsx    # Captura de errores
    │   └── ...
    ├── context/AuthContext.jsx  # Contexto de autenticación
    ├── hooks/               # Custom hooks
    │   ├── useForm.js       # Manejo de formularios y validación
    │   └── ...
    ├── services/
    │   └── api.js           # Capa de comunicación con el backend
    ├── data/                # Datos mock y constantes
    │   ├── pacientes.js     # Pacientes de prueba
    │   ├── consultas.js     # Consultas mock
    │   ├── usuarios.js      # Usuarios mock
    │   └── constants.js     # Constantes compartidas
    ├── utils/
    │   ├── formatters.js    # Formateo de fechas/horas
    │   ├── validators.js    # Validación de cédula/teléfono
    │   └── mappings.js      # Mapeo frontend → backend
    └── styles/
        ├── forms.css        # Estilos de formularios
        └── components.css   # Estilos de componentes
```

## Atajos de teclado

| Tecla | Acción |
|-------|--------|
| `Ctrl+K` | Enfocar búsqueda / Ir a registro |
| `Alt+1` | Inicio |
| `Alt+2` | Registro de pacientes |
| `Alt+3` | Consulta clínica |
| `Alt+L` | Cerrar sesión |
| `Escape` | Cerrar notificación |

## Mapeo de valores

El frontend envía valores en formato amigable y `api.js` los traduce automáticamente al formato que espera la base de datos:

| Frontend | Base de datos |
|----------|---------------|
| `Propios medios` | `Por pie propio` |
| `I`, `II`, `III`, `IV`, `V` | `Rojo`, `Naranja`, `Amarillo`, `Verde`, `Azul` |
| `pendiente` | `En espera` |
| `en_atencion` | `En atencion` |
| `atendido` | `Atendido` |

## Solución de problemas

### `vite is not recognized`

```bash
npm install
```

### El frontend no se conecta al backend

Verifica que la aplicación WinForms esté corriendo y que el WebView2 esté cargando correctamente el `index.html`. En modo desarrollo (`npm run dev`), el frontend usa datos mock automáticamente.

### Error en el build de Vite/rolldown

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Los stored procedures fallan con Peso/Talla/Observaciones

Ejecuta `Scripts/Hospital.sql` completo — las columnas y parámetros ya están incluidos en la última versión.
