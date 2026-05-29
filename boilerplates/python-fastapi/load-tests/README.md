# Testes de Carga

Suite de testes de carga com Locust para o boilerplate FastAPI.

## Executando

### Stack completa (recomendado)

```bash
# A partir da raiz do boilerplate:
make load-test

# Ou diretamente:
docker compose -f load-tests/docker-compose.loadtest.yml up --build
```

Acesse a UI web do Locust em **http://localhost:8089**, defina o número de usuários e a taxa de criação, depois clique em **Start**.

### Headless (CI / automatizado)

```bash
docker compose -f load-tests/docker-compose.loadtest.yml run --rm locust-master \
  -f /locustfile.py \
  --headless \
  -u 50 \
  -r 5 \
  --run-time 60s \
  --host http://api:8000
```

| Flag | Significado |
|------|-------------|
| `-u 50` | Total de usuários simulados |
| `-r 5` | Usuários criados por segundo |
| `--run-time 60s` | Parar após 60 segundos |

### Encerramento

```bash
docker compose -f load-tests/docker-compose.loadtest.yml down
```

---

## Classes de usuário

| Classe | Cenário |
|--------|---------|
| `AuthFlow` | register → login → refresh → logout |
| `AuthenticatedUser` | login → GET /users/me → PUT /users/me |

---

## Métricas principais

| Métrica | Alvo saudável | Ação se ultrapassado |
|---------|---------------|----------------------|
| **RPS** (requisições/s) | Estável sob carga | Verificar contagem de workers, conexões com DB |
| **p95 tempo de resposta** | < 500ms | Perfilar endpoints lentos, adicionar índices |
| **Taxa de falhas** | < 1% | Verificar logs: `docker compose logs api` |
| **p99 tempo de resposta** | < 1.000ms | Investigar contenção de lock ou queries N+1 |

O Locust exibe essas métricas em tempo real na aba **Statistics** e permite exportar como CSV.

---

## Escalando workers

```bash
docker compose -f load-tests/docker-compose.loadtest.yml up --scale locust-worker=4
```

Cada worker gerencia sua fatia de usuários; o master agrega todos os resultados.
