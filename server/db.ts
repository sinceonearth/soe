import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

const NEON_DB_URL = "postgresql://neondb_owner:npg_xyUXg2cfJ5tT@ep-holy-recipe-aed2z25m-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";

const sql = neon(NEON_DB_URL);
export const db = drizzle(sql, { schema });
