# App Microservicios - Lab 11 (AWS)

Frontend React que consume 3 microservicios serverless en AWS
(Usuarios, Cursos, Inscripciones) protegidos con Amazon Cognito.

## 1. Configurar
Abre `src/App.js` y rellena arriba:
- `USUARIOS_URL`  -> la API que tiene las rutas /usuarios
- `CURSOS_URL`    -> la API que tiene las rutas /cursos
- `INSCRIPCIONES_URL` -> ya viene con m2islafbrf (inscripciones)
- `CLIENT_ID`     -> tu App Client de Cognito (ya viene puesto)
- `REGION`        -> us-east-1

> Tip: usa `aws apigatewayv2 get-routes --api-id XXXX --query "Items[].RouteKey"`
> para confirmar cual URL corresponde a /usuarios y cual a /cursos.

## 2. Subir a GitHub
Sube TODOS estos archivos a un repositorio nuevo en GitHub.

## 3. Desplegar en Amplify
Consola AWS -> Amplify -> New app -> Host web app -> conecta tu repo -> Save and deploy.
Amplify detecta React automaticamente (o usa el amplify.yml incluido).

## 4. Probar
Abre la URL que te da Amplify e inicia sesion con tu usuario Cognito, por ejemplo:
- Email: kensh@test.com
- Password: Caratula-1

Luego usa los botones para consumir los 3 microservicios.
