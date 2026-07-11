import { useState } from "react";

// ============================================================
//  CONFIGURACION  ->  RELLENA ESTOS VALORES CON LOS TUYOS
// ============================================================
const USUARIOS_URL      = "https://REEMPLAZA.execute-api.us-east-1.amazonaws.com";     // el que tenga /usuarios
const CURSOS_URL        = "https://REEMPLAZA.execute-api.us-east-1.amazonaws.com";     // el que tenga /cursos
const INSCRIPCIONES_URL = "https://m2islafbrf.execute-api.us-east-1.amazonaws.com";    // confirmado: inscripciones
const REGION            = "us-east-1";
const CLIENT_ID         = "308p0a6ua6nnkod2b1e2lu6721";
// ============================================================

const box = { border: "1px solid #ddd", borderRadius: 8, padding: 16, margin: "12px 0" };
const btn = { margin: 4, padding: "8px 14px", border: "none", borderRadius: 6,
              background: "#ff9900", color: "#000", cursor: "pointer", fontWeight: 600 };

export default function App() {
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [token, setToken] = useState("");
  const [msg, setMsg]     = useState("");
  const [data, setData]   = useState([]);
  const [titulo, setTitulo] = useState("");

  // --- Login contra Cognito (obtiene el IdToken) ---
  const login = async () => {
    setMsg("Iniciando sesion...");
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
        setMsg("Sesion iniciada correctamente.");
      } else {
        setMsg("Error de login: " + (j.message || JSON.stringify(j)));
      }
    } catch (e) { setMsg("Error: " + e.message); }
  };

  // --- Helper generico para llamar a un microservicio ---
  const api = async (url, method = "GET", body = null) => {
    setMsg("Llamando " + method + " " + url + " ...");
    try {
      const opts = { method, headers: { Authorization: token } };
      if (body) {
        opts.headers["Content-Type"] = "application/json";
        opts.body = JSON.stringify(body);
      }
      const res = await fetch(url, opts);
      const j = await res.json();
      setMsg("Respuesta: " + JSON.stringify(j));
      return j;
    } catch (e) { setMsg("Error: " + e.message); }
  };

  const verUsuarios = async () => { setTitulo("Usuarios"); setData(await api(`${USUARIOS_URL}/usuarios`) || []); };
  const verCursos   = async () => { setTitulo("Cursos");   setData(await api(`${CURSOS_URL}/cursos`) || []); };
  const verInscr    = async () => { setTitulo("Inscripciones"); setData(await api(`${INSCRIPCIONES_URL}/inscripciones`) || []); };

  const crearCurso = async () => {
    const id = Date.now().toString();
    await api(`${CURSOS_URL}/cursos`, "POST", { cursoId: id, nombre: "Curso " + id });
    verCursos();
  };
  const inscribir = async () => {
    const id = Date.now().toString();
    await api(`${INSCRIPCIONES_URL}/inscripciones`, "POST",
      { inscripcionId: id, usuarioId: "1", cursoId: "101" });
    verInscr();
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Inscripcion de Cursos</h1>
      <p style={{ color: "#666" }}>Aplicacion web serverless con 3 microservicios en AWS
        (Usuarios, Cursos, Inscripciones) + Cognito.</p>

      {!token ? (
        <div style={box}>
          <h3>Iniciar sesion</h3>
          <input placeholder="email" value={email}
            onChange={(e) => setEmail(e.target.value)} style={{ display: "block", margin: 6, padding: 8, width: 260 }} />
          <input placeholder="password" type="password" value={pass}
            onChange={(e) => setPass(e.target.value)} style={{ display: "block", margin: 6, padding: 8, width: 260 }} />
          <button style={btn} onClick={login}>Entrar</button>
        </div>
      ) : (
        <div style={box}>
          <h3>Acciones</h3>
          <button style={btn} onClick={verUsuarios}>Ver usuarios</button>
          <button style={btn} onClick={verCursos}>Ver cursos</button>
          <button style={btn} onClick={crearCurso}>Crear curso</button>
          <button style={btn} onClick={verInscr}>Ver inscripciones</button>
          <button style={btn} onClick={inscribir}>Inscribirme</button>
        </div>
      )}

      {msg && <div style={{ ...box, background: "#f7f7f7", fontSize: 13, wordBreak: "break-all" }}>{msg}</div>}

      {data && data.length > 0 && (
        <div style={box}>
          <h3>{titulo}</h3>
          <ul>
            {data.map((item, i) => (
              <li key={i}>{JSON.stringify(item)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
