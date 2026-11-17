// Prisma 설정 파일 (Prisma 7부터 DB 주소는 여기서 읽는다)
// Next.js와 같은 .env.local 파일 하나에 DATABASE_URL을 넣어 두면 된다.
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
