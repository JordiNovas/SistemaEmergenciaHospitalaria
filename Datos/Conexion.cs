using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;


namespace SistemaEmergenciaHospitalaria.Datos
{
    internal class Conexion
    {
        private SqlConnection conexion = new SqlConnection(
            "Server=JORDINOVAS\\MSSQLSERVER02;Database=SistemaEmergenciaHospitalaria;Trusted_Connection=True;TrustServerCertificate=True;"
        );

        public SqlConnection AbrirConexion()
        {
            if (conexion.State == System.Data.ConnectionState.Closed)
            {
                conexion.Open();
            }

            return conexion;
        }

        public void CerrarConexion()
        {
            if (conexion.State == System.Data.ConnectionState.Open)
            {
                conexion.Close();
            }
        }

        public bool ProbarConexion()
        {
            try
            {
                AbrirConexion();
                System.Diagnostics.Debug.WriteLine("¡Conexión exitosa a SistemaEmergenciaHospitalaria!");
                CerrarConexion();
                return true;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Error al conectar: " + ex.Message);
                return false;
            }
            finally
            {
                // Esto se ejecutará SIEMPRE, garantizando que no dejes conexiones abiertas
                CerrarConexion();
            }
        }
    }
}
