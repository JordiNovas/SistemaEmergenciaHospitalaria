# Integración con WebView2 + WinForms

## Arquitectura

```
React (Vite) ──build──→ dist/ ─→ WebView2 en WinForms
                                     │
            window.chrome.webview.hostObjects.backend ←─ Clase C# expuesta
                                                               │
                                                        SqlConnection
                                                               │
                                                        SQL Server
```

## Build del frontend

```bash
cd Desktop && npm run build
```

Genera `dist/` con `index.html`, JS y CSS.

## Host WinForms mínimo

Crear un proyecto **Windows Forms (.NET 8)** con NuGet: `Microsoft.Web.WebView2`.

### Form1.cs

```csharp
using Microsoft.Web.WebView2.WinForms;
using Microsoft.Web.WebView2.Core;

public partial class Form1 : Form {
    private WebView2 webView;
    private BackendBridge backend;

    public Form1() {
        InitializeComponent();
        this.Text = "Genesis Emergency System";
        this.WindowState = FormWindowState.Maximized;

        backend = new BackendBridge();
        webView = new WebView2 { Dock = DockStyle.Fill };

        webView.CoreWebView2InitializationCompleted += (s, e) => {
            webView.CoreWebView2.Settings.IsWebMessageEnabled = true;
            webView.CoreWebView2.AddHostObjectToScript("backend", backend);
            webView.CoreWebView2.Navigate(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot", "index.html"));
        };

        this.Controls.Add(webView);
        webView.EnsureCoreWebView2Async();
    }
}
```

### BackendBridge.cs

```csharp
using System.Runtime.InteropServices;

[ClassInterface(ClassInterfaceType.AutoDispatch)]
public class BackendBridge {
    private PacienteBLL bll = new PacienteBLL();

    public string BuscarPaciente(string termino) {
        var dt = bll.BuscarPaciente(termino);
        return JsonSerializer.Serialize(dt);
    }

    public string RegistrarPaciente(string json) {
        var p = JsonSerializer.Deserialize<Paciente>(json);
        bool ok = bll.RegistrarPaciente(p);
        return JsonSerializer.Serialize(new { success = ok });
    }

    public string ValidarLogin(string cedula, string password) {
        // llamar a sp_ValidarLogin
    }

    // mismos patrones para los demás métodos
}
```

### Copiar build al proyecto WinForms

```xml
<!-- Post-build event en .csproj -->
<Target Name="CopyFrontend" AfterTargets="Build">
  <ItemGroup>
    <FrontendFiles Include="..\Desktop\dist\**\*" />
  </ItemGroup>
  <Copy SourceFiles="@(FrontendFiles)"
        DestinationFolder="$(OutputPath)\wwwroot\%(RecursiveDir)" />
</Target>
```

## Canales expuestos al frontend

El frontend llama mediante `window.chrome.webview.hostObjects.backend`:

| Método JS | Método C# | Descripción |
|-----------|-----------|-------------|
| `backend.BuscarPaciente(termino)` | `string BuscarPaciente(string)` | Retorna JSON array |
| `backend.RegistrarPaciente(json)` | `string RegistrarPaciente(string)` | Retorna `{"success": bool}` |
| `backend.ObtenerPacientes()` | `string ObtenerPacientes()` | Retorna JSON array |
| `backend.RegistrarConsulta(json)` | `string RegistrarConsulta(string)` | Retorna `{"success": bool}` |
| `backend.ObtenerConsultasDelDia(fecha)` | `string ObtenerConsultasDelDia(string)` | Retorna JSON array |
| `backend.ActualizarStatusConsulta(id, status)` | `string ActualizarStatusConsulta(int, string)` | Retorna `{"success": bool}` |
| `backend.ValidarLogin(cedula, password)` | `string ValidarLogin(string, string)` | Retorna `{"success": bool, usuario: ...}` |

## Modo desarrollo standalone

Sin WebView2, el frontend corre solo con `npm run dev` y usa datos mock. El `DataService` detecta automáticamente si está dentro de WebView2 y cambia al bridge C#.

Si quieren probar la integración sin WebView2, pueden montar una API HTTP mínima y setear `VITE_API_URL=http://localhost:5000` (el DataService también soporta ese fallback).
