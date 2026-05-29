# Testes de Carga

Testes de carga com k6 para o boilerplate Node/Fastify.

## Cenários

| Script | VUs | Duração |
|--------|-----|---------|
| `auth.js` | 0→20→0 | ~100s |
| `users.js` | 0→10→0 | ~90s |

## Executando

### Cenário de autenticação (padrão)

```bash
make load-test
```

### Cenário de usuários

```bash
docker compose -f load-tests/docker-compose.loadtest.yml run k6 run /scripts/users.js
```

### Contra um servidor externo

```bash
k6 run -e BASE_URL=http://seu-host:3000 load-tests/k6/auth.js
```

## Métricas principais

| Métrica | Alvo |
|---------|------|
| `http_req_duration` (p95) | < 500ms |
| `http_req_failed` | < 1% |
| `auth_flow_success` | > 99% |
| `iterations` | throughput estável |

## Encerramento

```bash
docker compose -f load-tests/docker-compose.loadtest.yml down
```
