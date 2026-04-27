import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations require a direct (non-pooled) connection.
    // Supabase: DIRECT_URL (port 5432)
    // Neon:     DATABASE_URL_UNPOOLED
    // Local dev: DATABASE_URL
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DATABASE_URL"],
  },
});
