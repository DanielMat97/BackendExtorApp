# 🚨 Sistema de Reportes de Extorsión - Backend

## 📋 Descripción

Backend desarrollado en **NestJS** para el sistema de reportes de extorsión de la **Policía Nacional de Colombia** en la localidad de Kennedy, Bogotá. Este sistema permite recibir y gestionar reportes de extorsión enviados desde la aplicación móvil React Native.

## 🏗️ Arquitectura

### Estructura del proyecto

```
src/
├── config/
│   └── database.config.ts          # Configuración de TypeORM
├── filters/
│   └── http-exception.filter.ts    # Filtro global de excepciones
├── middleware/
│   └── security.middleware.ts      # Middleware de seguridad y auditorías
├── reports/
│   ├── controllers/
│   │   ├── reports.controller.ts   # Controlador REST para reportes
│   │   └── reports.controller.spec.ts
│   ├── dto/
│   │   ├── create-report.dto.ts    # DTO con validaciones para crear reportes
│   │   └── report-response.dto.ts  # DTOs para respuestas
│   ├── entities/
│   │   └── report.entity.ts        # Entidad TypeORM para reportes
│   ├── services/
│   │   ├── report.service.ts       # Lógica de negocio principal
│   │   ├── report.service.spec.ts
│   │   ├── validation.service.ts   # Servicio de validaciones complejas
│   │   └── validation.service.spec.ts
│   └── reports.module.ts           # Módulo de reportes
├── app.module.ts                   # Módulo principal
└── main.ts                         # Punto de entrada
```

## 🚀 Instalación

### Prerrequisitos

- **Node.js** >= 16.x
- **npm** >= 8.x
- **MySQL** >= 8.0

### 1. Instalación de dependencias

```bash
npm install
```

### 2. Configuración de variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita las variables según tu configuración:

```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_NAME=extorsion_reports

# Seguridad
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006

# Configuración de la aplicación
APP_NAME=Sistema de Reportes de Extorsión - Policía Nacional
APP_VERSION=1.0.0
```

### 3. Configuración de la base de datos

```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE extorsion_reports CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Ejecutar la aplicación

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

La aplicación estará disponible en: `http://localhost:3000/api/v1`

## 📊 API Endpoints

### 🔗 POST `/api/v1/reports`

Crear un nuevo reporte de extorsión.

**Rate Limiting:** 3 reportes por minuto por IP

#### Request Body

```json
{
  "phoneNumber": "3001234567",
  "date": "15/12/2024",
  "time": "14:30",
  "description": "Descripción detallada del incidente de extorsión",
  "hasEvidence": false,
  "anonymous": false,
  "reporterName": "Juan Pérez",
  "reporterContact": "3009876543",
  "termsAccepted": true
}
```

#### Validaciones

- **phoneNumber**: Formato colombiano (+57XXXXXXXXXX, 57XXXXXXXXXX, XXXXXXXXXX)
- **date**: Formato DD/MM/AAAA
- **time**: Formato HH:MM (24 horas)
- **description**: Entre 10 y 1000 caracteres
- **reporterName/reporterContact**: Obligatorios si `anonymous = false`
- **termsAccepted**: Debe ser `true`

#### Response Exitosa (201)

```json
{
  "success": true,
  "message": "Su reporte ha sido enviado exitosamente. Un oficial se pondrá en contacto con usted a la brevedad.",
  "data": {
    "reportId": "uuid",
    "caseNumber": "EXT-2024-000001",
    "status": "PENDING"
  }
}
```

#### Response de Error (400)

```json
{
  "success": false,
  "message": "Error de validación en los datos enviados",
  "errors": [
    {
      "field": "phoneNumber",
      "message": "Formato de teléfono colombiano inválido"
    }
  ]
}
```

### 🔗 GET `/api/v1/reports/case/:caseNumber`

Consultar reporte por número de caso.

**Rate Limiting:** 10 consultas por minuto por IP

#### Response Exitosa (200)

```json
{
  "success": true,
  "message": "Reporte encontrado",
  "data": {
    "reportId": "uuid",
    "caseNumber": "EXT-2024-000001",
    "status": "PENDING"
  }
}
```

### 🔗 GET `/api/v1/reports/status/:reportId`

Consultar estado de reporte por ID.

**Rate Limiting:** 10 consultas por minuto por IP

## 🗃️ Base de Datos

### Tabla: `reports`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único (PK) |
| `phoneNumber` | VARCHAR(20) | Número telefónico sospechoso |
| `incidentDate` | DATETIME | Fecha y hora del incidente |
| `description` | TEXT | Descripción del incidente |
| `hasEvidence` | BOOLEAN | Si cuenta con evidencia |
| `isAnonymous` | BOOLEAN | Si el reporte es anónimo |
| `reporterName` | VARCHAR(255) | Nombre del denunciante |
| `reporterContact` | VARCHAR(255) | Contacto del denunciante |
| `termsAccepted` | BOOLEAN | Aceptación de términos |
| `status` | ENUM | Estado: PENDING, IN_REVIEW, RESOLVED, CLOSED |
| `caseNumber` | VARCHAR(20) | Número de caso único |
| `ipAddress` | VARCHAR(45) | IP del denunciante |
| `userAgent` | TEXT | User Agent del cliente |
| `createdAt` | TIMESTAMP | Fecha de creación |
| `updatedAt` | TIMESTAMP | Fecha de actualización |

## 🔒 Seguridad

### Medidas implementadas

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configurado para orígenes específicos
- **Rate Limiting**: Throttling por IP
- **Validación de datos**: Sanitización y validación estricta
- **Logs de auditoría**: Registro completo de actividades
- **Encriptación de datos**: Sanitización contra XSS
- **IP Tracking**: Seguimiento de IPs para auditoría

### Logs de auditoría

Todos los reportes y accesos se registran con:

- IP del cliente
- User Agent
- Timestamp
- Datos del reporte (redactados)
- Errores y excepciones

## 🧪 Testing

### Ejecutar tests

```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:cov

# Tests e2e
npm run test:e2e

# Tests en modo watch
npm run test:watch
```

### Cobertura de tests

- **Servicios**: Lógica de negocio y validaciones
- **Controladores**: Endpoints y manejo de errores
- **Entidades**: Modelos de datos
- **Filtros**: Manejo global de excepciones

## 📈 Monitoreo y Logs

### Niveles de log

- **ERROR**: Errores críticos y excepciones
- **WARN**: Advertencias y situaciones anómalas
- **LOG**: Eventos importantes (creación de reportes)
- **DEBUG**: Información detallada para desarrollo

### Métricas importantes

- Número de reportes por día/hora
- Tasa de errores de validación
- IPs con alta frecuencia de reportes
- Tiempo de respuesta promedio

## 🚀 Deployment

### Variables de entorno para producción

```env
NODE_ENV=production
PORT=3000

# Base de datos con SSL
DB_HOST=production-host
DB_SSL=true
DB_POOL_SIZE=20

# Seguridad
ALLOWED_ORIGINS=https://policia-app.gov.co
RATE_LIMIT_MAX=5
RATE_LIMIT_TTL=60000
```

### Docker (Opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

## 🤝 Contribución

Este proyecto está desarrollado específicamente para la **Policía Nacional de Colombia**. 

### Consideraciones especiales

- Todos los datos son **confidenciales** y de uso exclusivo policial
- El sistema debe cumplir con las normativas de **protección de datos**
- Los reportes son utilizados únicamente para **fines de investigación**
- Acceso restringido solo a personal autorizado

## 📞 Contacto y Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo:

- **Proyecto**: Sistema de Reportes de Extorsión
- **Cliente**: Policía Nacional de Colombia - Kennedy, Bogotá
- **Versión**: 1.0.0
- **Última actualización**: Diciembre 2024

---

## 🛡️ Licencia

Este software es propiedad de la **Policía Nacional de Colombia** y está destinado exclusivamente para uso interno en la lucha contra la extorsión. Prohibida su distribución o uso no autorizado.

**© 2024 Policía Nacional de Colombia - Todos los derechos reservados**
