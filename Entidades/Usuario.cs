using System;

namespace SistemaEmergenciaHospitalaria.Entidades
{
    public class Usuario
    {
        public int UsuarioID { get; set; }
        public string Cedula { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty; // Enfermera, Medico, Administrador
        public bool Activo { get; set; } = true;
        public DateTime FechaCreacion { get; set; }
        public DateTime? UltimoAcceso { get; set; }
    }
}