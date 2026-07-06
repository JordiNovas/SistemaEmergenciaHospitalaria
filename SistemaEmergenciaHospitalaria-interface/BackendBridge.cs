using System.Collections;
using System.Data;
using System.Runtime.InteropServices;
using System.Text.Json;
using SistemaEmergenciaHospitalaria.Entidades;
using SistemaEmergenciaHospitalaria.Negocio;

namespace SistemaEmergenciaHospitalaria;

[ClassInterface(ClassInterfaceType.AutoDispatch)]
public class BackendBridge
{
    private readonly PacienteBLL _pacienteBll = new();
    private readonly JsonSerializerOptions _jsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    // ── PACIENTES ──

    public string BuscarPaciente(string termino)
    {
        try
        {
            var dt = _pacienteBll.BuscarPaciente(termino);
            return Json(DataTableToList(dt));
        }
        catch (Exception ex)
        {
            return Error(ex);
        }
    }

    public string RegistrarPaciente(string json)
    {
        try
        {
            var data = JsonDocument.Parse(json).RootElement;
            var p = new Paciente
            {
                Cedula = GetString(data, "cedula") ?? "",
                NombreCompleto = GetString(data, "nombre") ?? "",
                FechaNacimiento = ParseDate(GetString(data, "fechaNacimiento")),
                Sexo = GetString(data, "sexo"),
                TipoSangre = GetString(data, "tipoSangre"),
                TelefonoContacto = GetString(data, "telefono"),
                Alergias = GetString(data, "alergias")
            };

            var id = _pacienteBll.RegistrarPaciente(p);
            return Ok(new { success = id > 0, pacienteId = id });
        }
        catch (Exception ex)
        {
            return Error(ex);
        }
    }

    public string ObtenerPacientes()
    {
        try
        {
            var dt = _pacienteBll.BuscarPaciente("");
            return Json(DataTableToList(dt));
        }
        catch (Exception ex)
        {
            return Error(ex);
        }
    }

    // ── CONSULTAS ──

    public string RegistrarConsulta(string json)
    {
        try
        {
            var data = JsonDocument.Parse(json).RootElement;

            var pacienteCedula = GetString(data, "pacienteCedula") ?? "";
            var pacienteDt = _pacienteBll.BuscarPaciente(pacienteCedula);
            if (pacienteDt.Rows.Count == 0)
                return Json(new { success = false, error = "Paciente no encontrado" });
            var pacienteId = Convert.ToInt32(pacienteDt.Rows[0]["PacienteID"]);

            var c = new Consulta
            {
                PacienteID = pacienteId,
                FechaHoraLlegada = ParseDateTime(GetString(data, "horaLlegada")),
                ModoLlegada = GetString(data, "modoLlegada"),
                NivelTriage = GetString(data, "triage"),
                MotivoConsulta = GetString(data, "motivoConsulta") ?? "",
                PresionArterial = GetString(data, "presionArterial"),
                FrecuenciaCardiaca = ParseInt(GetString(data, "frecuenciaCardiaca")),
                FrecuenciaRespiratoria = ParseInt(GetString(data, "frecuenciaRespiratoria")),
                Temperatura = ParseDecimal(GetString(data, "temperatura")),
                SaturacionOxigeno = ParseInt(GetString(data, "saturacionO2")),
                Peso = ParseDecimal(GetString(data, "peso")),
                Talla = ParseDecimal(GetString(data, "talla")),
                Observaciones = GetString(data, "observaciones"),
                Estado = "En espera"
            };

            var consultaId = _pacienteBll.RegistrarConsulta(c);
            return Ok(new { success = consultaId > 0, consultaId });
        }
        catch (Exception ex)
        {
            return Error(ex);
        }
    }

    public string ObtenerConsultasDelDia(string fecha)
    {
        try
        {
            var dt = _pacienteBll.ObtenerSalaEspera();
            return Json(DataTableToList(dt));
        }
        catch (Exception ex)
        {
            return Error(ex);
        }
    }

    public string ActualizarStatusConsulta(int id, string status)
    {
        try
        {
            var c = new Consulta { ConsultaID = id, Estado = status ?? "En espera" };
            var ok = _pacienteBll.ActualizarConsulta(c);
            return Ok(new { success = ok });
        }
        catch (Exception ex)
        {
            return Error(ex);
        }
    }

    // ── AUTH ──

    public string ValidarLogin(string cedula, string password)
    {
        try
        {
            var dt = _pacienteBll.ValidarLogin(cedula, password);
            if (dt.Rows.Count > 0)
            {
                var row = dt.Rows[0];
                return Json(new
                {
                    success = true,
                    usuario = new
                    {
                        cedula = row["Cedula"]?.ToString(),
                        nombre = row["NombreCompleto"]?.ToString(),
                        rol = row["Rol"]?.ToString()
                    }
                });
            }
            return Json(new { success = false, error = "Credenciales inválidas" });
        }
        catch (Exception ex)
        {
            return Error(ex);
        }
    }

    // ── HELPERS ──

    private static List<Dictionary<string, object?>> DataTableToList(DataTable dt)
    {
        var list = new List<Dictionary<string, object?>>(dt.Rows.Count);
        foreach (DataRow row in dt.Rows)
        {
            var dict = new Dictionary<string, object?>(dt.Columns.Count);
            foreach (DataColumn col in dt.Columns)
            {
                var value = row[col];
                dict[col.ColumnName] = value == DBNull.Value ? null : value;
            }
            list.Add(dict);
        }
        return list;
    }

    private static string? GetString(JsonElement data, string key)
    {
        if (data.TryGetProperty(key, out var prop) && prop.ValueKind == JsonValueKind.String)
            return prop.GetString();
        return null;
    }

    private static int? ParseInt(string? value)
    {
        if (string.IsNullOrEmpty(value)) return null;
        if (int.TryParse(value, out var result)) return result;
        return null;
    }

    private static decimal? ParseDecimal(string? value)
    {
        if (string.IsNullOrEmpty(value)) return null;
        if (decimal.TryParse(value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var result)) return result;
        return null;
    }

    private static DateTime ParseDate(string? value)
    {
        if (string.IsNullOrEmpty(value)) return DateTime.MinValue;
        if (DateTime.TryParse(value, out var dt)) return dt;
        return DateTime.MinValue;
    }

    private static DateTime ParseDateTime(string? timeValue)
    {
        var today = DateTime.Today;
        if (string.IsNullOrEmpty(timeValue)) return today;
        if (TimeSpan.TryParse(timeValue, out var time))
            return today.Add(time);
        if (DateTime.TryParse(timeValue, out var dt))
            return dt;
        return today;
    }

    private string Json(object obj)
    {
        return JsonSerializer.Serialize(obj, _jsonOpts);
    }

    private string Ok(object? extra = null)
    {
        return extra != null
            ? Json(new { success = true, data = extra })
            : Json(new { success = true });
    }

    private string Error(Exception ex)
    {
        return Json(new { success = false, error = ex.Message });
    }
}
