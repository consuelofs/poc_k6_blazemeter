# POC: k6 + Taurus + BlazeMeter Integration

## Descripción

Prueba de Concepto (POC) para integrar **k6**, **Taurus** y **BlazeMeter**, con el objetivo de que el equipo ejecute tests de carga fácilmente en CI/CD y que cualquier desarrollador pueda mantenerlos sin necesidad de conocer JavaScript.

## Estructura del proyecto

```
poc_k6_blazemeter/
├── README.md
├── docker-compose.yml
├── .blazemeterrc               # Configuración BlazeMeter
├── .github/
│   └── workflows/
│       └── performance-tests.yml
├── k6-tests/
│   ├── hello-world.js          # Test k6 puro
│   └── config.js               # Configuración compartida
├── taurus-tests/
│   ├── hello-world.yml         # Test Taurus (YAML)
│   └── loadcurve.yml           # Test con curva de carga
└── scripts/
    └── run-tests.sh            # Script helper para ejecutar tests
```

---

## Requisitos

| Herramienta | Versión mínima | Instalación |
|---|---|---|
| [k6](https://k6.io/docs/getting-started/installation/) | 0.45+ | ver enlace |
| [Taurus (bzt)](https://gettaurus.org/install/Installation/) | 1.16+ | `pip install bzt` |
| Python | 3.8+ | necesario para Taurus |
| Docker (opcional) | 20+ | para entorno containerizado |

---

## Ejecución rápida

### Con el script helper

```bash
# Smoke test (1 VU, 30 s) – por defecto
./scripts/run-tests.sh

# Load test (10 VUs, 3 min)
./scripts/run-tests.sh load

# Stress test (rampa hasta 50 VUs)
./scripts/run-tests.sh stress

# Ejecutar vía Taurus
./scripts/run-tests.sh taurus

# Ejecutar curva de carga vía Taurus
./scripts/run-tests.sh curve
```

### Con k6 directamente

```bash
k6 run k6-tests/hello-world.js

# Personalizar VUs y duración
k6 run --vus 5 --duration 60s k6-tests/hello-world.js
```

### Con Taurus directamente

```bash
bzt taurus-tests/hello-world.yml

bzt taurus-tests/loadcurve.yml
```

### Con Docker Compose

```bash
# Ejecutar test k6
docker compose run k6

# Ejecutar test Taurus
docker compose run taurus
```

---

## Integración con BlazeMeter

### 1. Obtener API token

1. Inicia sesión en [BlazeMeter](https://www.blazemeter.com/).
2. Ve a **Settings → API Keys**.
3. Genera un nuevo token.

### 2. Configurar el token

```bash
export BLAZEMETER_API_TOKEN="tu_token_aqui"
```

### 3. Ejecutar en la nube

```bash
bzt taurus-tests/hello-world.yml \
  -o modules.blazemeter.token=${BLAZEMETER_API_TOKEN}
```

### 4. GitHub Actions (CI/CD)

Añade los siguientes **secrets/variables** en tu repositorio de GitHub
(`Settings → Secrets and variables → Actions`):

| Nombre | Tipo | Descripción |
|---|---|---|
| `BLAZEMETER_API_TOKEN` | Secret | Token de API de BlazeMeter |
| `BLAZEMETER_PROJECT_ID` | Variable | ID del proyecto en BlazeMeter |
| `BLAZEMETER_ENABLED` | Variable | `true` para activar el job de BlazeMeter |

El workflow `.github/workflows/performance-tests.yml` se ejecuta automáticamente en cada push/PR a `main`/`master`.

---

## Cómo escribir nuevos tests

### Tests k6 (JavaScript)

Crea un nuevo archivo en `k6-tests/` importando las utilidades compartidas:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, DEFAULT_HEADERS, DEFAULT_THRESHOLDS } from './config.js';

export const options = {
  vus: 5,
  duration: '1m',
  thresholds: DEFAULT_THRESHOLDS,
};

export default function () {
  const res = http.get(BASE_URL + '/api/endpoint', { headers: DEFAULT_HEADERS });
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

### Tests Taurus (YAML)

Crea un nuevo archivo en `taurus-tests/`:

```yaml
execution:
  - executor: k6
    concurrency: 5
    hold-for: 1m
    scenario: mi-escenario

scenarios:
  mi-escenario:
    script: k6-tests/mi-test.js
```

---

## Mejores prácticas

1. **Smoke test primero**: siempre valida con 1 VU antes de escalar.
2. **Thresholds claros**: define umbrales de `p95` y tasa de errores en `config.js`.
3. **Secrets seguros**: nunca hagas commit del API token; usa variables de entorno o GitHub Secrets.
4. **Reportes**: los resultados se guardan en `reports/` (excluidos del repo por `.gitignore`).
5. **Reproducibilidad**: usa Docker Compose para asegurar el mismo entorno en local y CI.

---

## Ventajas de esta POC

| Característica | Beneficio |
|---|---|
| **Accesible** | Taurus permite YAML simple sin JavaScript |
| **Potente** | k6 cubre casos de uso avanzados |
| **Mantenible** | Estructura clara y documentada |
| **CI/CD ready** | GitHub Actions workflow incluido |
| **Cloud-ready** | Integración BlazeMeter sin cambios de código |
| **Reproducible** | Docker Compose para ambiente consistente |