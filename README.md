# Seeds de roles y permisos

## Objetivo
Centralizar los seeds del sistema en archivos propios y dejar de seedear dentro de los modelos.

## Estructura
```txt
server/src/database/seeds/
  catalogs.seed.js
  rolePermissions.seed.js
  organizationRolePermissions.seed.js
  runSeeds.js