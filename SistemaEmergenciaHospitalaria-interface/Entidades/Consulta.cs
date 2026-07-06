using System;

namespace SistemaEmergenciaHospitalaria.Entidades
{
    public class Consulta
    {
        public int ConsultaID { get; set; }
        public int PacienteID { get; set; }
        public DateTime FechaHoraLlegada { get; set; }
        public string? ModoLlegada { get; set; } // 'Por pie propio', 'Ambulancia', 'Traido por otros', 'Otro'
        public string? NivelTriage { get; set; } // 'Rojo', 'Naranja', 'Amarillo', 'Verde', 'Azul'
        public string? MotivoConsulta { get; set; }

        // Signos Vitales (Anulables porque en Admisión se quedan vacíos)
        public string? PresionArterial { get; set; }
        public int? FrecuenciaCardiaca { get; set; }
        public int? SaturacionOxigeno { get; set; }
        public decimal? Temperatura { get; set; }
        public int? FrecuenciaRespiratoria { get; set; }
        public decimal? Peso { get; set; }       // Para capturar los 70 kg de la foto
        public decimal? Talla { get; set; }      // Para capturar el 1.70 m de la foto
        public string? Observaciones { get; set; } // Para las notas adicionales del final

        public string Estado { get; set; } = "En espera"; // 'En espera', 'En atencion', 'Atendido'

        public DateTime? FechaHoraModificacion { get; set; }
    }
}