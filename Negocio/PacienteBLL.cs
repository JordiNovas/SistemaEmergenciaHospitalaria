using System;
using System.Data;
using Microsoft.Data.SqlClient;
using SistemaEmergenciaHospitalaria.Entidades; // Permite usar la entidad Paciente

namespace SistemaEmergenciaHospitalaria.Negocio
{
    public class PacienteBLL
    {
        // Cadena de conexión corregida apuntando a tu base de datos local
        private readonly string connectionString = "Server=localhost;Database=HospitalGES_DB;Trusted_Connection=True;TrustServerCertificate=True;";

        // 1. REGISTRAR PACIENTE
        public bool RegistrarPaciente(Paciente paciente)
        {
            string query = "INSERT INTO Paciente (Cedula, NSS, Nombre, Apellido, FechaNacimiento, Sexo, MotivoConsulta, HoraLlegada, Estado) " +
                           "VALUES (@Cedula, @NSS, @Nombre, @Apellido, @FechaNacimiento, @Sexo, @MotivoConsulta, @HoraLlegada, @Estado)";

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Cedula", paciente.Cedula);
                    cmd.Parameters.AddWithValue("@NSS", string.IsNullOrEmpty(paciente.NSS) ? (object)DBNull.Value : paciente.NSS);
                    cmd.Parameters.AddWithValue("@Nombre", paciente.Nombre);
                    cmd.Parameters.AddWithValue("@Apellido", paciente.Apellido);
                    cmd.Parameters.AddWithValue("@FechaNacimiento", paciente.FechaNacimiento);
                    cmd.Parameters.AddWithValue("@Sexo", paciente.Sexo);
                    cmd.Parameters.AddWithValue("@MotivoConsulta", paciente.MotivoConsulta);
                    cmd.Parameters.AddWithValue("@HoraLlegada", DateTime.Now);
                    cmd.Parameters.AddWithValue("@Estado", "Activo");

                    try
                    {
                        conn.Open();
                        int filas = cmd.ExecuteNonQuery();
                        return filas > 0;
                    }
                    catch (Exception ex)
                    {
                        System.Windows.Forms.MessageBox.Show("Error en Base de Datos (Insertar): " + ex.Message);
                        return false;
                    }
                }
            }
        }

        // 2. OBTENER PACIENTES (Para el DataGridView)
        public DataTable ObtenerPacientes()
        {
            DataTable tabla = new DataTable();
            string query = "SELECT IdPaciente, Cedula, NSS, Nombre, Apellido, FechaNacimiento, Sexo, MotivoConsulta, HoraLlegada, Estado FROM Paciente WHERE Estado != 'Inactivo'";

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    try
                    {
                        conn.Open();
                        using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                        {
                            adapter.Fill(tabla);
                        }
                    }
                    catch (Exception ex)
                    {
                        System.Windows.Forms.MessageBox.Show("Error al obtener pacientes: " + ex.Message);
                    }
                }
            }
            return tabla;
        }

        // 3. ACTUALIZAR PACIENTE
        public bool ActualizarPaciente(Paciente paciente)
        {
            string query = "UPDATE Paciente SET Cedula = @Cedula, NSS = @NSS, Nombre = @Nombre, " +
                           "Apellido = @Apellido, FechaNacimiento = @FechaNacimiento, Sexo = @Sexo, " +
                           "MotivoConsulta = @MotivoConsulta, Estado = @Estado WHERE IdPaciente = @IdPaciente";

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@IdPaciente", paciente.IdPaciente);
                    cmd.Parameters.AddWithValue("@Cedula", paciente.Cedula);
                    cmd.Parameters.AddWithValue("@NSS", string.IsNullOrEmpty(paciente.NSS) ? (object)DBNull.Value : paciente.NSS);
                    cmd.Parameters.AddWithValue("@Nombre", paciente.Nombre);
                    cmd.Parameters.AddWithValue("@Apellido", paciente.Apellido);
                    cmd.Parameters.AddWithValue("@FechaNacimiento", paciente.FechaNacimiento);
                    cmd.Parameters.AddWithValue("@Sexo", paciente.Sexo);
                    cmd.Parameters.AddWithValue("@MotivoConsulta", paciente.MotivoConsulta);
                    cmd.Parameters.AddWithValue("@Estado", paciente.Estado);

                    try
                    {
                        conn.Open();
                        int filas = cmd.ExecuteNonQuery();
                        return filas > 0;
                    }
                    catch (Exception ex)
                    {
                        System.Windows.Forms.MessageBox.Show("Error al actualizar: " + ex.Message);
                        return false;
                    }
                }
            }
        }

        // 4. ELIMINAR PACIENTE (Borrado Lógico)
        public bool ElminarPaciente(int idPaciente)
        {
            string query = "UPDATE Paciente SET Estado = 'Inactivo' WHERE IdPaciente = @IdPaciente";

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@IdPaciente", idPaciente);

                    try
                    {
                        conn.Open();
                        int filas = cmd.ExecuteNonQuery();
                        return filas > 0;
                    }
                    catch (Exception ex)
                    {
                        System.Windows.Forms.MessageBox.Show("Error al eliminar: " + ex.Message);
                        return false;
                    }
                }
            }
        }
    }
}
