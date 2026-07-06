using System.Net;
using System.Net.Sockets;
using System.Text;
using Microsoft.Web.WebView2.WinForms;
using Microsoft.Web.WebView2.Core;

namespace SistemaEmergenciaHospitalaria
{
    public partial class FrmPacientes : Form
    {
        private readonly WebView2 webView;
        private readonly BackendBridge backend;
        private CancellationTokenSource? _serverCts;

        public FrmPacientes()
        {
            InitializeComponent();

            Text = "Genesis Emergency System — Hospital Francisco Moscoso Puello";
            WindowState = FormWindowState.Maximized;

            var iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "icon.ico");
            if (!File.Exists(iconPath))
                iconPath = Path.Combine(Environment.CurrentDirectory, "icon.ico");
            if (File.Exists(iconPath))
                Icon = new Icon(iconPath);

            backend = new BackendBridge();
            webView = new WebView2 { Dock = DockStyle.Fill };

            webView.CoreWebView2InitializationCompleted += (s, e) =>
            {
                if (!e.IsSuccess)
                {
                    MessageBox.Show($"Error al inicializar WebView2: {e.InitializationException?.Message}", "Error",
                        MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                webView.CoreWebView2.Settings.IsWebMessageEnabled = true;
                webView.CoreWebView2.AddHostObjectToScript("backend", backend);
                webView.CoreWebView2.Navigate("http://localhost:9876");
            };

            Controls.Add(webView);
            webView.EnsureCoreWebView2Async();
            IniciarServidor();
        }

        private void IniciarServidor()
        {
            var wwwroot = BuscarRaizFrontend();
            if (wwwroot == null)
            {
                MessageBox.Show("No se encontró Desktop/dist/index.html.\nEjecute 'npm run build' en la carpeta Desktop/",
                    "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            _serverCts = new CancellationTokenSource();
            var ct = _serverCts.Token;

            _ = Task.Run(async () =>
            {
                var listener = new TcpListener(IPAddress.Loopback, 9876);
                listener.Start();

                try
                {
                    while (!ct.IsCancellationRequested)
                    {
                        var client = await listener.AcceptTcpClientAsync(ct);
                        _ = AtenderCliente(client, wwwroot, ct);
                    }
                }
                catch (OperationCanceledException) { }
                finally
                {
                    try { listener.Stop(); } catch { }
                }
            }, ct);
        }

        private static async Task AtenderCliente(TcpClient client, string wwwroot, CancellationToken ct)
        {
            using (client)
            {
                try
                {
                    var stream = client.GetStream();
                    using var reader = new StreamReader(stream, Encoding.UTF8);

                    var linea = await reader.ReadLineAsync(ct) ?? "";
                    if (!linea.StartsWith("GET "))
                    {
                        await Responder(stream, 400, "Bad Request");
                        return;
                    }

                    var ruta = linea.Split(' ')[1].TrimStart('/');
                    if (string.IsNullOrEmpty(ruta)) ruta = "index.html";

                    // Evitar directory traversal
                    ruta = ruta.Replace("..", "");
                    var archivo = Path.Combine(wwwroot, ruta);

                    if (!File.Exists(archivo))
                        archivo = Path.Combine(wwwroot, "index.html"); // SPA fallback

                    var ext = Path.GetExtension(archivo);
                    var contentType = ext switch
                    {
                        ".html" => "text/html; charset=utf-8",
                        ".js" => "application/javascript",
                        ".css" => "text/css",
                        ".svg" => "image/svg+xml",
                        ".png" => "image/png",
                        ".ico" => "image/x-icon",
                        ".json" => "application/json",
                        _ => "application/octet-stream"
                    };

                    var contenido = await File.ReadAllBytesAsync(archivo, ct);
                    var header = $"HTTP/1.1 200 OK\r\nContent-Type: {contentType}\r\nContent-Length: {contenido.Length}\r\nCache-Control: no-cache\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\n\r\n";
                    await stream.WriteAsync(Encoding.UTF8.GetBytes(header), ct);
                    await stream.WriteAsync(contenido, ct);
                }
                catch { /* cliente desconectado */ }
            }
        }

        private static async Task Responder(NetworkStream stream, int code, string msg)
        {
            var body = Encoding.UTF8.GetBytes(msg);
            var header = $"HTTP/1.1 {code} {msg}\r\nContent-Length: {body.Length}\r\nConnection: close\r\n\r\n";
            await stream.WriteAsync(Encoding.UTF8.GetBytes(header));
            await stream.WriteAsync(body);
        }

        private static string? BuscarRaizFrontend()
        {
            var baseDir = AppDomain.CurrentDomain.BaseDirectory;
            var curDir = Environment.CurrentDirectory;

            var candidatas = new List<string>
            {
                Path.Combine(curDir, "Desktop", "dist"),
                Path.Combine(curDir, "wwwroot"),
                Path.Combine(baseDir, "wwwroot"),
                Path.Combine(baseDir, "Desktop", "dist"),
            };

            var dir = new DirectoryInfo(baseDir);
            while (dir != null)
            {
                candidatas.Add(Path.Combine(dir.FullName, "Desktop", "dist"));
                dir = dir.Parent;
            }

            foreach (var c in candidatas.Distinct())
            {
                if (File.Exists(Path.Combine(c, "index.html")))
                    return c;
            }
            return null;
        }

        protected override void OnFormClosed(FormClosedEventArgs e)
        {
            _serverCts?.Cancel();
            base.OnFormClosed(e);
        }
    }
}
