using System;
using System.Data;
using Microsoft.Data.SqlClient;
using SistemaEmergenciaHospitalaria.Entidades;

namespace SistemaEmergenciaHospitalaria.Negocio
{
    public class PacienteBLL
    {
        private readonly string connectionString = "Server=localhost;Database=SistemaEmergenciaHospitalaria;Trusted_Connection=True;TrustServerCertificate=True;";

        // 1. REGISTRAR PACIENTE
        public bool RegistrarPaciente(Paciente paciente)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_RegistrarPaciente", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@Cedula", paciente.Cedula ?? string.Empty);
                    cmd.Parameters.AddWithValue("@NombreCompleto", paciente.NombreCompleto ?? string.Empty);
                    cmd.Parameters.AddWithValue("@FechaNacimiento", (object?)paciente.FechaNacimiento ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Alergias", (object?)paciente.Alergias ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@PresionArterial", (object?)paciente.PresionArterial ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@FrecuenciaCardiaca", (object?)paciente.FrecuenciaCardiaca ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@SaturacionOxigeno", (object?)paciente.SaturacionOxigeno ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Temperatura", (object?)paciente.Temperatura ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@FrecuenciaRespiratoria", (object?)paciente.FrecuenciaRespiratoria ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@NivelTriage", (object?)paciente.NivelTriage ?? DBNull.Value);

                    try
                    {
                        conn.Open();
                        object? resultado = cmd.ExecuteScalar();
                        return resultado != null;
                    }
                    catch (Exception ex)
                    {
                        System.Windows.Forms.MessageBox.Show("Error en sp_RegistrarPaciente: " + ex.Message);
                        return false;
                    }
                }
            }
        }

        // 2. OBTENER PACIENTES
        public DataTable ObtenerPacientes()
        {
            DataTable tabla = new DataTable();
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_ObtenerPacientes", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
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
                        System.Windows.Forms.MessageBox.Show("Error en sp_ObtenerPacientes: " + ex.Message);
                    }
                }
            }
            return tabla;
        }

        // 3. ACTUALIZAR PACIENTE
        public bool ActualizarPaciente(Paciente paciente)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_ActualizarPaciente", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@PacienteID", paciente.PacienteID);
                    cmd.Parameters.AddWithValue("@NombreCompleto", paciente.NombreCompleto ?? string.Empty);
                    cmd.Parameters.AddWithValue("@FechaNacimiento", (object?)paciente.FechaNacimiento ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Alergias", (object?)paciente.Alergias ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@PresionArterial", (object?)paciente.PresionArterial ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@FrecuenciaCardiaca", (object?)paciente.FrecuenciaCardiaca ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@SaturacionOxigeno", (object?)paciente.SaturacionOxigeno ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Temperatura", (object?)paciente.Temperatura ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@FrecuenciaRespiratoria", (object?)paciente.FrecuenciaRespiratoria ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@NivelTriage", (object?)paciente.NivelTriage ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Estado", paciente.Estado ?? "En espera");

                    try
                    {
                        conn.Open();
                        int filas = cmd.ExecuteNonQuery();
                        return filas > 0;
                    }
                    catch (Exception ex)
                    {
                        System.Windows.Forms.MessageBox.Show("Error en sp_ActualizarPaciente: " + ex.Message);
                        return false;
                    }
                }
            }
        }

        // 4. ELIMINAR PACIENTE
        public bool EliminarPaciente(int idPaciente)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_EliminarPaciente", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PacienteID", idPaciente);

                    try
                    {
                        conn.Open();
                        int filas = cmd.ExecuteNonQuery();
                        return filas > 0;
                    }
                    catch (Exception ex)
                    {
                        System.Windows.Forms.MessageBox.Show("Error en sp_EliminarPaciente: " + ex.Message);
                        return false;
                    }
                }
            }
        }
    }
}