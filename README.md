```bash
pnpm drizzle-kit generate # if need
pnpm build
DB_FILE_NAME=file:prod.db pnpm drizzle-kit migrate
docker-compose up -d --build
```
