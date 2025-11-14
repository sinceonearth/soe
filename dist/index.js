var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import dotenv2 from "dotenv";
import express2 from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import cors from "cors";
import cookieParser from "cookie-parser";

// server/routes.ts
import { createServer } from "http";
import dotenv from "dotenv";
import { sql as sql2, eq, desc, and } from "drizzle-orm";
import crypto from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// server/db.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  airlines: () => airlines,
  airports: () => airports,
  contactMessages: () => contactMessages,
  flights: () => flights,
  insertAirlineSchema: () => insertAirlineSchema,
  insertAirportSchema: () => insertAirportSchema,
  insertContactMessageSchema: () => insertContactMessageSchema,
  insertFlightSchema: () => insertFlightSchema,
  insertStayinSchema: () => insertStayinSchema,
  insertUserSchema: () => insertUserSchema,
  inviteCodes: () => inviteCodes,
  loginUserSchema: () => loginUserSchema,
  registerUserSchema: () => registerUserSchema,
  sessions: () => sessions,
  stayins: () => stayins,
  users: () => users
});
import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  boolean,
  timestamp,
  doublePrecision,
  integer,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var inviteCodes = pgTable("invite_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 20 }).unique().notNull(),
  created_by: uuid("created_by").references(() => users.id),
  used_by: uuid("used_by").references(() => users.id),
  max_uses: integer("max_uses").default(1),
  current_uses: integer("current_uses").default(0),
  is_active: boolean("is_active").default(true).notNull(),
  expires_at: timestamp("expires_at"),
  created_at: timestamp("created_at").defaultNow()
});
var users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  alien: varchar("alien").unique().notNull(),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique().notNull(),
  password_hash: varchar("password_hash"),
  name: varchar("name").notNull(),
  country: varchar("country").default("Other").notNull(),
  // ✅ always set
  profile_image_url: varchar("profile_image_url"),
  profile_icon: varchar("profile_icon"),
  profile_color: varchar("profile_color"),
  profile_setup_complete: boolean("profile_setup_complete").default(false).notNull(),
  is_admin: boolean("is_admin").default(false).notNull(),
  approved: boolean("approved").default(false).notNull(),
  invite_code_used: varchar("invite_code_used"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  updated_at: true
});
var registerUserSchema = z.object({
  name: z.string().min(2, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  country: z.string().default("Other"),
  // default to Other if not provided
  alien: z.string().regex(/^\d{2}$/, "Alien must be 2 digits (e.g. 01, 02, 10)").optional(),
  inviteCode: z.string().optional()
});
var loginUserSchema = z.object({
  email: z.string().min(1, "Email or username required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
var flights = pgTable("flights", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => users.id).notNull(),
  airline_name: varchar("airline_name").notNull(),
  airline_code: varchar("airline_code", { length: 3 }).notNull(),
  flight_number: varchar("flight_number").notNull(),
  departure: varchar("departure").notNull(),
  arrival: varchar("arrival").notNull(),
  departure_latitude: doublePrecision("departure_latitude"),
  departure_longitude: doublePrecision("departure_longitude"),
  arrival_latitude: doublePrecision("arrival_latitude"),
  arrival_longitude: doublePrecision("arrival_longitude"),
  departure_time: varchar("departure_time"),
  arrival_time: varchar("arrival_time"),
  date: varchar("date"),
  // YYYY-MM-DD
  // ✅ Add terminal columns
  departure_terminal: varchar("departure_terminal"),
  arrival_terminal: varchar("arrival_terminal"),
  aircraft_type: varchar("aircraft_type"),
  distance: doublePrecision("distance"),
  // km
  duration: varchar("duration"),
  status: varchar("status").default("scheduled"),
  created_at: timestamp("created_at").defaultNow()
});
var insertFlightSchema = createInsertSchema(flights).omit({
  id: true,
  user_id: true,
  created_at: true
});
var airlines = pgTable("airlines", {
  id: uuid("id").defaultRandom().primaryKey(),
  airline_code: varchar("airline_code", { length: 3 }).unique().notNull(),
  airline_name: varchar("airline_name").notNull(),
  country: varchar("country").notNull(),
  icao: varchar("icao"),
  iata: varchar("iata")
});
var insertAirlineSchema = createInsertSchema(airlines);
var airports = pgTable("airports", {
  id: integer("id").primaryKey(),
  ident: varchar("ident").unique().notNull(),
  type: varchar("type"),
  name: varchar("name"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  elevation_ft: integer("elevation_ft"),
  continent: varchar("continent"),
  iso_country: varchar("iso_country"),
  iso_region: varchar("iso_region"),
  municipality: varchar("municipality"),
  gps_code: varchar("gps_code"),
  iata: varchar("iata", { length: 3 }),
  icao: varchar("icao", { length: 4 }),
  local_code: varchar("local_code")
});
var insertAirportSchema = createInsertSchema(airports);
var stayins = pgTable("stayins", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => users.id).notNull(),
  check_in: varchar("check_in").notNull(),
  // Date string
  check_out: varchar("check_out").notNull(),
  // Date string
  country: varchar("country").notNull(),
  city: varchar("city").notNull(),
  // Region/City (without Notion links)
  name: varchar("name").notNull(),
  // Hotel/Accommodation name
  maps_pin: text("maps_pin"),
  // Google Maps link
  type: varchar("type").notNull().default("Hotel"),
  // Hotel, Airbnb, Hostel, Motel
  created_at: timestamp("created_at").defaultNow()
});
var insertStayinSchema = createInsertSchema(stayins).omit({
  id: true,
  user_id: true,
  created_at: true
});
var contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  is_read: boolean("is_read").default(false).notNull(),
  admin_reply: text("admin_reply"),
  replied_at: timestamp("replied_at"),
  user_reply: text("user_reply"),
  user_replied_at: timestamp("user_replied_at"),
  created_at: timestamp("created_at").defaultNow()
});
var insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  is_read: true,
  created_at: true
});

// server/db.ts
var NEON_DB_URL = "postgresql://neondb_owner:npg_xyUXg2cfJ5tT@ep-holy-recipe-aed2z25m-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";
var sql = neon(NEON_DB_URL);
var db = drizzle(sql, { schema: schema_exports });

// server/storage.ts
import { Pool } from "pg";
var NEON_DB_URL2 = "postgresql://neondb_owner:npg_xyUXg2cfJ5tT@ep-holy-recipe-aed2z25m-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";
var pool = new Pool({
  connectionString: NEON_DB_URL2,
  ssl: { rejectUnauthorized: false }
});
(async () => {
  try {
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_icon VARCHAR,
      ADD COLUMN IF NOT EXISTS profile_color VARCHAR,
      ADD COLUMN IF NOT EXISTS profile_setup_complete BOOLEAN DEFAULT FALSE NOT NULL
    `);
    console.log("\u2705 Database schema updated: profile columns added");
  } catch (err) {
    console.error("\u274C Schema update error:", err);
  }
})();
var storage = {
  /* ===============================
     👤 Users
     =============================== */
  async getUserByUsernameOrEmail(identifier) {
    const result = await pool.query(
      `SELECT * FROM users WHERE username = $1 OR email = $1`,
      [identifier]
    );
    return result.rows[0];
  },
  async getUser(id) {
    const result = await pool.query(
      `SELECT id, username, email, name, country, alien, is_admin AS "isAdmin", created_at AS "createdAt"
       FROM users
       WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },
  async getUserById(id) {
    const result = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },
  async getAllUsers() {
    const result = await pool.query(`SELECT * FROM users ORDER BY id ASC`);
    return result.rows;
  },
  async createUser({ username, email, passwordHash, name, country, approved, inviteCodeUsed }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const res = await client.query(`SELECT MAX(alien) AS maxAlien FROM users`);
      const maxAlien = res.rows[0]?.maxalien || "00";
      let nextAlienNumber = parseInt(maxAlien, 10) + 1;
      if (nextAlienNumber > 99) throw new Error("Maximum number of users reached");
      const alienStr = String(nextAlienNumber).padStart(2, "0");
      const insertRes = await client.query(
        `INSERT INTO users (username, email, password_hash, name, country, alien, approved, invite_code_used)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [username, email, passwordHash, name, country || null, alienStr, approved || false, inviteCodeUsed || null]
      );
      await client.query("COMMIT");
      return insertRes.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
  /* ===============================
     🎟️ Invite Codes
     =============================== */
  async validateInviteCode(code) {
    const result = await pool.query(
      `SELECT * FROM invite_codes 
       WHERE code = $1 
       AND is_active = true 
       AND (expires_at IS NULL OR expires_at > NOW())
       AND current_uses < max_uses`,
      [code]
    );
    return result.rows[0];
  },
  async markInviteCodeUsed(code, userId) {
    await pool.query(
      `UPDATE invite_codes 
       SET current_uses = current_uses + 1, used_by = $2
       WHERE code = $1`,
      [code, userId]
    );
  },
  async createInviteCode(createdBy, maxUses = 1, expiresAt) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    const result = await pool.query(
      `INSERT INTO invite_codes (code, created_by, max_uses, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [code, createdBy, maxUses, expiresAt || null]
    );
    return result.rows[0];
  },
  async getAllInviteCodes() {
    const result = await pool.query(
      `SELECT ic.*, u.username as created_by_username 
       FROM invite_codes ic
       LEFT JOIN users u ON ic.created_by = u.id
       ORDER BY ic.created_at DESC`
    );
    return result.rows;
  },
  async getUsersByInviteCode(code) {
    const result = await pool.query(
      `SELECT id, username, name, email, created_at
       FROM users
       WHERE invite_code_used = $1
       ORDER BY created_at DESC`,
      [code]
    );
    return result.rows;
  },
  async deactivateInviteCode(codeId) {
    const result = await pool.query(
      `UPDATE invite_codes 
       SET is_active = false
       WHERE id = $1
       RETURNING *`,
      [codeId]
    );
    return result.rows[0];
  },
  async getPendingUsers() {
    const result = await pool.query(
      `SELECT id, username, email, name, country, alien, created_at
       FROM users
       WHERE approved = false
       ORDER BY created_at DESC`
    );
    return result.rows;
  },
  async approveUser(userId) {
    const result = await pool.query(
      `UPDATE users 
       SET approved = true
       WHERE id = $1
       RETURNING *`,
      [userId]
    );
    return result.rows[0];
  },
  async rejectUser(userId) {
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
  },
  async deleteUser(userId) {
    await pool.query(`UPDATE invite_codes SET used_by = NULL WHERE used_by = $1`, [userId]);
    await pool.query(`DELETE FROM flights WHERE user_id = $1`, [userId]);
    await pool.query(`DELETE FROM stayins WHERE user_id = $1`, [userId]);
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
  },
  /* ===============================
     ✈️ Flights
     =============================== */
  async getUserFlights(userId) {
    const result = await pool.query(
      `SELECT *
       FROM flights
       WHERE user_id = $1
       ORDER BY date DESC`,
      [userId]
    );
    return result.rows;
  },
  async createFlight(flight) {
    const result = await pool.query(
      `INSERT INTO flights (
       user_id, airline_name, flight_number, departure, arrival,
       departure_latitude, departure_longitude, arrival_latitude, arrival_longitude,
       date, departure_time, arrival_time, aircraft_type, distance, duration, status,
       departure_terminal, arrival_terminal
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     RETURNING *`,
      [
        flight.userId,
        flight.airlineName,
        flight.flightNumber,
        flight.departure,
        flight.arrival,
        flight.departureLatitude ?? null,
        flight.departureLongitude ?? null,
        flight.arrivalLatitude ?? null,
        flight.arrivalLongitude ?? null,
        flight.date,
        flight.departureTime ?? null,
        flight.arrivalTime ?? null,
        flight.aircraftType ?? null,
        flight.distance ?? 0,
        flight.duration ?? null,
        flight.status ?? "scheduled",
        flight.departure_terminal ?? null,
        flight.arrival_terminal ?? null
      ]
    );
    return result.rows[0];
  },
  /* ===============================
     📧 Contact Messages
     =============================== */
  async createContactMessage(name, email, subject, message) {
    const result = await pool.query(
      `INSERT INTO contact_messages (name, email, subject, message, is_read, created_at)
       VALUES ($1, $2, $3, $4, false, NOW())
       RETURNING *`,
      [name, email, subject, message]
    );
    return result.rows[0];
  },
  async getAllContactMessages() {
    const result = await pool.query(
      `SELECT * FROM contact_messages ORDER BY created_at DESC`
    );
    return result.rows;
  },
  async markMessageAsRead(messageId) {
    const result = await pool.query(
      `UPDATE contact_messages SET is_read = true WHERE id = $1 RETURNING *`,
      [messageId]
    );
    return result.rows[0];
  },
  async replyToContactMessage(messageId, reply) {
    const result = await pool.query(
      `UPDATE contact_messages SET admin_reply = $1, replied_at = NOW() WHERE id = $2 RETURNING *`,
      [reply, messageId]
    );
    return result.rows[0];
  },
  async deleteContactMessage(messageId) {
    await pool.query(`DELETE FROM contact_messages WHERE id = $1`, [messageId]);
  },
  async getUserContactMessages(email) {
    const result = await pool.query(
      `SELECT * FROM contact_messages WHERE email = $1 ORDER BY created_at DESC`,
      [email]
    );
    return result.rows;
  },
  async userReplyToMessage(messageId, email, reply) {
    const result = await pool.query(
      `UPDATE contact_messages 
       SET user_reply = $1, user_replied_at = NOW() 
       WHERE id = $2 AND email = $3 
       RETURNING *`,
      [reply, messageId, email]
    );
    return result.rows[0];
  },
  /* ===============================
     🌍 User Location Update
     =============================== */
  async updateUserLocation(userId, latitude, longitude) {
    try {
      const result = await pool.query(
        `UPDATE users
       SET latitude = $1, longitude = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, username, email, name, country, alien, latitude, longitude, updated_at`,
        [latitude, longitude, userId]
      );
      return result.rows[0];
    } catch (err) {
      console.error("Error updating user location:", err);
      throw err;
    }
  },
  /* ===============================
     📝 User Profile Updates
     =============================== */
  async updateUserProfile(userId, data) {
    const result = await pool.query(
      `UPDATE users 
       SET name = $1, username = $2, email = $3, country = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, username, email, name, country, alien, is_admin AS "isAdmin"`,
      [data.name, data.username, data.email, data.country, userId]
    );
    return result.rows[0];
  },
  async updateUserPassword(userId, passwordHash) {
    await pool.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [passwordHash, userId]
    );
  },
  async updateProfileSetup(userId, data) {
    const result = await pool.query(
      `UPDATE users 
       SET profile_icon = $1, profile_color = $2, profile_setup_complete = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, username, email, name, country, alien, profile_icon, profile_color, profile_setup_complete, is_admin AS "isAdmin"`,
      [data.profile_icon, data.profile_color, data.profile_setup_complete, userId]
    );
    return result.rows[0];
  },
  async updateProfileIcon(userId, profile_icon) {
    const result = await pool.query(
      `UPDATE users 
       SET profile_icon = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, username, email, name, country, alien, profile_icon, profile_color, profile_setup_complete, is_admin AS "isAdmin"`,
      [profile_icon, userId]
    );
    return result.rows[0];
  }
};

// server/auth.ts
import { Router } from "express";
import bcrypt from "bcryptjs";

// server/jwt.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;
if (!JWT_SECRET) {
  throw new Error("\u274C Missing JWT_SECRET or SESSION_SECRET in environment variables.");
}
function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// server/auth.ts
var router = Router();
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password, country, inviteCode } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }
    const existingUser = await storage.getUserByUsernameOrEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }
    let approved = false;
    let usedInviteCode = null;
    if (inviteCode) {
      const validCode = await storage.validateInviteCode(inviteCode);
      if (validCode) {
        approved = true;
        usedInviteCode = inviteCode;
      } else {
        return res.status(400).json({ message: "Invalid or expired invite code" });
      }
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await storage.createUser({
      name,
      username,
      email,
      passwordHash,
      country: country || null,
      approved,
      inviteCodeUsed: usedInviteCode
    });
    if (usedInviteCode) {
      await storage.markInviteCodeUsed(usedInviteCode, newUser.id);
    }
    if (!approved) {
      return res.status(201).json({
        message: "Registration successful. Your account is pending admin approval.",
        requiresApproval: true
      });
    }
    const token = createToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      name: newUser.name,
      isAdmin: !!newUser.is_admin,
      alien: newUser.alien,
      country: newUser.country
    });
    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        country: newUser.country,
        alien: newUser.alien,
        is_admin: !!newUser.is_admin,
        approved: newUser.approved
      }
    });
  } catch (err) {
    console.error("\u274C Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email/username and password required" });
    }
    const user = await storage.getUserByUsernameOrEmail(email);
    if (!user || !user.password_hash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.approved) {
      return res.status(403).json({
        message: "Your account is pending admin approval. Please check back later.",
        requiresApproval: true
      });
    }
    const token = createToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      isAdmin: !!user.is_admin,
      alien: user.alien,
      country: user.country
    });
    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        country: user.country,
        alien: user.alien,
        is_admin: !!user.is_admin,
        approved: user.approved
      }
    });
  } catch (err) {
    console.error("\u274C Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});
router.get("/user", requireAuth, async (req, res) => {
  try {
    const tokenUser = req.user;
    if (!tokenUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUserById(tokenUser.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name ?? "",
      country: user.country ?? null,
      alien: user.alien,
      is_admin: user.is_admin ?? false,
      profile_icon: user.profile_icon ?? null,
      profile_color: user.profile_color ?? null,
      profile_setup_complete: user.profile_setup_complete ?? false
    });
  } catch (err) {
    console.error("\u274C Get user error:", err);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
});
router.patch("/profile", requireAuth, async (req, res) => {
  try {
    const { name, username, email, country } = req.body;
    const userId = req.user.userId;
    if (!name || !username || !email) {
      return res.status(400).json({ message: "Name, username, and email are required" });
    }
    const existingUser = await storage.getUserByUsernameOrEmail(email);
    if (existingUser && existingUser.id !== userId) {
      return res.status(409).json({ message: "Email already in use" });
    }
    const existingUsername = await storage.getUserByUsernameOrEmail(username);
    if (existingUsername && existingUsername.id !== userId) {
      return res.status(409).json({ message: "Username already taken" });
    }
    const updatedUser = await storage.updateUserProfile(userId, {
      name,
      username,
      email,
      country: country || "Other"
    });
    return res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("\u274C Profile update error:", err);
    return res.status(500).json({ message: "Failed to update profile" });
  }
});
router.patch("/password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required" });
    }
    const user = await storage.getUserById(userId);
    if (!user || !user.password_hash) {
      return res.status(404).json({ message: "User not found" });
    }
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await storage.updateUserPassword(userId, newPasswordHash);
    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("\u274C Password change error:", err);
    return res.status(500).json({ message: "Failed to change password" });
  }
});
router.delete("/account", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    await storage.deleteUser(userId);
    return res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("\u274C Delete account error:", err);
    return res.status(500).json({ message: "Failed to delete account" });
  }
});
router.post("/profile-setup", requireAuth, async (req, res) => {
  try {
    const { profile_icon, profile_color } = req.body;
    const userId = req.user.userId;
    if (!profile_icon || !profile_color) {
      return res.status(400).json({ message: "Icon and color are required" });
    }
    const updatedUser = await storage.updateProfileSetup(userId, {
      profile_icon,
      profile_color,
      profile_setup_complete: true
    });
    return res.json({
      message: "Profile setup completed successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("\u274C Profile setup error:", err);
    return res.status(500).json({ message: "Failed to complete profile setup" });
  }
});
router.patch("/profile-icon", requireAuth, async (req, res) => {
  try {
    const { profile_icon } = req.body;
    const userId = req.user.userId;
    if (!profile_icon) {
      return res.status(400).json({ message: "Icon is required" });
    }
    const updatedUser = await storage.updateProfileIcon(userId, profile_icon);
    return res.json({
      message: "Profile icon updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("\u274C Profile icon update error:", err);
    return res.status(500).json({ message: "Failed to update profile icon" });
  }
});
var auth_default = router;

// server/routes.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var airportsData = JSON.parse(readFileSync(join(__dirname, "../client/src/airports.json"), "utf-8"));
dotenv.config();
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing Authorization header" });
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ message: "Invalid or expired token" });
  req.user = {
    userId: decoded.userId,
    email: decoded.email,
    username: decoded.username,
    country: decoded.country ?? null,
    alien: decoded.alien ?? null,
    isAdmin: decoded.isAdmin ?? false
  };
  next();
}
function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ message: "Admins only" });
  next();
}
async function registerRoutes(app2) {
  app2.use("/api/auth", auth_default);
  app2.get("/api/admin/users", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const usersList = await storage.getAllUsers();
      return res.json(usersList.map(({ password_hash, ...u }) => ({ ...u, country: u.country ?? null })));
    } catch (err) {
      console.error("\u274C Error fetching users:", err);
      return res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/admin/pending-users", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const pendingUsers = await storage.getPendingUsers();
      return res.json(pendingUsers);
    } catch (err) {
      console.error("\u274C Error fetching pending users:", err);
      return res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });
  app2.post("/api/admin/approve-user/:userId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.approveUser(userId);
      return res.json({ message: "User approved", user });
    } catch (err) {
      console.error("\u274C Error approving user:", err);
      return res.status(500).json({ message: "Failed to approve user" });
    }
  });
  app2.delete("/api/admin/reject-user/:userId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.rejectUser(userId);
      return res.json({ message: "User rejected" });
    } catch (err) {
      console.error("\u274C Error rejecting user:", err);
      return res.status(500).json({ message: "Failed to reject user" });
    }
  });
  app2.delete("/api/admin/delete-user/:userId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.deleteUser(userId);
      return res.json({ message: "User deleted" });
    } catch (err) {
      console.error("\u274C Error deleting user:", err);
      return res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.post("/api/admin/invite-codes", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { maxUses, expiresAt } = req.body;
      const code = await storage.createInviteCode(
        req.user.userId,
        maxUses || 1,
        expiresAt ? new Date(expiresAt) : void 0
      );
      return res.json(code);
    } catch (err) {
      console.error("\u274C Error creating invite code:", err);
      return res.status(500).json({ message: "Failed to create invite code" });
    }
  });
  app2.get("/api/admin/invite-codes", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const codes = await storage.getAllInviteCodes();
      return res.json(codes);
    } catch (err) {
      console.error("\u274C Error fetching invite codes:", err);
      return res.status(500).json({ message: "Failed to fetch invite codes" });
    }
  });
  app2.patch("/api/admin/invite-codes/:codeId/deactivate", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { codeId } = req.params;
      const code = await storage.deactivateInviteCode(codeId);
      return res.json({ message: "Code deactivated", code });
    } catch (err) {
      console.error("\u274C Error deactivating invite code:", err);
      return res.status(500).json({ message: "Failed to deactivate invite code" });
    }
  });
  app2.get("/api/admin/invite-codes/:code/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { code } = req.params;
      const users2 = await storage.getUsersByInviteCode(code);
      return res.json(users2);
    } catch (err) {
      console.error("\u274C Error fetching users by invite code:", err);
      return res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/public/stats", async (_req, res) => {
    try {
      const totalFlightsResult = await db.select({ count: sql2`count(*)::int` }).from(flights);
      const totalFlights = totalFlightsResult[0]?.count || 0;
      const allFlights = await db.select({ arrival: flights.arrival }).from(flights);
      const countriesSet = /* @__PURE__ */ new Set();
      allFlights.forEach((f) => {
        if (f.arrival) {
          const trimmed = f.arrival.trim();
          const airport = airportsData.find((a) => a.iata === trimmed || a.icao === trimmed);
          if (airport?.iso_country) {
            countriesSet.add(airport.iso_country.toLowerCase());
          }
        }
      });
      const totalCountries = countriesSet.size;
      const totalUsersResult = await db.select({ count: sql2`count(*)::int` }).from(users).where(eq(users.approved, true));
      const totalUsers = totalUsersResult[0]?.count || 0;
      return res.json({
        totalFlights,
        totalCountries,
        totalUsers,
        userRating: 4.9
        // Static rating for now
      });
    } catch (err) {
      console.error("\u274C Error fetching public stats:", err);
      return res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  app2.get("/api/flights", requireAuth, async (req, res) => {
    try {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      await db.update(flights).set({ status: "Landed" }).where(
        and(
          eq(flights.user_id, req.user.userId),
          sql2`LOWER(${flights.status}) = 'scheduled'`,
          sql2`${flights.date} < ${today}`
        )
      );
      const flightsList = await db.select().from(flights).where(eq(flights.user_id, req.user.userId)).orderBy(desc(flights.date));
      return res.json(flightsList);
    } catch (err) {
      console.error("\u274C Error fetching flights:", err);
      return res.status(500).json({ message: "Failed to fetch flights" });
    }
  });
  app2.post("/api/flights", requireAuth, async (req, res) => {
    try {
      const body = req.body;
      const userId = req.user.userId;
      if (!body.date || !body.flight_number || !body.departure || !body.arrival || !body.status) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const findAirport = async (code) => {
        if (!code) return null;
        const result = await db.select().from(airports).where(eq(airports.iata, code)).limit(1);
        return result[0] ?? null;
      };
      const depAirport = await findAirport(body.departure);
      const arrAirport = await findAirport(body.arrival);
      const newFlight = {
        id: crypto.randomUUID(),
        user_id: userId,
        date: body.date,
        flight_number: body.flight_number,
        departure: depAirport?.iata ?? depAirport?.ident ?? body.departure,
        arrival: arrAirport?.iata ?? arrAirport?.ident ?? body.arrival,
        departure_time: body.departure_time ?? null,
        arrival_time: body.arrival_time ?? null,
        aircraft_type: body.aircraft_type ?? null,
        status: body.status,
        created_at: /* @__PURE__ */ new Date(),
        airline_name: body.airline_name ?? null,
        departure_terminal: body.departure_terminal ?? null,
        arrival_terminal: body.arrival_terminal ?? null,
        departure_latitude: body.departure_latitude ?? depAirport?.latitude ?? null,
        departure_longitude: body.departure_longitude ?? depAirport?.longitude ?? null,
        arrival_latitude: body.arrival_latitude ?? arrAirport?.latitude ?? null,
        arrival_longitude: body.arrival_longitude ?? arrAirport?.longitude ?? null,
        duration: body.duration ?? null,
        distance: body.distance ? Number(body.distance) : null,
        airline_code: body.airline_code ?? null
      };
      await db.insert(flights).values(newFlight);
      return res.status(201).json({ message: "Flight added successfully", flight: newFlight });
    } catch (err) {
      console.error("\u274C Error adding flight:", err);
      return res.status(500).json({ message: "Failed to add flight" });
    }
  });
  app2.delete("/api/flights/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await db.delete(flights).where(and(eq(flights.id, id), eq(flights.user_id, req.user.userId)));
      if (!deleted) return res.status(404).json({ message: "Flight not found" });
      return res.json({ message: "Flight deleted successfully" });
    } catch (err) {
      console.error("\u274C Error deleting flight:", err);
      return res.status(500).json({ message: "Failed to delete flight" });
    }
  });
  app2.get("/api/stayins", requireAuth, async (req, res) => {
    try {
      const stayinsList = await db.select().from(stayins).where(eq(stayins.user_id, req.user.userId)).orderBy(desc(stayins.check_in));
      return res.json(stayinsList);
    } catch (err) {
      console.error("\u274C Error fetching stay ins:", err);
      return res.status(500).json({ message: "Failed to fetch stay ins" });
    }
  });
  app2.post("/api/stayins", requireAuth, async (req, res) => {
    try {
      const body = req.body;
      const userId = req.user.userId;
      if (!body.name || !body.city || !body.country || !body.check_in || !body.check_out || !body.type) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const newStayIn = {
        id: crypto.randomUUID(),
        user_id: userId,
        name: body.name,
        city: body.city,
        country: body.country,
        check_in: body.check_in,
        check_out: body.check_out,
        maps_pin: body.maps_pin || null,
        type: body.type,
        created_at: /* @__PURE__ */ new Date()
      };
      await db.insert(stayins).values(newStayIn);
      return res.status(201).json({ message: "Stay in added successfully", stayin: newStayIn });
    } catch (err) {
      console.error("\u274C Error adding stay in:", err);
      return res.status(500).json({ message: "Failed to add stay in" });
    }
  });
  app2.delete("/api/stayins/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await db.delete(stayins).where(and(eq(stayins.id, id), eq(stayins.user_id, req.user.userId)));
      if (!deleted) return res.status(404).json({ message: "Stay in not found" });
      return res.json({ message: "Stay in deleted successfully" });
    } catch (err) {
      console.error("\u274C Error deleting stay in:", err);
      return res.status(500).json({ message: "Failed to delete stay in" });
    }
  });
  app2.get("/api/flights/search", requireAuth, async (req, res) => {
    try {
      const { flight_number, airline_name, dep_iata, arr_iata, date } = req.query;
      if (!date) return res.status(400).json({ message: "Date is required" });
      const conditions = [eq(flights.user_id, req.user.userId), eq(flights.date, date)];
      if (flight_number) conditions.push(eq(flights.flight_number, flight_number));
      if (airline_name) conditions.push(sql2`${flights.airline_name} ILIKE ${"%" + airline_name + "%"}`);
      if (dep_iata) conditions.push(eq(flights.departure, dep_iata));
      if (arr_iata) conditions.push(eq(flights.arrival, arr_iata));
      const flightsList = await db.select().from(flights).where(and(...conditions)).orderBy(desc(flights.date));
      return res.json(flightsList);
    } catch (err) {
      console.error("\u274C Error searching flights:", err);
      return res.status(500).json({ message: "Failed to search flights" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const contactMessage = await storage.createContactMessage(name, email, subject, message);
      return res.status(201).json({ message: "Message sent successfully", contactMessage });
    } catch (err) {
      console.error("\u274C Error saving contact message:", err);
      return res.status(500).json({ message: "Failed to send message" });
    }
  });
  app2.get("/api/admin/contact-messages", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      return res.json(messages);
    } catch (err) {
      console.error("\u274C Error fetching contact messages:", err);
      return res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });
  app2.patch("/api/admin/contact-messages/:messageId/read", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { messageId } = req.params;
      const message = await storage.markMessageAsRead(messageId);
      return res.json({ message: "Message marked as read", data: message });
    } catch (err) {
      console.error("\u274C Error marking message as read:", err);
      return res.status(500).json({ message: "Failed to mark message as read" });
    }
  });
  app2.delete("/api/admin/contact-messages/:messageId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { messageId } = req.params;
      await storage.deleteContactMessage(messageId);
      return res.json({ message: "Message deleted" });
    } catch (err) {
      console.error("\u274C Error deleting message:", err);
      return res.status(500).json({ message: "Failed to delete message" });
    }
  });
  app2.patch("/api/admin/contact-messages/:messageId/reply", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { messageId } = req.params;
      const { reply } = req.body;
      if (!reply || reply.trim() === "") {
        return res.status(400).json({ message: "Reply cannot be empty" });
      }
      const message = await storage.replyToContactMessage(messageId, reply);
      return res.json({ message: "Reply sent successfully", data: message });
    } catch (err) {
      console.error("\u274C Error replying to message:", err);
      return res.status(500).json({ message: "Failed to send reply" });
    }
  });
  app2.get("/api/contact-messages", requireAuth, async (req, res) => {
    try {
      const email = req.user.email;
      const messages = await storage.getUserContactMessages(email);
      return res.json(messages);
    } catch (err) {
      console.error("\u274C Error fetching user messages:", err);
      return res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.patch("/api/contact-messages/:messageId/user-reply", requireAuth, async (req, res) => {
    try {
      const { messageId } = req.params;
      const { reply } = req.body;
      const email = req.user.email;
      if (!reply || reply.trim() === "") {
        return res.status(400).json({ message: "Reply cannot be empty" });
      }
      const message = await storage.userReplyToMessage(messageId, email, reply);
      if (!message) {
        return res.status(404).json({ message: "Message not found or you don't have permission" });
      }
      return res.json({ message: "Reply sent successfully", data: message });
    } catch (err) {
      console.error("\u274C Error sending user reply:", err);
      return res.status(500).json({ message: "Failed to send reply" });
    }
  });
  const activeUsers = /* @__PURE__ */ new Map();
  app2.post("/api/radr/update", requireAuth, async (req, res) => {
    const { lat, lng } = req.body;
    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ message: "Invalid coordinates" });
    }
    const userId = req.user.userId;
    const username = req.user.username;
    const now = Date.now();
    const userProfile = await storage.getUserById(userId);
    const profile_icon = userProfile?.profile_icon;
    activeUsers.set(userId, { userId, username, lat, lng, lastSeen: now, profile_icon });
    const cutoff = now - 2 * 60 * 1e3;
    for (const [id, u] of activeUsers.entries()) {
      if (u.lastSeen < cutoff) activeUsers.delete(id);
    }
    return res.json({ message: "Location updated" });
  });
  app2.get("/api/radr/nearby", requireAuth, async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: "Missing coordinates" });
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const toRad = (v) => v * Math.PI / 180;
    const distanceKm = (a, b) => {
      const R = 6371;
      const dLat = toRad(b.lat - a.lat);
      const dLng = toRad(b.lng - a.lng);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    };
    const nearby = [...activeUsers.values()].filter((u) => u.userId !== req.user.userId).map((u) => ({
      ...u,
      distance: distanceKm({ lat: userLat, lng: userLng }, u)
    })).filter((u) => u.distance <= 10);
    return res.json({ nearby });
  });
  return createServer(app2);
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var __dirname2 = path.dirname(fileURLToPath2(import.meta.url));
var vite_config_default = defineConfig({
  root: path.resolve(__dirname2, "client"),
  publicDir: path.resolve(__dirname2, "client/public"),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname2, "client/src"),
      "@shared": path.resolve(__dirname2, "shared"),
      "@assets": path.resolve(__dirname2, "attached_assets")
    }
  },
  build: {
    outDir: path.resolve(__dirname2, "dist"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 2e4,
    // 20 MB
    rollupOptions: {
      output: {
        // Automatic code splitting: put node_modules into separate chunks
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id.toString().split("node_modules/")[1].split("/")[0].toString();
          }
        }
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
    hmr: {
      clientPort: 443
    },
    proxy: {
      "/api": "http://localhost:5000"
    }
  },
  logLevel: "info"
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath3(import.meta.url);
var __dirname3 = path2.dirname(__filename2);
var viteLogger = createLogger();
async function setupVite(app2, server) {
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: {
      ...vite_config_default.server,
      middlewareMode: true,
      hmr: { server }
    },
    appType: "custom",
    customLogger: viteLogger
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const templatePath = path2.resolve(__dirname3, "../client/index.html");
      let template = await fs.promises.readFile(templatePath, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const html = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

// server/index.ts
dotenv2.config();
process.env.NODE_ENV ||= "development";
console.log("\u{1F527} Loaded environment:", {
  hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
  hasSessionSecret: Boolean(process.env.SESSION_SECRET),
  nodeEnv: process.env.NODE_ENV
});
var app = express2();
app.set("trust proxy", 1);
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse;
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    capturedJsonResponse = body;
    return originalJson(body);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 100) logLine = logLine.slice(0, 99) + "\u2026";
      console.log(logLine);
    }
  });
  next();
});
var PgStore = connectPg(session);
app.use(
  session({
    store: new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: 7 * 24 * 60 * 60,
      tableName: "sessions"
    }),
    secret: process.env.SESSION_SECRET,
    name: "sessionId",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      path: "/"
    }
  })
);
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("\u274C Express Error:", message);
    res.status(status).json({ message });
  });
  console.log("\u{1F331} Express environment:", app.get("env"));
  if (app.get("env") === "development") {
    console.log("\u{1F680} Starting Vite in middleware mode...");
    await setupVite(app, server);
  } else {
    console.log("\u{1F4E6} Production: serving static files from dist/");
    app.use(express2.static("dist"));
    app.get("*", (_req, res) => {
      res.sendFile("index.html", { root: "dist" });
    });
  }
  const port = Number(process.env.PORT || 5e3);
  server.listen(port, "0.0.0.0", () => {
    console.log(`\u2705 Server running on http://0.0.0.0:${port}`);
  });
})();
