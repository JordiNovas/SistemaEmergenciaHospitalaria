# Historia de Construcción del Frontend

## Genesis Emergency System — Frontend React

---

## 1. Visión General

Sistema de gestión de emergencias hospitalarias para el **Hospital Francisco Moscoso Puello** (República Dominicana). El frontend es una SPA (Single Page Application) construida con **React 19** que corre dentro de un control **WebView2** en una aplicación **Windows Forms (.NET 8)**.

### Propósito

Reemplazar formularios en papel y procesos manuales con una interfaz digital para:
- Registro de pacientes con datos personales
- Clasificación por triage (5 niveles: Rojo → Azul)
- Registro de signos vitales
- Consultas con historial
- Visualización del flujo de pacientes del día

---

## 2. Stack Tecnológico y Justificación

| Tecnología | Versión | ¿Por qué? |
|------------|---------|-----------|
| **React 19** | ^19.2.7 | Última versión estable con concurrent features, ideal para UI reactiva |
| **Vite 8** | ^8.1.1 | Build ultra-rápido, HMR instantáneo, bundle pequeño |
| **React Router 7** | ^7.18.1 | Enrutamiento SPA declarativo con nested routes |
| **Lucide React** | ^1.23.0 | Iconos ligeros, tree-shakeable, consistencia visual |
| **WebView 2** | — | Hospeda React dentro de WinForms, comunicación bidireccional con C# |

**¿Por qué no TypeScript?** El proyecto optó por JSX plano para simplicidad en un equipo pequeño que prioriza rapidez de desarrollo sobre tipado estático.

---

## 3. Estructura del Proyecto

```
Desktop/
├── index.html              # Entry point HTML (Vite)
├── package.json            # Dependencias y scripts
├── vite.config.js          # Configuración de Vite
├── HISTORIA-FRONTEND.md    # Este documento
├── public/                 # Assets estáticos
├── dist/                   # Build de producción (generado)
└── src/
    ├── main.jsx            # Punto de entrada React
    ├── App.jsx             # Raíz: Router + Auth + Layout
    ├── App.css             # Estilos globales + imports de CSS
    ├── index.css           # Reset y estilos base
    ├── components/         # Componentes de UI
    │   ├── layout/
    │   │   ├── Layout.jsx  # Barra superior + sidebar + footer
    │   │   └── Layout.css
    │   ├── HomePage.jsx/.css        # Dashboard principal
    │   ├── LoginPage.jsx/.css       # Pantalla de login
    │   ├── RegistroPage.jsx         # Registro de pacientes
    │   ├── ConsultaPage.jsx         # Consulta clínica + triage
    │   ├── PersonalDataForm.jsx     # Formulario de datos personales
    │   ├── ClinicalEntryForm.jsx    # Formulario de entrada clínica
    │   ├── TriageSelector.jsx       # Selector visual de triage
    │   ├── Calendar.jsx             # Selector de fecha
    │   ├── HelpButton.jsx           # Botón de ayuda (atajos)
    │   ├── Toast.jsx/.css           # Notificaciones toast
    │   ├── ErrorBoundary.jsx        # Captura de errores React
    │   └── ProtectedRoute.jsx       # Guardia de autenticación
    ├── context/
    │   └── AuthContext.jsx           # Estado de autenticación global
    ├── hooks/
    │   ├── useForm.js               # Hook de formularios + validación
    │   ├── useClock.js              # Hook del reloj (actualiza cada segundo)
    │   └── useClickOutside.js       # Hook para cerrar al hacer clic fuera
    ├── data/
    │   ├── constants.js             # Constantes (triage, opciones, signosVitalesFields, etc.)
    │   ├── pacientes.js             # Mock de pacientes (7 registros)
    │   ├── consultas.js             # Mock + CRUD en RAM (add, update, getByPaciente, etc.)
    │   └── usuarios.js              # Mock de usuarios (3 personas)
    ├── services/
    │   └── api.js                   # Capa de datos (bridge C# / HTTP / mock)
    ├── styles/
    │   ├── forms.css                # Estilos de formularios (cards, inputs, triage, signos)
    │   └── components.css           # Estilos de componentes (sidebar, search, modal)
    └── utils/
        ├── validators.js            # Validación de cédula (11 dígitos) y teléfono (809/829/849)
        └── formatters.js            # Formatos de fecha, hora, edad
```

---

## 4. Secuencia de Construcción (Paso a Paso)

### Fase 1: Andamiaje del Proyecto

```bash
npm create vite@latest Desktop -- --template react
cd Desktop
npm install react-router-dom lucide-react
```

**`vite.config.js`** se configuró con:
- `base: './'` — rutas relativas para que funcione desde WebView2 con `file://`
- `outDir: 'dist'` — directorio de salida estándar

### Fase 2: Sistema de Rutas y Layout Base

Se construyó `App.jsx` como el componente raíz con:

1. **`BrowserRouter`** — maneja la navegación SPA
2. **`AuthProvider`** — contexto de autenticación (envuelve todo)
3. **Layout de autenticación** — `LoginGate` redirige a `/inicio` si ya hay sesión

Rutas definidas:
- `/login` → `LoginGate` (LoginPage si no hay sesión, redirect si ya hay)
- `/inicio` → `HomePage` (protegida)
- `/registro` → `RegistroPage` (protegida)
- `/consulta` → `ConsultaPage` (protegida)
- `*` → redirect a `/login`

### Fase 3: Autenticación

**`AuthContext.jsx`** — Contexto de React que expone:
- `user` — objeto del usuario logueado (o null)
- `login(cedula)` — busca usuario en mock y setea estado
- `logout()` — limpia sesión
- `usuarios` — lista completa de usuarios

**`ProtectedRoute.jsx`** — Componente wrapper que verifica `user` y redirige a `/login` si no hay sesión.

**`LoginPage.jsx`** — Pantalla de login con:
- Selector de usuarios (dropdown con formato "Nombre · Rol")
- Input de contraseña (validación client-side: usuario requerido, contraseña requerida)
- Vista previa del usuario seleccionado (avatar, nombre, rol en fondo azul claro)
- Muestra la contraseña de prueba del usuario seleccionado (útil para desarrollo)
- Botón de inicio de sesión deshabilitado hasta seleccionar usuario y escribir contraseña

### Fase 4: Layout Principal (Topbar + Footer)

**`Layout.jsx`** es el layout que envuelve las páginas principales mediante `ProtectedRoute`. Incluye:

- **Topbar**: Logo del sistema (Activity icon), navegación principal (Inicio, Registro, Consulta con botones activos), reloj en vivo, info del usuario con avatar, botón de logout
- **`app__content`**: Contenedor flexible con `overflow: hidden` — el scroll se maneja por página (HomePage tiene `overflow-y: auto` propio)
- **Footer**: Versión (Genesis Emergency System v1.0), reloj, contadores de flujo (en espera, en atención, atendidos con iconos)
- **Atajos de teclado**: `Alt+1/2/3` para navegar, `Ctrl+K` para buscar (si hay input de búsqueda lo enfoca, si no, navega a Registro), `Alt+L` para logout, `Escape` para cerrar toasts
- **Toast**: Notificaciones temporales con auto-destrucción a los 3 segundos

### Fase 5: Dashboard (HomePage + Footer)

**`HomePage.jsx`** — Panel principal con:

1. **Welcome**: Saludo al usuario con nombre y rol
2. **Stats Cards** (4 paneles): Pacientes hoy, En espera, En atención, Atendidos hoy
   - Cada uno con color distintivo (azul, amarillo, naranja, verde)
   - Fondo suave del color correspondiente
3. **Acciones rápidas**: Tarjetas para "Registrar Paciente" (icono UserPlus, azul) y "Nueva Consulta" (icono Stethoscope, púrpura)
4. **Pacientes de Hoy**: Columnas Kanban (En Espera, En Atención, Atendido)
   - Cada columna con borde superior de color y contador
   - Estado vacío con placeholder si no hay consultas
   - Targetas de consulta con indicador de triage (círculo de color), nombre, motivo (truncado 60 chars), hora de llegada

**Footer (`Layout.jsx`)** — Barra inferior con:
- Versión del sistema
- Reloj en vivo
- Contadores de flujo: en espera (amarillo), en atención (naranja), atendidos (verde)

### Fase 6: Formularios y Validación

**`useForm.js`** — Hook personalizado que maneja:

- **Estado del formulario**: `formData` con todos los campos
- **Errores**: `errors` con mensajes por campo
- **`updateField(field, value)`**: Actualiza un campo y limpia su error si hay valor
- **`validate()`**: Validación de datos personales (nombre, cédula, fecha, teléfono, tipo sangre, sexo)
- **`validateConsulta()`**: Validación de consulta (motivo, hora, signos vitales condicionales)
- **`resetForm()`**: Reinicia todo el formulario
- **`loadPatient(paciente, prevFormData)`**: Carga datos de un paciente existente

**Validación de cédula dominicana** (`validators.js`):
- 11 dígitos numéricos
- Formato automático `000-0000000-0`

**Validación de teléfono**:
- 10 dígitos
- Código de área válido (809, 829, 849)

### Fase 7: Registro de Pacientes (RegistroPage)

**`RegistroPage.jsx`** — Pantalla dividida en:

1. **Panel lateral izquierdo**: Buscador de pacientes + lista de resultados con badge de fecha
   - Muestra avatar, nombre, cédula, tipo de sangre (con badge de color), edad
   - Al seleccionar, carga los datos en el formulario
   - Botón "Nuevo paciente sin registro" en el footer del panel
   - Estado vacío con hint "Intente con otro término de búsqueda"
2. **Panel principal**: Formulario de datos personales
   - Componente `PersonalDataForm` reutilizable
   - Botones Guardar/Cancelar (con confirmación si hay datos ingresados)
   - Mensaje de éxito con icono CheckCircle al guardar
   - Botón "← Volver al inicio" en la parte superior

### Fase 8: Consulta Clínica (ConsultaPage)

**`ConsultaPage.jsx`** — Pantalla más compleja con:

1. **Panel lateral**: Búsqueda y selección de paciente
2. **Formulario clínico**: Componente `ClinicalEntryForm` que incluye:
   - Hora de llegada (automática, input time)
   - Modo de llegada (select: Propios medios, Ambulancia, Transferido, Policía, Otro)
   - Nivel de triage (selector visual de 5 niveles con punto pulsante en I y II)
   - Alergias conocidas (grid de checkboxes con 10 opciones: Penicilina, Cefalosporinas, Sulfa, Aspirina, AINEs, Anestésicos, Opioides, Látex, Contrastes yodados, Ninguna conocida)
   - Motivo de consulta (textarea con contador 0/1000)
   - **Signos vitales** (7 campos en grid: Presión Arterial, FC, FR, Temp, SpO2, Peso, Talla — cada uno con sufijo de unidad y validación de rango numérico)
   - **Bypass de signos vitales**: Para triage I (Rojo) — banner "EMERGENCIA MÁXIMA — BYPASS ACTIVADO" y II (Naranja) — banner "URGENCIA MAYOR — BYPASS ACTIVADO", los signos vitales se ocultan y el paciente pasa directo a atención prioritaria
   - Observaciones (textarea con contador 0/500)
3. **Historial de consultas**: Lista de consultas previas del paciente ordenadas por fecha descendente, con triage (círculo de color), motivo (truncado 80 chars), fecha/hora, estado, y badge "BYPASS" si aplica
4. **Modal de detalle**: Al hacer clic en una consulta previa abre modal con todos los datos: paciente, cédula, fecha/hora, modo de llegada, triage con descripción, motivo, alergias, signos vitales (grid de 7 campos) o bypass banner, observaciones, estado, y botón de toggle bypass

### Fase 9: Datos Mock y Capa de Servicio

**`data/`** — Datos de prueba:
- `pacientes.js`: 7 pacientes de ejemplo (María Rodríguez, Carlos Méndez, Ana Jiménez, etc.) con nombre, cédula, sangre, edad, avatar, teléfono, sexo, fecha de nacimiento
- `usuarios.js`: 3 usuarios (Dra. María Vargas - Médico, Lic. Ana Jiménez - Recepcionista, Enf. Carlos Méndez - Enfermero)
- `consultas.js`: Array en memoria con funciones: `addConsulta`, `updateConsultaStatus`, `updateConsultaField`, `getConsultasByPaciente`, `getConsultasDelDia`, `getConsultasResumen`

**`services/api.js`** — Capa de abstracción que detecta automáticamente:
1. **Bridge WebView2**: `window.chrome.webview.hostObjects.backend` → llama métodos C# mediante `invoke()` que serializa/deserializa JSON
2. **API HTTP**: Si `VITE_API_URL` está definida, hace fetch POST REST
3. **Modo offline**: Lanza `DataError` (los datos mock locales se usan en desarrollo)

### Fase 10: Estilos y Sistema de Diseño

**CSS vanilla** (sin frameworks) organizado en:

- **`index.css`**: Reset, variables CSS, estilos base (body, fuentes)
- **`App.css`**: Imports de `forms.css` y `components.css`
- **`forms.css`**: Estilos de tarjetas, labels, inputs, botones, tabs, signos vitales, modal, layout
- **`components.css`**: Panel lateral (`.pl`), subbarra de búsqueda, estilos de consultas
- **Archivos por componente**: `HomePage.css`, `LoginPage.css`, `Layout.css`, `Toast.css`

Paleta de colores principal:
- Primario: `#3b82f6` (azul)
- Fondo: `#f8fafc`
- Texto fuerte: `#1e293b`
- Texto suave: `#64748b`
- Bordes: `#e2e8f0`

Colores de triage (consistentes con estándares hospitalarios):
- Rojo `#dc2626` — Resucitación (I)
- Naranja `#ea580c` — Emergencia (II)
- Amarillo `#eab308` — Urgente (III)
- Verde `#16a34a` — Semi-urgente (IV)
- Azul `#2563eb` — No urgente (V)

---

## 5. Flujo de Datos

```
Usuario Interactúa
       ↓
  Componente React
       ↓
  useForm() / useState
       ↓
  DataService (api.js)
       ↓
  ┌───────┴────────┐
  ↓                 ↓
Bridge WebView2   Mock Data
(window.chrome.   (data/*.js)
 webview.host
 .Objects.backend)
```

### Flujo de Autenticación

```
LoginPage → AuthContext.login(cedula)
              → busca en usuarios mock
              → setUser(found)
                → LoginGate detecta user !== null
                  → Navigate to /inicio
                    → ProtectedRoute permite acceso
                      → Layout + HomePage se renderizan
```

### Flujo de Registro de Consulta

```
ConsultaPage
  → Selector lateral: selecciona paciente
    → loadPatient() carga datos en useForm
      → ClinicalEntryForm muestra formulario
        → Usuario llena datos (triage, signos, etc.)
          → handleSave()
            → validateConsulta() verifica campos
              → addConsulta() guarda en array mock
                → Reset del formulario + toast de éxito
```

---

## 6. Decisiones de Diseño Clave

### ¿Por qué CSS vanilla y no Tailwind?

El proyecto prioriza que estudiantes puedan leer y entender el CSS sin depender de un framework de utilidades. Cada clase tiene un nombre semántico (BEM-like: `bloque__elemento--modificador`).

### ¿Por qué WebView2 y no una API REST standalone?

El sistema corre en un entorno hospitalario cerrado sin conexión a internet. WebView2 permite embeber la UI moderna de React dentro de la aplicación WinForms existente, comunicándose directamente con SQL Server a través de C#.

### Bypass de Signos Vitales

Decisión clínica: pacientes con triage I (Rojo) o II (Naranja) requieren atención inmediata. Registrar signos vitales en ese momento retrasaría la atención. El sistema permite "bypassear" esos campos:

- Triage I: banner rojo "EMERGENCIA MÁXIMA — BYPASS ACTIVADO"
- Triage II: banner naranja "URGENCIA MAYOR — BYPASS ACTIVADO"
- Signos vitales se reemplazan por mensaje: "Clasificación por ojo clínico. El paciente pasa al tope de la lista de atención inmediata."
- Botón de guardar cambia a "Registrar Emergencia"
- En el detalle de consulta se muestra un banner "BYPASS DE SIGNOS VITALES ACTIVADO" con opción de toggle

### Datos Mock

Todo el frontend funciona 100% offline con datos de prueba. La capa `api.js` abstrae el origen de datos, permitiendo que el mismo código funcione con datos mock, API HTTP, o el bridge C# real sin cambios.

---

## 7. Comandos Útiles

```bash
# Desarrollo (hot reload)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

El build genera `dist/` que se copia al proyecto WinForms mediante un post-build event configurado en el `.csproj`.

---

## 8. Integración con Backend (WebView2)

El frontend se hospeda dentro de un control WebView2 en `FrmPacientes.cs`:

```csharp
webView.CoreWebView2.AddHostObjectToScript("backend", new BackendBridge());
webView.CoreWebView2.Navigate(Path.Combine(baseDir, "wwwroot", "index.html"));
```

### Capa de Abstracción (api.js)

El `DataService` (`services/api.js`) abstrae el origen de datos con 3 modos auto-detectados:

1. **Bridge WebView2**: `window.chrome.webview.hostObjects.backend` → llama métodos C# mediante `invoke()` que serializa/deserializa JSON automáticamente
2. **API HTTP**: Si `VITE_API_URL` está definida, hace fetch POST a esa URL
3. **Modo offline**: Lanza `DataError` (los datos mock locales se usan en desarrollo)

```js
const result = await DataService.registrarConsulta(jsonData);
```

### Desde JavaScript se accede directamente al bridge con:

```js
const result = await window.chrome.webview.hostObjects.backend.RegistrarPaciente(jsonData);
```

La clase `BackendBridge.cs` expone métodos decorados con `[ClassInterface(ClassInterfaceType.AutoDispatch)]`, y cada método recibe/retorna JSON serializado.

### Post-Build

El build de React genera `Desktop/dist/`. Al compilar el proyecto C#, el `.csproj` copia `dist/` al directorio `wwwroot/` del output mediante un Target post-build.

---

## 9. Glosario de Componentes

| Componente | Ruta | Propósito |
|------------|------|-----------|
| `App` | `App.jsx` | Raíz: Router + Providers |
| `Layout` | `layout/Layout.jsx` | Topbar + Footer + atajos |
| `LoginPage` | `LoginPage.jsx` | Pantalla de inicio de sesión |
| `HomePage` | `HomePage.jsx` | Dashboard con stats + flujo |
| `RegistroPage` | `RegistroPage.jsx` | Registro de pacientes |
| `ConsultaPage` | `ConsultaPage.jsx` | Consulta clínica con triage |
| `PersonalDataForm` | `PersonalDataForm.jsx` | Formulario de datos personales |
| `ClinicalEntryForm` | `ClinicalEntryForm.jsx` | Formulario clínico + signos vitales |
| `TriageSelector` | `TriageSelector.jsx` | Selector visual de 5 niveles |
| `ProtectedRoute` | `ProtectedRoute.jsx` | Guardia de ruta |
| `ErrorBoundary` | `ErrorBoundary.jsx` | Captura de errores |
| `Toast` | `Toast.jsx` | Notificaciones |
| `HelpButton` | `HelpButton.jsx` | Ayuda con atajos de teclado |
| `Calendar` | `Calendar.jsx` | Selector de fecha |
| `AuthProvider` | `context/AuthContext.jsx` | Contexto de autenticación |
| `useForm` | `hooks/useForm.js` | Hook de formularios + validación |
| `useClock` | `hooks/useClock.js` | Hook del reloj en vivo |
| `useClickOutside` | `hooks/useClickOutside.js` | Hook para cerrar al hacer clic fuera |
| `DataService` | `services/api.js` | Capa de datos (bridge C# / HTTP / offline) |
| `validateCedula` | `utils/validators.js` | Validación de cédula (11 dígitos) |
| `formatCedula` | `utils/validators.js` | Auto-formato 000-0000000-0 |
| `validatePhone` | `utils/validators.js` | Validación de teléfono (809/829/849) |
| `formatPhone` | `utils/validators.js` | Auto-formato (809) 000-0000 |

---

## 10. Posibles Mejoras Futuras

- Migrar a TypeScript para mejor mantenibilidad
- Agregar tests unitarios (Jest + React Testing Library)
- Conexión real a SQL Server vía WebView2 bridge
- Reportes y estadísticas
- Pantalla de administración de usuarios
- Soporte multilingüe (ES/EN)
- Tema oscuro
- Notificaciones en tiempo real (SignalR / WebSockets)
- Firma digital de documentos
- Integración con farmacia y laboratorio
