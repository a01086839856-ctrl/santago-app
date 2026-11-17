// Prisma Client를 만드는 함수 (앱, 초기 데이터 스크립트가 함께 쓴다)
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

/*
  AWS RDS(PostgreSQL 15 이상)는 SSL로 암호화된 접속만 받는다.
  DATABASE_URL 끝에 ?sslmode=require가 있으면 암호화해서 접속한다.
  Node.js 기본 인증서 목록에는 RDS 인증서가 없어서, 인증서 확인까지 켜면 접속이 막힌다.
  그래서 데모 단계에서는 "암호화는 하되 인증서 확인은 생략"한다.
  (보안을 더 높이려면 AWS가 주는 RDS 인증서 묶음을 받아 ssl.ca로 넣는다)
*/
export function createPrismaClient(databaseUrl = process.env.DATABASE_URL) {
  let connectionString = databaseUrl ?? "";
  let useSsl = false;

  if (connectionString) {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode");
    useSsl = sslmode !== null && sslmode !== "disable";
    url.searchParams.delete("sslmode");
    connectionString = url.toString();
  }

  const adapter = new PrismaPg({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });

  return new PrismaClient({ adapter });
}
