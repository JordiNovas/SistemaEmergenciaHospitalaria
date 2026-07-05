using System;

namespace SistemaEmergenciaHospitalaria.Entidades
{
    public class Paciente
    {
        public int IdPaciente { get; set; }
        public string Cedula { get; set; } = string.Empty;
        public string? NSS { get; set; } // El NSS puede ser opcional (acepta NULL)
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public DateTime FechaNacimiento { get; set; }
        public string Sexo { get; set; } = string.Empty;
        public string MotivoConsulta { get; set; } = string.Empty;
        public DateTime HoraLlegada { get; set; }
        public string Estado { get; set; } = string.Empty;
    }
}