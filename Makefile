DATABASE_URL ?= postgres://chatapp:chatapp@localhost:5444/chatapp

.PHONY: db-reset migrate migrate-up migrate-down migrate-down-all db-up db-down db-wait

db-up:
	docker compose up -d

db-down:
	docker compose down

db-wait:
	pnpm db:wait

db-reset:
	docker compose down -v
	docker compose up -d
	pnpm db:wait
	DATABASE_URL=$(DATABASE_URL) node-pg-migrate up -m migrations/pgm -d DATABASE_URL

migrate:
	DATABASE_URL=$(DATABASE_URL) node-pg-migrate up -m migrations/pgm -d DATABASE_URL

migrate-up:
	DATABASE_URL=$(DATABASE_URL) node-pg-migrate up -m migrations/pgm -d DATABASE_URL

migrate-down:
	DATABASE_URL=$(DATABASE_URL) node-pg-migrate down -m migrations/pgm -d DATABASE_URL

migrate-down-all:
	DATABASE_URL=$(DATABASE_URL) node-pg-migrate down -m migrations/pgm -d DATABASE_URL -c all
