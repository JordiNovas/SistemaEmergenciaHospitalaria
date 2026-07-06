using Microsoft.Data.SqlClient;
using SistemaEmergenciaHospitalaria.Datos;
using SistemaEmergenciaHospitalaria.Entidades;
using System;
using System.Collections.Generic;
using System.Data;

namespace SistemaEmergenciaHospitalaria.Negocio
{
    public class PacienteBLL
    {
        private readonly string connectionString = "Server=localhost;Database=SistemaEmergenciaHospitalaria;Trusted_Connection=True;TrustServerCertificate=True;";


        // MÓDULO DE LOGIN & USUARIOS

        public DataTable ValidarLogin(string cedula, string contrasena)
        {
            DataTable dt = new DataTable();
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_ValidarLogin", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Cedula", cedula);
                    cmd.Parameters.AddWithValue("@Contrasena", contrasena);
                    try
                    {
                        conn.Open();
                        using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                        {
                            adapter.Fill(dt);
                        }
                    }
                    catch (Exception ex)
                    {
                        System.Windows.Forms.MessageBox.Show("Error en Login: " + ex.Message);
                    }
                }
            }
            return dt;
        }

        // MÓDULO DE PACIENTES

        public int RegistrarPaciente(Paciente paciente)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_RegistrarPaciente", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Cedula", paciente.Cedula);
                    cmd.Parameters.AddWithValue("@NombreCompleto", paciente.NombreCompleto);
                    cmd.Parameters.AddWithValue("@FechaNacimiento", paciente.FechaNacimiento);
                    cmd.Parameters.AddWithValue("@TipoSangre", (object?)paciente.TipoSangre ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Sexo", (object?)paciente.Sexo ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@TelefonoContacto", (object?)paciente.TelefonoContacto ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Alergias", (object?)paciente.Alergias ?? DBNull.Value);

                    // Parámetro OUTPUT 
                    SqlParameter outputId = new SqlParameter("@NuevoPacienteID", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(outputId);

                    try
                    {
                        conn.Open();
                        cmd.ExecuteNonQuery();
                        return (int)outputId.Value;
                    }
                    catch (Exception ex)
                    {
                        System.Windows.Forms.MessageBox.Show("Error al registrar paciente: " + ex.Message);
                        return -1;
                    }
                }
            }
        }

        public DataTable BuscarPaciente(string filtro)
        {
            DataTable dt = new DataTable();
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_BuscarPaciente", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Filtro", filtro);
                    try
                    {
                        conn.Open();
                        using (SqlDataAdapter ad = new SqlDataAdapter(cmd)) { ad.Fill(dt); }
                    }
                    catch (Exception ex)
                    {
                        System.Windows.Forms.MessageBox.Show("Error al buscar paciente: " + ex.Message);
                    }
                }
            }
            return dt;
        }

        // MÓDULO DE CONSULTAS (SALA DE ESPERA / TRIAGE)


        //Metodo Registra Consulta
        public int RegistrarConsulta(Consulta consulta)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_RegistrarConsulta", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PacienteID", consulta.PacienteID);
                    cmd.Parameters.AddWithValue("@ModoLlegada", (object?)consulta.ModoLlegada ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@NivelTriage", (object?)consulta.NivelTriage ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@MotivoConsulta", (object?)consulta.MotivoConsulta ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@PresionArterial", (object?)consulta.PresionArterial ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@FrecuenciaCardiaca", (object?)consulta.FrecuenciaCardiaca ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@SaturacionOxigeno", (object?)consulta.SaturacionOxigeno ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Temperatura", (object?)consulta.Temperatura ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@FrecuenciaRespiratoria", (object?)consulta.FrecuenciaRespiratoria ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Peso", (object?)consulta.Peso ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Talla", (object?)consulta.Talla ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Observaciones", (object?)consulta.Observaciones ?? DBNull.Value);

                    SqlParameter outputId = new SqlParameter("@NuevaConsultaID", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    cmd.Parameters.Add(outputId);

                    try
                    {
                        conn.Open();
                        cmd.ExecuteNonQuery();
                        return (int)outputId.Value;
                    }
                    catch (Exception ex)
                    {
                        System.Windows.Forms.MessageBox.Show("Error al registrar la consulta: " + ex.Message);
                        return -1;
                    }
                }
            }
        }

        //Metodo Obtener Sala De Espera
        public DataTable ObtenerSalaEspera()
        {
            DataTable dt = new DataTable();
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_ObtenerConsultas", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    try
                    {
                        conn.Open();
                        using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                        {
                            adapter.Fill(dt);
                        }
                    }
                    catch (Exception ex)
                    {
                        System.Windows.Forms.MessageBox.Show("Error al cargar sala de espera: " + ex.Message);
                    }
                }
            }
            return dt;
        }

        //Metodo Actualizar las consultas
        public bool ActualizarConsulta(Consulta consulta)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_ActualizarConsulta", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@ConsultaID", consulta.ConsultaID);
                    cmd.Parameters.AddWithValue("@ModoLlegada", (object?)consulta.ModoLlegada ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@NivelTriage", (object?)consulta.NivelTriage ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@MotivoConsulta", (object?)consulta.MotivoConsulta ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@PresionArterial", (object?)consulta.PresionArterial ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@FrecuenciaCardiaca", (object?)consulta.FrecuenciaCardiaca ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@SaturacionOxigeno", (object?)consulta.SaturacionOxigeno ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Temperatura", (object?)consulta.Temperatura ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@FrecuenciaRespiratoria", (object?)consulta.FrecuenciaRespiratoria ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Estado", (object?)consulta.Estado ?? DBNull.Value);

                    try
                    {
                        conn.Open();
                        int filas = cmd.ExecuteNonQuery();
                        return filas > 0;
                    }
                    catch (Exception ex)
                    {
                        System.Windows.Forms.MessageBox.Show("Error al actualizar la consulta médica: " + ex.Message);
                        return false;
                    }
                }
            }
        }


        public List<Consulta> ObtenerConsultasPorFecha(DateTime fecha)
        {
            List<Consulta> lista = new List<Consulta>();
            using (SqlConnection conn = new SqlConnection(connectionString))
            {

                string query = "SELECT * FROM Consulta WHERE CAST(FechaHoraLlegada AS DATE) = CAST(@Fecha AS DATE)";
                SqlCommand cmd = new SqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@Fecha", fecha.Date);

                conn.Open();
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        lista.Add(new Consulta
                        {
                            ConsultaID = Convert.ToInt32(reader["ConsultaID"]),
                            PacienteID = Convert.ToInt32(reader["PacienteID"]),
                            FechaHoraLlegada = Convert.ToDateTime(reader["FechaHoraLlegada"]),
                            ModoLlegada = reader["ModoLlegada"].ToString(),
                            NivelTriage = reader["NivelTriage"].ToString(),
                            MotivoConsulta = reader["MotivoConsulta"].ToString(),
                            PresionArterial = reader["PresionArterial"]?.ToString(),
                            FrecuenciaCardiaca = reader["FrecuenciaCardiaca"] != DBNull.Value ? Convert.ToInt32(reader["FrecuenciaCardiaca"]) : null,
                            SaturacionOxigeno = reader["SaturacionOxigeno"] != DBNull.Value ? Convert.ToInt32(reader["SaturacionOxigeno"]) : null,
                            Temperatura = reader["Temperatura"] != DBNull.Value ? Convert.ToDecimal(reader["Temperatura"]) : null,
                            FrecuenciaRespiratoria = reader["FrecuenciaRespiratoria"] != DBNull.Value ? Convert.ToInt32(reader["FrecuenciaRespiratoria"]) : null,
                            Peso = reader["Peso"] != DBNull.Value ? Convert.ToDecimal(reader["Peso"]) : null,
                            Talla = reader["Talla"] != DBNull.Value ? Convert.ToDecimal(reader["Talla"]) : null,
                            Observaciones = reader["Observaciones"]?.ToString(),
                            Estado = reader["Estado"].ToString() ?? "En espera"
                        });
                    }
                }

            }
            return lista;
        }

        public bool ActualizarEstadoConsulta(int consultaId, string nuevoEstado)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                string query = "UPDATE Consulta SET Estado = @Estado WHERE ConsultaID = @ConsultaID";
                SqlCommand cmd = new SqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@Estado", nuevoEstado);
                cmd.Parameters.AddWithValue("@ConsultaID", consultaId);

                conn.Open();
                int filasAfectadas = cmd.ExecuteNonQuery();
                return filasAfectadas > 0;
            }
        }
    }
}
