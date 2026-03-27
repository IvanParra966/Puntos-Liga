# Tabla de Liga Catamarca - Limitless TCG

Proyecto full stack en **React + Tailwind + Node.js + Express + Sequelize + MySQL**.

## Qué hace

- Consulta la API pública de Limitless TCG.
- Filtra los torneos del organizador configurado.
- Se queda únicamente con los torneos cuyo nombre contiene `CATAMARCA`.
- Descarga los standings de cada torneo.
- Guarda jugadores, torneos y posiciones en MySQL.
- Calcula una tabla de liga con:
  - jugador
  - torneos jugados
  - partidas jugadas
  - puntos de liga
  - posición conseguida en cada torneo
- Incluye tabla editable de puntajes por puesto.
- El backend crea la base de datos y las tablas al iniciar.

## Requisitos

- Node.js 18 o superior
- MySQL 8 o superior

## Instalación

1. Editá `server/.env` con tus datos de MySQL.
2. Desde la carpeta raíz ejecutá:

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Base de datos

Al iniciar, el backend hace lo siguiente automáticamente:

- crea la base de datos si no existe
- crea las tablas con Sequelize
- crea valores iniciales para la tabla `point_rules`
- sincroniza los torneos de Catamarca

## Scripts

```bash
npm run dev
npm run build
npm run start
```

## Variables importantes

Las principales están en `server/.env`:

- `LIMITLESS_BASE_URL`
- `LIMITLESS_GAME`
- `LIMITLESS_ORGANIZER_ID`
- `LIMITLESS_KEYWORD`

## Tablas que crea

- `players`
- `tournaments`
- `tournament_results`
- `point_rules`
- `sync_states`

## Notas

- La tabla de posiciones se alimenta desde los standings públicos.
- El listado de torneos usa la API `GET /tournaments` y por defecto está limitado; por eso el backend recorre varias páginas configurables.
- Los puntos por puesto son editables desde la interfaz.
