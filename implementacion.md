 # 🚨 Implementación - Sistema de Reportes de Extorsión

## 📋 Guía de Implementación y Uso

Esta guía contiene ejemplos prácticos de cómo consumir la API del Sistema de Reportes de Extorsión de la Policía Nacional de Colombia.

**URL Base:** `http://localhost:3000/api/v1`

---

## 🔥 Ejemplos de cURL

### 1. **POST** `/api/v1/reports` - Crear un reporte de extorsión

#### 📞 Reporte NO anónimo (con datos del denunciante)

```bash
curl -X POST http://localhost:3000/api/v1/reports \
-H "Content-Type: application/json" \
-H "User-Agent: PoliciaApp/1.0 (iPhone; iOS 14.0)" \
-d '{
  "phoneNumber": "3012345678",
  "date": "15/12/2024",
  "time": "14:30",
  "description": "Recibí una llamada de un número desconocido exigiéndome dinero. La persona me amenazó con hacerle daño a mi familia si no pagaba 500,000 pesos. Me pidió que consignara el dinero en una cuenta bancaria específica.",
  "hasEvidence": true,
  "anonymous": false,
  "reporterName": "Juan Carlos Pérez",
  "reporterContact": "3009876543",
  "termsAccepted": true
}'
```

**✅ Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Su reporte ha sido enviado exitosamente. Un oficial se pondrá en contacto con usted a la brevedad.",
  "data": {
    "reportId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "caseNumber": "EXT-2024-000001",
    "status": "PENDING"
  }
}
```

#### 🕵️ Reporte anónimo

```bash
curl -X POST http://localhost:3000/api/v1/reports \
-H "Content-Type: application/json" \
-H "User-Agent: PoliciaApp/1.0 (Android; 10)" \
-d '{
  "phoneNumber": "+573201234567",
  "date": "14/12/2024",
  "time": "09:15",
  "description": "Vi a varias personas en mi barrio siendo amenazadas por teléfono. Escuché conversaciones donde les pedían dinero bajo amenaza. El número que más he escuchado es el que reporto.",
  "hasEvidence": false,
  "anonymous": true,
  "termsAccepted": true
}'
```

**✅ Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Su reporte ha sido enviado exitosamente. Un oficial se pondrá en contacto con usted a la brevedad.",
  "data": {
    "reportId": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
    "caseNumber": "EXT-2024-000002",
    "status": "PENDING"
  }
}
```

#### 💼 Reporte con evidencia

```bash
curl -X POST http://localhost:3000/api/v1/reports \
-H "Content-Type: application/json" \
-H "User-Agent: PoliciaApp/1.0 (iPhone; iOS 15.0)" \
-d '{
  "phoneNumber": "3151234567",
  "date": "16/12/2024",
  "time": "16:45",
  "description": "Recibí múltiples mensajes de texto amenazantes desde este número. Me piden 2 millones de pesos y dicen que conocen mi dirección. Tengo capturas de pantalla de los mensajes y grabaciones de las llamadas.",
  "hasEvidence": true,
  "anonymous": false,
  "reporterName": "María Fernanda González",
  "reporterContact": "maria.gonzalez@email.com",
  "termsAccepted": true
}'
```

**✅ Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Su reporte ha sido enviado exitosamente. Un oficial se pondrá en contacto con usted a la brevedad.",
  "data": {
    "reportId": "c3d4e5f6-g7h8-9012-cdef-g34567890123",
    "caseNumber": "EXT-2024-000003",
    "status": "PENDING"
  }
}
```

### 2. **GET** `/api/v1/reports/case/:caseNumber` - Consultar reporte por número de caso

```bash
curl -X GET http://localhost:3000/api/v1/reports/case/EXT-2024-000001 \
-H "User-Agent: PoliciaApp/1.0"
```

**✅ Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Reporte encontrado",
  "data": {
    "reportId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "caseNumber": "EXT-2024-000001",
    "status": "PENDING"
  }
}
```

### 3. **GET** `/api/v1/reports/status/:reportId` - Consultar estado del reporte por ID

```bash
curl -X GET http://localhost:3000/api/v1/reports/status/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
-H "User-Agent: PoliciaApp/1.0"
```

**✅ Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Estado del reporte obtenido",
  "data": {
    "reportId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "caseNumber": "EXT-2024-000001",
    "status": "PENDING"
  }
}
```

---

## 🚨 Ejemplos de Respuestas de Error

### ❌ Error de validación (400)

```bash
curl -X POST http://localhost:3000/api/v1/reports \
-H "Content-Type: application/json" \
-d '{
  "phoneNumber": "123456789",
  "date": "32/12/2024",
  "time": "25:30",
  "description": "Muy corto",
  "hasEvidence": false,
  "anonymous": false,
  "termsAccepted": false
}'
```

**❌ Respuesta de error (400):**
```json
{
  "success": false,
  "message": "Error de validación en los datos enviados",
  "errors": [
    {
      "field": "phoneNumber",
      "message": "Formato de teléfono colombiano inválido. Debe tener 10 dígitos o incluir +57"
    },
    {
      "field": "date",
      "message": "La fecha debe tener el formato DD/MM/AAAA"
    },
    {
      "field": "time",
      "message": "La hora debe tener el formato HH:MM (24 horas)"
    },
    {
      "field": "description",
      "message": "La descripción debe tener al menos 10 caracteres"
    },
    {
      "field": "termsAccepted",
      "message": "Debe aceptar los términos y condiciones"
    }
  ]
}
```

### ❌ Error de datos faltantes para reporte no anónimo (400)

```bash
curl -X POST http://localhost:3000/api/v1/reports \
-H "Content-Type: application/json" \
-d '{
  "phoneNumber": "3001234567",
  "date": "15/12/2024",
  "time": "14:30",
  "description": "Descripción válida del incidente de extorsión telefónica",
  "hasEvidence": false,
  "anonymous": false,
  "termsAccepted": true
}'
```

**❌ Respuesta de error (400):**
```json
{
  "success": false,
  "message": "Error de validación en los datos enviados",
  "errors": [
    {
      "field": "reporterName",
      "message": "El nombre del denunciante es obligatorio si no es anónimo"
    },
    {
      "field": "reporterContact",
      "message": "El contacto del denunciante es obligatorio si no es anónimo"
    }
  ]
}
```

### ❌ Error de throttling - Rate limiting (429)

```bash
# Después de hacer más de 3 reportes por minuto desde la misma IP
curl -X POST http://localhost:3000/api/v1/reports \
-H "Content-Type: application/json" \
-d '{
  "phoneNumber": "3001234567",
  "date": "15/12/2024",
  "time": "14:30",
  "description": "Cuarto reporte en menos de un minuto",
  "hasEvidence": false,
  "anonymous": true,
  "termsAccepted": true
}'
```

**❌ Respuesta de error (429):**
```json
{
  "success": false,
  "message": "ThrottlerException: Too Many Requests",
  "timestamp": "2024-12-15T19:30:00.000Z"
}
```

### ❌ Error de reporte no encontrado (404)

```bash
curl -X GET http://localhost:3000/api/v1/reports/case/EXT-2024-999999
```

**❌ Respuesta de error:**
```json
{
  "success": false,
  "message": "Reporte no encontrado",
  "errors": [
    {
      "field": "caseNumber",
      "message": "Número de caso inválido"
    }
  ]
}
```

```bash
curl -X GET http://localhost:3000/api/v1/reports/status/invalid-uuid-format
```

**❌ Respuesta de error:**
```json
{
  "success": false,
  "message": "Reporte no encontrado",
  "errors": [
    {
      "field": "reportId",
      "message": "ID de reporte inválido"
    }
  ]
}
```

---

## 📱 Formatos de Datos Aceptados

### 📞 Formatos de Teléfono Válidos

```json
{
  "phoneNumber": "3001234567"      // ✅ 10 dígitos
}
```

```json
{
  "phoneNumber": "573001234567"    // ✅ Con código país 57
}
```

```json
{
  "phoneNumber": "+573001234567"   // ✅ Con + y código país
}
```

**Operadores móviles válidos:**
- `300, 301, 302, 303, 304, 305` (Claro)
- `310, 311, 312, 313, 314, 315, 316, 317, 318, 319` (Movistar)
- `320, 321, 322, 323, 324` (Tigo)
- `350, 351` (Avantel)

### 📅 Formato de Fecha

```json
{
  "date": "15/12/2024"  // ✅ DD/MM/AAAA
}
```

### ⏰ Formato de Hora

```json
{
  "time": "14:30"  // ✅ HH:MM (formato 24 horas)
}
```

### 📝 Descripción

```json
{
  "description": "Mínimo 10 caracteres, máximo 1000 caracteres"
}
```

---

## 🔐 Rate Limiting

| Endpoint | Límite | Ventana de tiempo |
|----------|--------|------------------|
| `POST /reports` | 3 reportes | 1 minuto |
| `GET /reports/case/:caseNumber` | 10 consultas | 1 minuto |
| `GET /reports/status/:reportId` | 10 consultas | 1 minuto |

---

## 🛠️ Herramientas de Testing

### Usando archivos JSON

```bash
# Crear archivo test-report.json
cat > test-report.json << 'EOF'
{
  "phoneNumber": "3001234567",
  "date": "15/12/2024",
  "time": "14:30",
  "description": "Descripción de prueba para el reporte de extorsión telefónica desde archivo JSON",
  "hasEvidence": false,
  "anonymous": false,
  "reporterName": "Usuario de Prueba",
  "reporterContact": "3009876543",
  "termsAccepted": true
}
EOF

# Usar el archivo en curl
curl -X POST http://localhost:3000/api/v1/reports \
-H "Content-Type: application/json" \
-d @test-report.json
```

### Usando Postman

**Configuración de colección:**

1. **URL Base:** `http://localhost:3000/api/v1`
2. **Headers necesarios:**
   - `Content-Type: application/json`
   - `User-Agent: PoliciaApp/1.0`

**Variables de entorno:**
```json
{
  "baseUrl": "http://localhost:3000/api/v1",
  "reportId": "{{reportId}}",
  "caseNumber": "{{caseNumber}}"
}
```

### Script de pruebas automatizadas

```bash
#!/bin/bash
# test-api.sh

BASE_URL="http://localhost:3000/api/v1"

echo "🚨 Iniciando pruebas del Sistema de Reportes de Extorsión"
echo "================================================="

# Test 1: Crear reporte no anónimo
echo "📝 Test 1: Creando reporte no anónimo..."
RESPONSE1=$(curl -s -X POST $BASE_URL/reports \
-H "Content-Type: application/json" \
-d '{
  "phoneNumber": "3001234567",
  "date": "15/12/2024",
  "time": "14:30",
  "description": "Reporte de prueba automatizada - no anónimo",
  "hasEvidence": true,
  "anonymous": false,
  "reporterName": "Test User",
  "reporterContact": "3009876543",
  "termsAccepted": true
}')

echo "Respuesta: $RESPONSE1"
echo ""

# Test 2: Crear reporte anónimo
echo "🕵️ Test 2: Creando reporte anónimo..."
RESPONSE2=$(curl -s -X POST $BASE_URL/reports \
-H "Content-Type: application/json" \
-d '{
  "phoneNumber": "+573201234567",
  "date": "16/12/2024",
  "time": "09:15",
  "description": "Reporte de prueba automatizada - anónimo",
  "hasEvidence": false,
  "anonymous": true,
  "termsAccepted": true
}')

echo "Respuesta: $RESPONSE2"
echo ""

# Test 3: Consultar reporte por caso
echo "🔍 Test 3: Consultando reporte por número de caso..."
RESPONSE3=$(curl -s -X GET $BASE_URL/reports/case/EXT-2024-000001)
echo "Respuesta: $RESPONSE3"
echo ""

echo "✅ Pruebas completadas"
```

---

## 🔍 Estados de Reportes

| Estado | Descripción |
|--------|-------------|
| `PENDING` | Reporte recibido, pendiente de revisión |
| `IN_REVIEW` | Reporte bajo investigación |
| `RESOLVED` | Caso resuelto |
| `CLOSED` | Caso cerrado |

---

## 🚀 Ejemplos de Integración

### React Native / Expo

```javascript
// services/reportsService.js
const API_BASE_URL = 'http://localhost:3000/api/v1';

export const createReport = async (reportData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PoliciaApp/1.0 (React Native)',
      },
      body: JSON.stringify(reportData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Error al crear reporte');
    }
    
    return result;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

export const getReportStatus = async (reportId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/status/${reportId}`, {
      headers: {
        'User-Agent': 'PoliciaApp/1.0 (React Native)',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Error al consultar reporte');
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching report status:', error);
    throw error;
  }
};
```

### JavaScript/Node.js

```javascript
// services/extorsionReports.js
const axios = require('axios');

class ExtorsionReportsService {
  constructor() {
    this.baseURL = 'http://localhost:3000/api/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PoliciaApp/1.0 (Node.js)',
      },
    });
  }

  async createReport(reportData) {
    try {
      const response = await this.client.post('/reports', reportData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Error al crear reporte');
      }
      throw error;
    }
  }

  async getReportByCaseNumber(caseNumber) {
    try {
      const response = await this.client.get(`/reports/case/${caseNumber}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Reporte no encontrado');
      }
      throw error;
    }
  }

  async getReportStatus(reportId) {
    try {
      const response = await this.client.get(`/reports/status/${reportId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Reporte no encontrado');
      }
      throw error;
    }
  }
}

module.exports = ExtorsionReportsService;
```

---

## 📊 Monitoreo y Logs

### Logs importantes a revisar

Los siguientes logs aparecen en la consola del servidor:

```
[Nest] LOG [SecurityMiddleware] POST /api/v1/reports {"ip":"192.168.1.100","userAgent":"PoliciaApp/1.0","timestamp":"2024-12-15T19:30:00.000Z"}

[Nest] LOG [ReportService] Nuevo reporte creado: EXT-2024-000001 {"reportId":"uuid","caseNumber":"EXT-2024-000001","isAnonymous":false,"ipAddress":"192.168.1.100","timestamp":"2024-12-15T19:30:00.000Z"}
```

### Métricas importantes

- **Tiempo de respuesta promedio**: < 500ms
- **Tasa de error**: < 1%
- **Reportes por hora**: Variable según demanda
- **IPs únicas por día**: Para detectar patrones

---

## 🛡️ Consideraciones de Seguridad

### Headers recomendados

```bash
curl -X POST http://localhost:3000/api/v1/reports \
-H "Content-Type: application/json" \
-H "User-Agent: PoliciaApp/1.0 (iPhone; iOS 14.0)" \
-H "X-Forwarded-For: 192.168.1.100" \
-H "X-Real-IP: 192.168.1.100" \
-d '{...}'
```

### Validación de datos

- ✅ Sanitización automática de HTML
- ✅ Validación de formato de teléfono
- ✅ Validación de fechas
- ✅ Rate limiting por IP
- ✅ Logs de auditoría completos

---

## 📞 Contacto y Soporte

**Sistema de Reportes de Extorsión**  
**Policía Nacional de Colombia - Kennedy, Bogotá**

- **Versión API**: 1.0.0
- **Última actualización**: Diciembre 2024
- **Soporte técnico**: Equipo de desarrollo

---

## 🔗 Enlaces Útiles

- **Documentación principal**: `README.md`
- **API Base URL**: `http://localhost:3000/api/v1`
- **Health Check**: `http://localhost:3000/api/v1` (GET)

---

**© 2024 Policía Nacional de Colombia - Todos los derechos reservados**