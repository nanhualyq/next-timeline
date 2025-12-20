## for database

```bash
pnpm drizzle-kit generate
DB_FILE_NAME=file:prod.db pnpm drizzle-kit migrate
```

## for docker

```bash
pnpm build
docker-compose up -d --build
```
