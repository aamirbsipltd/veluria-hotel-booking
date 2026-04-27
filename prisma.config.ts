import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations require a direct (non-pooled) connection.
    // Neon sets DATABASE_URL_UNPOOLED for this purpose; fall back to DATABASE_URL for local dev.
    url: process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DATABASE_URL"],
  },
});
