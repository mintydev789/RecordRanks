import { sql } from "drizzle-orm";
import { connection, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "~/server/db/provider.ts";
import { nodemailerConnectionOptions } from "~/server/email/connection-options.ts";

async function checkDatabase() {
  try {
    const start = Date.now();
    await db.execute(sql.raw("SELECT 1"));
    const latencyMs = Date.now() - start;

    return { healthy: true, latencyMs };
  } catch (error) {
    return { healthy: false, error: error instanceof Error ? error.message : "Unknown DB connection error" };
  }
}

async function checkNodemailer() {
  try {
    const start = Date.now();
    const transporter = nodemailer.createTransport(nodemailerConnectionOptions);
    await transporter.verify();
    const latencyMs = Date.now() - start;

    return { healthy: true, latencyMs };
  } catch (error) {
    return { healthy: false, error: error instanceof Error ? error.message : "Unknown Nodemailer error" };
  }
}

const maxHeapUsedPercentage = 99;

async function checkMemory() {
  const memory = process.memoryUsage();
  const heapUsedPercentage = (memory.heapUsed / memory.heapTotal) * 100;
  const healthy = heapUsedPercentage < maxHeapUsedPercentage;

  return {
    healthy,
    heapUsed: `${Math.round(heapUsedPercentage)}%`,
    heapUsedMiB: `${Math.round(memory.heapUsed / 1024 / 1024)} MiB`,
    heapTotalMiB: `${Math.round(memory.heapTotal / 1024 / 1024)} MiB`,
    ...(healthy ? {} : { error: `Heap usage exceeds ${maxHeapUsedPercentage}%` }),
  };
}

export async function GET() {
  await connection();

  const [dbStatus, nodemailerStatus, memoryStatus] = await Promise.all([
    checkDatabase(),
    checkNodemailer(),
    checkMemory(),
  ]);

  const allHealthy = dbStatus.healthy && nodemailerStatus.healthy && memoryStatus.healthy;

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: dbStatus,
        nodemailer: nodemailerStatus,
        memory: memoryStatus,
      },
    },
    { status: allHealthy ? 200 : 503 },
  );
}
