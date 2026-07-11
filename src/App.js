import { useState } from "react";

// ============================================================
//  CONFIGURACION  (URLs ya confirmadas de tus microservicios)
// ============================================================
const USUARIOS_URL      = "https://5u7y1wuckk.execute-api.us-east-1.amazonaws.com";
const CURSOS_URL        = "https://wunxwubsf6.execute-api.us-east-1.amazonaws.com";
const INSCRIPCIONES_URL = "https://m2islafbrf.execute-api.us-east-1.amazonaws.com";
const REGION            = "us-east-1";
const CLIENT_ID         = "308p0a6ua6nnkod2b1e2lu6721";
// ============================================================

// ---------- Estilos ----------
const S = {
  page:   { maxWidth: 800, margin: "40px auto", padding: "0 16px",
            fontFamily: "Segoe UI, Roboto, sans-serif", color: "#222" },
  h1:     { marginBottom: 4 },
  sub:    { color: "#666", marginTop: 0 },
  card:   { border: "1px solid #e5e5e5", borderRadius: 10, padding: 16,
            margin: "12px 0", boxShadow: "0 1px 4px rgba(0,0,0,.06)", background: "#fff" },
  btn:    { padding: "9px 16px", border: "none", borderRadius: 8, cursor: "pointer",
            background: "#ff9900", color: "#111", fontWeight: 600, margin: 4 },
  btnAlt: { padding: "8px 14px", border: "1px solid #ff9900", borderRadius: 8, cursor: "pointer",
            background: "#fff", color: "#b36b00", fontWeight: 600, margin: 4 },
  input:  { display: "block", width: "100%", boxSizing: "border-box", padding: 9,
            margin: "6px 0", border: "1px solid #ccc", borderRadius: 6 },
  badge:  { display: "inline-block", background: "#f0f0f0", borderRadius: 12,
            padding: "2px 10px", fontSize: 12, color: "#555", marginLeft: 8 },
  estado: { fontSize: 12, color: "#888", background: "#fafafa", padding: 8,
            borderRadius: 6, wordBreak: "break-all", marginTop: 8 },
  th:     { textAlign: "left", borderBottom: "2px solid #eee", padding: 8, fontSize: 14 },
  td:     { borderBottom: "1px solid #f2f2f2", padding: 8, fontSize: 14 },
};

export default function App() {
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [token, setToken]   = useState("");
  const [estado, setEstado] = useState("");

  // datos
  const [cursos, setCursos]           = useState([]);
  const [usuarios, setUsuarios]       = useState([]);
  const [inscripciones, setInscr]     = useState([]);

  // formulario de curso
  const [form, setForm] = useState({ cursoId: "", nombre: "", descripcion: "", cupos: "" });
  // usuario que se inscribe
  const [usuarioActivo, setUsuarioActivo] = useState("1");

  // ---------- Login Cognito ----------
  const login = async () => {
    setEstado("Iniciando sesion...");
    try {
      const res = await fetch(`https://cognito-idp.${REGION}.amazonaws.com/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-amz-json-1.1",
          "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
        },
        body: JSON.stringify({
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: CLIENT_ID,
          AuthParameters: { USERNAME: email, PASSWORD: pass },
        }),
      });
      const j = await res.json();
      if (j.AuthenticationResult?.IdToken) {
        setToken(j.AuthenticationResult.IdToken);
        setEstado("Sesion iniciada correctamente.");
      } else {
        setEstado("Error de login: " + (j.message || JSON.stringify(j)));
      }
    } catch (e) { setEstado("Error: " + e.message); }
  };

  // ---------- Helper API ----------
  const api = async (url, method = "GET", body = null) => {
    try {
      const opts = { method, headers: { Authorization: token } };
      if (body) {
        opts.headers["Content-Type"] = "application/json";
        opts.body = JSON.stringify(body);
      }
      const res = await fetch(url, opts);
      return await res.json();
    } catch (e) { setEstado("Error: " + e.message); return null; }
  };

  // ---------- Cargas ----------
  const verCursos = async () => {
    const r = await api(`${CURSOS_URL}/cursos`);
    setCursos(Array.isArray(r) ? r : []);
    setEstado("Cursos cargados.");
  };
  const verUsuarios = async () => {
    const r = await api(`${USUARIOS_URL}/usuarios`);
    setUsuarios(Array.isArray(r) ? r : []);
    setEstado("Usuarios cargados.");
  };
  const verInscr = async () => {
    const r = await api(`${INSCRIPCIONES_URL}/inscripciones`);
    setInscr(Array.isArray(r) ? r : []);
    setEstado("Inscripciones cargadas.");
  };

  // ---------- Crear curso (con inputs) ----------
  const crearCurso = async (e) => {
    e.preventDefault();
    if (!form.cursoId || !form.nombre) {
      setEstado("El ID y el nombre del curso son obligatorios.");
      return;
    }
    const nuevo = {
      cursoId: form.cursoId,
      nombre: form.nombre,
      descripcion: form.descripcion,
      cupos: form.cupos ? Number(form.cupos) : 0,
    };
    await api(`${CURSOS_URL}/cursos`, "POST", nuevo);
    setEstado(`Curso "${form.nombre}" creado.`);
    setForm({ cursoId: "", nombre: "", descripcion: "", cupos: "" });
    verCursos();
  };

  // ---------- Inscribirse a un curso ----------
  const inscribir = async (curso) => {
    const nueva = {
      inscripcionId: Date.now().toString(),
      usuarioId: usuarioActivo || "1",
      cursoId: curso.cursoId,
    };
    await api(`${INSCRIPCIONES_URL}/inscripciones`, "POST", nueva);
    setEstado(`Inscrito al curso "${curso.nombre || curso.cursoId}".`);
    verInscr();
  };

  const onForm = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // ======================= UI =======================
  if (!token) {
    return (
      <div style={S.page}>
        <h1 style={S.h1}>Inscripcion de Cursos</h1>
        <p style={S.sub}>Aplicacion serverless con microservicios en AWS (Usuarios, Cursos, Inscripciones) + Cognito.</p>
        <div style={S.card}>
          <h3>Iniciar sesion</h3>
          <input style={S.input} placeholder="Correo electronico" value={email}
            onChange={(e) => setEmail(e.target.value)} />
          <input style={S.input} type="password" placeholder="Contrasena" value={pass}
            onChange={(e) => setPass(e.target.value)} />
          <button style={S.btn} onClick={login}>Entrar</button>
        </div>
        {estado && <div style={S.estado}>{estado}</div>}
      </div>
    );
  }

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Inscripcion de Cursos</h1>
      <p style={S.sub}>Sesion activa. Usuario que se inscribe:
        <input style={{ ...S.input, display: "inline-block", width: 120, margin: "0 8px" }}
          value={usuarioActivo} onChange={(e) => setUsuarioActivo(e.target.value)} />
      </p>

      {/* ---- Crear curso ---- */}
      <div style={S.card}>
        <h3>Crear nuevo curso</h3>
        <form onSubmit={crearCurso}>
          <input style={S.input} placeholder="ID del curso (ej. 101)"
            value={form.cursoId} onChange={onForm("cursoId")} />
          <input style={S.input} placeholder="Nombre del curso"
            value={form.nombre} onChange={onForm("nombre")} />
          <input style={S.input} placeholder="Descripcion"
            value={form.descripcion} onChange={onForm("descripcion")} />
          <input style={S.input} type="number" placeholder="Cupos disponibles"
            value={form.cupos} onChange={onForm("cupos")} />
          <button style={S.btn} type="submit">Crear curso</button>
        </form>
      </div>

      {/* ---- Acciones ---- */}
      <div style={{ margin: "8px 0" }}>
        <button style={S.btnAlt} onClick={verCursos}>Ver cursos</button>
        <button style={S.btnAlt} onClick={verUsuarios}>Ver usuarios</button>
        <button style={S.btnAlt} onClick={verInscr}>Ver inscripciones</button>
      </div>

      {estado && <div style={S.estado}>{estado}</div>}

      {/* ---- Cursos como tarjetas ---- */}
      {cursos.length > 0 && (
        <div>
          <h2>Cursos disponibles</h2>
          {cursos.map((c, i) => (
            <div key={i} style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: 18 }}>{c.nombre || "(sin nombre)"}</strong>
                  <span style={S.badge}>ID: {c.cursoId}</span>
                </div>
                <button style={S.btn} onClick={() => inscribir(c)}>Inscribirme</button>
              </div>
              {c.descripcion && <p style={{ margin: "8px 0 4px", color: "#444" }}>{c.descripcion}</p>}
              <small style={{ color: "#777" }}>Cupos: {c.cupos != null ? c.cupos : "N/D"}</small>
            </div>
          ))}
        </div>
      )}

      {/* ---- Usuarios como tabla ---- */}
      {usuarios.length > 0 && (
        <div style={S.card}>
          <h2>Usuarios</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={S.th}>Nombre</th><th style={S.th}>ID</th></tr></thead>
            <tbody>
              {usuarios.map((u, i) => (
                <tr key={i}>
                  <td style={S.td}>{u.nombre || "(sin nombre)"}</td>
                  <td style={S.td}>{u.usuarioId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---- Inscripciones como tabla ---- */}
      {inscripciones.length > 0 && (
        <div style={S.card}>
          <h2>Inscripciones</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={S.th}>Inscripcion</th><th style={S.th}>Usuario</th><th style={S.th}>Curso</th>
            </tr></thead>
            <tbody>
              {inscripciones.map((x, i) => (
                <tr key={i}>
                  <td style={S.td}>{x.inscripcionId}</td>
                  <td style={S.td}>{x.usuarioId}</td>
                  <td style={S.td}>{x.cursoId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
