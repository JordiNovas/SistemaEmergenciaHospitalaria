using System;

namespace SistemaEmergenciaHospitalaria.Entidades
{
    public class Paciente
    {
        public int PacienteID { get; set; }
        public string Cedula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public DateTime? FechaNacimiento { get; set; } // Puede ser nulo según su script
        public string? Alergias { get; set; }
        public string? PresionArterial { get; set; }
        public int? FrecuenciaCardiaca { get; set; }
        public int? SaturacionOxigeno { get; set; }
        public decimal? Temperatura { get; set; }
        public int? FrecuenciaRespiratoria { get; set; }
        public string? NivelTriage { get; set; }
        public DateTime FechaHoraLlegada { get; set; }
        public DateTime? FechaHoraModificacion { get; set; }
        public string Estado { get; set; } = "En espera";
    }
}
