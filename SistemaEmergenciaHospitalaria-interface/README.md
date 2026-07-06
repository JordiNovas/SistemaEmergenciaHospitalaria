# Genesis Emergency System

Sistema de Gestión de Emergencias Hospitalarias — aplicación de escritorio con **C# (.NET 8) + Windows Forms + WebView2** para el frontend en **React** y **SQL Server**.

## Arquitectura

```
React (Vite) ──build──→ dist/ ─→ WebView2 en WinForms
                                     │
            BackendBridge.cs ←── window.chrome.webview.hostObjects.backend
                                     │
                               PacienteBLL.cs
                                     │
                               SQL Server
```

## Tecnologías

- **C# .NET 8** — Lógica de negocio y capa de datos
- **Windows Forms** — Ventana principal (host del WebView2)
- **React 19 + Vite 8** — Interfaz de usuario moderna
- **WebView2** — Integración frontend/backend
- **SQL Server** — Base de datos con stored procedures
- **Microsoft.Data.SqlClient** — Conexión a BD

## Inicio rápido

### 1. Base de datos

Ejecuta `Scripts/Hospital.sql` en SQL Server Management Studio para crear la base de datos, tablas y stored procedures.

Opcional: `Scripts/Hospital_DatosPrueba.sql` inserta datos de prueba.

### 2. Frontend

```bash
cd Desktop
npm install
npm run build
```

### 3. Backend

Abre `SistemaEmergenciaHospitalaria.sln` en Visual Studio y ejecuta. El WebView2 carga el frontend desde `wwwroot/index.html`.

## Desarrollo del frontend solo

```bash
cd Desktop
npm run dev
```

Abre `http://localhost:5173` — funciona con datos mock sin necesidad del backend.

## Estructura del proyecto

```
SistemaEmergenciaHospitalaria-interface/
├── Desktop/                    # Frontend React
│   ├── src/                   # Código fuente
│   └── README.md              # Documentación del frontend
├── Entidades/                 # Clases C# (Paciente, Consulta, Usuario)
├── Negocio/                   # Lógica de negocio (PacienteBLL)
├── Datos/                     # Capa de datos (Conexion)
├── Scripts/                   # Scripts SQL
│   ├── Hospital.sql           # Esquema completo + stored procedures
│   └── Hospital_DatosPrueba.sql
├── BackendBridge.cs           # Puente C# ↔ JavaScript
├── FrmPacientes.cs            # Ventana WinForms con WebView2
└── SistemaEmergenciaHospitalaria.csproj
```

## Usuarios de prueba (en BD)

| Usuario | Cédula | Contraseña | Rol |
|---------|--------|------------|-----|
| Laura Martinez | `00100000001` | `1234` | Enfermera |
| Dr. Alan Bertrand | `00100000002` | `1234` | Medico |
| Admin Sistema | `00100000003` | `1234` | Administrador |

## Equipo

- Jolfreilyn Amancio Abad (2025-1060)
- Jordi Alexander Novas Franco (2023-1205)
- Angel Francisco Rosa Delgado (2025-0014)
- Esmeralda Tais Soto Escolastico (2024-1861)
- Gian Perez (2025-1142)
- Iverson O'neal Vargas De Leon (2024-2512)
- Alan Enmanuel Bertrand Rosa (2025-1053)

---

**Proyecto desarrollado como práctica de la metodología Scrum utilizando Jira y GitHub.**
