# Plataforma de eventos de artes marciales

API REST construida con Node.js, Express, MongoDB y Mongoose. Incluye registro, login con JWT en una cookie HTTP Only, consulta de la sesión actual y logout.

## Instalación

```bash
npm install
```

Copiar `.env.example` como `.env` y configurar los valores reales:

```env
PORT=8080
MONGO_URL=mongodb://127.0.0.1:27017/plataforma_eventos
JWT_SECRET=un_secreto_largo_y_seguro
JWT_EXPIRES_IN=1h
NODE_ENV=development
```

Iniciar en desarrollo con `npm run dev` o en modo normal con `npm start`.

## Rutas

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Comprueba el estado de la API. |
| GET | `/api/events` | Lista los eventos. |
| GET | `/api/sessions` | Comprueba el estado del módulo de sesiones. |
| POST | `/api/sessions/register` | Registra un usuario con rol `user`. |
| POST | `/api/sessions/login` | Valida credenciales y crea la cookie `currentUser`. |
| GET | `/api/sessions/current` | Devuelve el usuario autenticado; requiere la cookie. |
| POST | `/api/sessions/logout` | Elimina la cookie de autenticación. |

## Ejemplos de autenticación

### Registro

`POST /api/sessions/register`

Request:

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

Response `201`:

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

Campos ausentes o inválidos responden `400`; un email duplicado responde `409`. La contraseña se almacena con bcrypt y nunca aparece en la respuesta.

### Login

`POST /api/sessions/login`

Request:

```json
{
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

Response `200` (también envía `Set-Cookie: currentUser=...; HttpOnly; SameSite=Lax`):

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

Response `401` para cualquier credencial ausente o incorrecta:

```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

### Usuario actual

`GET /api/sessions/current`

Response `200` con la cookie válida:

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

Response `401` sin cookie o con un JWT inválido o expirado:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

### Logout

`POST /api/sessions/logout`

Response `200`:

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

La respuesta elimina `currentUser` usando las mismas opciones de la cookie de login.

## Prueba completa con curl

```bash
curl -X POST http://localhost:8080/api/sessions/register -H "Content-Type: application/json" -d '{"first_name":"Ana","last_name":"Pérez","email":"ana@mail.com","password":"Secreta123"}'
curl -c cookies.txt -X POST http://localhost:8080/api/sessions/login -H "Content-Type: application/json" -d '{"email":"ana@mail.com","password":"Secreta123"}'
curl -b cookies.txt http://localhost:8080/api/sessions/current
curl -b cookies.txt -c cookies.txt -X POST http://localhost:8080/api/sessions/logout
curl -b cookies.txt http://localhost:8080/api/sessions/current
```

El último request debe responder `401`.
