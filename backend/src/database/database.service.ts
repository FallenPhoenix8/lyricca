import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common"
import { PrismaClient } from "#prisma-client/index.js"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: Pool
  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    super({
      adapter: new PrismaPg(pool),
    })
    this.pool = pool
  }
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
    await this.pool.end()
  }
}
