using System;

namespace SistemaEmergenciaHospitalaria.Entidades
{
    public class Paciente
    {
        public int PacienteID { get; set; }
        public string Cedula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public DateTime FechaNacimiento { get; set; }
        public string? TipoSangre { get; set; }
        public string? Sexo { get; set; }
        public string? TelefonoContacto { get; set; }
        public string? Alergias { get; set; }
        public DateTime FechaRegistro { get; set; }
    }
}