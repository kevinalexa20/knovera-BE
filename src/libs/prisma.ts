import { PrismaClient } from "@prisma/client";

// Declare global types for TypeScript
declare global {
  var prisma: PrismaClient | undefined;
}

// Initialize prisma with PrismaClient type
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

/**
 * Singleton instance of PrismaClient that is shared across all requests
 * for better performance and connection management.
 */
export default prisma;
