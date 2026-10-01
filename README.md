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
| GET | `/api/events` | Lista paginada de eventos con filtros. |
| GET | `/api/events/:id` | Consulta un evento. |
| POST | `/api/events` | Crea un evento (`organizer` o `admin`). |
| PUT | `/api/events/:id` | Actualiza un evento autorizado. |
| PATCH | `/api/events/:id/status` | Cambia el estado de un evento autorizado. |
| GET | `/api/sessions` | Comprueba el estado del módulo de sesiones. |
| POST | `/api/sessions/register` | Registra un usuario con rol `user`. |
| POST | `/api/sessions/login` | Valida credenciales y crea la cookie `currentUser`. |
| GET | `/api/sessions/current` | Devuelve el usuario autenticado; requiere la cookie. |
| POST | `/api/sessions/logout` | Elimina la cookie de autenticación. |

## Ejemplos de autenticación

### Registro

`POST /api/sessions/register`

Campos requeridos:

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `first_name` | string | Nombre del usuario. |
| `last_name` | string | Apellido del usuario. |
| `email` | string | Email válido y único. |
| `password` | string | Contraseña de al menos 8 caracteres. |

El email se normaliza eliminando espacios al inicio y al final y convirtiéndolo
a minúsculas. El rol no puede establecerse desde este endpoint: todo registro
público recibe el rol `user`.

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

La respuesta elimina `currentUser` usando las mismas opciones de seguridad de la
cookie de login. Al borrarla no se reutiliza `maxAge`, para que el navegador la
expire inmediatamente.

## Prueba completa con curl

```bash
curl -X POST http://localhost:8080/api/sessions/register -H "Content-Type: application/json" -d '{"first_name":"Ana","last_name":"Pérez","email":"ana@mail.com","password":"Secreta123"}'
curl -c cookies.txt -X POST http://localhost:8080/api/sessions/login -H "Content-Type: application/json" -d '{"email":"ana@mail.com","password":"Secreta123"}'
curl -b cookies.txt http://localhost:8080/api/sessions/current
curl -b cookies.txt -c cookies.txt -X POST http://localhost:8080/api/sessions/logout
curl -b cookies.txt http://localhost:8080/api/sessions/current
```

El último request debe responder `401`.

## Autenticación con Passport

La autenticación está centralizada en
`src/config/passport.config.js`.

Estrategias implementadas:

- `register`: valida y normaliza los datos, comprueba la
  unicidad del email, cifra la contraseña con bcrypt y crea
  el usuario con el rol `user`.
- `login`: normaliza el email y valida las credenciales.
- `current`: extrae y valida el JWT almacenado en la cookie
  HTTP Only `currentUser`.

Passport solamente autentica al usuario y lo deja disponible
en `req.user`. El controller de sesiones es responsable de
generar el JWT y crear la cookie después de un login exitoso.

La configuración permite agregar en el futuro providers
externos, como Google o GitHub, incorporando nuevas estrategias
en `passport.config.js`, sin modificar `app.js`.

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto de la API. |
| `NODE_ENV` | Entorno de ejecución. |
| `MONGO_URL` | Conexión a MongoDB. |
| `JWT_SECRET` | Clave utilizada para firmar y validar JWT. |
| `JWT_EXPIRES_IN` | Duración del JWT, por ejemplo `1h`. |

## Roles y autorización

El modelo admite los roles `user`, `organizer` y `admin`. El registro público
siempre crea un `user`: cualquier valor enviado en `role` se ignora. Los roles
con privilegios se asignan mediante un proceso administrativo.

| Acción | user | organizer | admin |
| --- | :---: | :---: | :---: |
| Consultar eventos publicados | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar o cancelar eventos propios | ❌ | ✅ | ✅ |
| Modificar cualquier evento | ❌ | ❌ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |

### Rutas protegidas

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/api/sessions/current` | Cualquier usuario autenticado |
| POST | `/api/events` | `organizer`, `admin` |
| PUT | `/api/events/:id` | `organizer` propietario, o `admin` |
| PATCH | `/api/events/:id/status` | `organizer` propietario, o `admin` |
| GET | `/api/users` | Sólo `admin` |

`auth.middleware.js` valida el JWT de la cookie `currentUser` y carga
`req.user`. `authorize.middleware.js` recibe los roles permitidos y comprueba
`req.user.role`. Ambos son reutilizables y están separados de las rutas.

- **401 No autenticado:** no existe una sesión válida; falta la cookie, el JWT
  es inválido o expiró.
- **403 Sin permisos:** la sesión es válida, pero el rol o la propiedad del
  evento no permiten realizar la acción.

Al crear un evento, el servidor asigna `organizer` desde `req.user.id`; no
confía en ese campo si llega en el body. Para cancelar un evento se usa
`PATCH /api/events/:id/status` con `{ "status": "cancelled" }`.

## Casos de prueba

Antes de entregar, se deben verificar los siguientes escenarios:

- Registro exitoso: responde `201` y no incluye la contraseña.
- Registro con un email duplicado: responde `409`.
- Login con credenciales válidas: responde `200` y crea la cookie HTTP Only
  `currentUser`.
- Login con credenciales inválidas: responde `401` con el mensaje
  `Credenciales inválidas`.
- `/current` con una cookie válida: responde `200` y devuelve solamente `id`,
  `email` y `role`.
- `/current` sin cookie: responde `401`.
- `/current` con un JWT manipulado, inválido o expirado: responde `401`.
- Logout: responde `200` y elimina la cookie `currentUser`.
- Después del logout, una nueva petición a `/current` responde `401`.
- `POST /api/events` como `user` responde `403`; como `organizer`, `201`.
- `GET /api/users` como `organizer` responde `403`; como `admin`, `200`.
- Cualquier ruta privada sin cookie responde `401`.
- Un `organizer` que modifica un evento ajeno recibe `403`.

## API de eventos

| Método | Ruta | Acceso |
| --- | --- | --- |
| `POST` | `/api/events` | `organizer`, `admin` |
| `GET` | `/api/events` | Público |
| `GET` | `/api/events/:id` | Público |
| `PUT` | `/api/events/:id` | Organizador propietario o `admin` |
| `PATCH` | `/api/events/:id/status` | Organizador propietario o `admin` |

Un evento requiere `title`, `description`, `category`, `date`, `location`,
`capacity` y `price`. Su `organizer` es una referencia al usuario autenticado y
no se toma del body. Los estados válidos son `draft`, `published`, `cancelled`
y `finished`.

El listado siempre está paginado y responde con `data`, `page`, `limit`,
`total` y `totalPages`. Admite `status`, `category`, `location`, `dateFrom`,
`dateTo`, `page` (por defecto 1), `limit` (por defecto 10, máximo 100) y `sort`.
Se puede ordenar por `date`, `title`, `category`, `location`, `capacity`,
`price` o `createdAt`; el prefijo `-` indica orden descendente. Ejemplo:
`/api/events?status=published&category=workshop&page=2&limit=5&sort=date`.

La fecha de un evento nuevo debe ser futura, `capacity` debe ser mayor que cero
y `price` no puede ser negativo. Un organizador sólo modifica eventos propios;
un administrador puede modificar cualquiera. Los eventos cancelados son
inmutables y nunca se eliminan físicamente. Tampoco se puede publicar un evento
finalizado o cuya fecha ya pasó. Para cancelar se envía
`{ "status": "cancelled" }` a `PATCH /api/events/:id/status`.
