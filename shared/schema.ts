import { sql } from "drizzle-orm";
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
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* =======================================================
   🧠 Sessions Table
   ======================================================= */
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

/* =======================================================
   🎟️ Invite Codes Table
   ======================================================= */
export const inviteCodes = pgTable("invite_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 20 }).unique().notNull(),
  created_by: uuid("created_by").references(() => users.id),
  used_by: uuid("used_by").references(() => users.id),
  max_uses: integer("max_uses").default(1),
  current_uses: integer("current_uses").default(0),
  is_active: boolean("is_active").default(true).notNull(),
  expires_at: timestamp("expires_at"),
  created_at: timestamp("created_at").defaultNow(),
});

export type InviteCode = typeof inviteCodes.$inferSelect;

/* =======================================================
   👽 Users Table
   ======================================================= */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  alien: varchar("alien").unique().notNull(),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique().notNull(),
  password_hash: varchar("password_hash"),
  name: varchar("name").notNull(),
  country: varchar("country").default("Other").notNull(), // ✅ always set
  profile_image_url: varchar("profile_image_url"),
  is_admin: boolean("is_admin").default(false).notNull(),
  approved: boolean("approved").default(false).notNull(),
  invite_code_used: varchar("invite_code_used"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type User = typeof users.$inferSelect & { country: string }; // ensure country exists
export type InsertUser = typeof users.$inferInsert;

/* =======================================================
   🧾 Auth Schemas
   ======================================================= */
export const registerUserSchema = z.object({
  name: z.string().min(2, "Name is required"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  country: z.string().default("Other"), // default to Other if not provided
  alien: z
    .string()
    .regex(/^\d{2}$/, "Alien must be 2 digits (e.g. 01, 02, 10)")
    .optional(),
  inviteCode: z.string().optional(),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginUser = z.infer<typeof loginUserSchema>;

/* =======================================================
   ✈️ Flights Table
   ======================================================= */
export const flights = pgTable("flights", {
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
  date: varchar("date"), // YYYY-MM-DD

  // ✅ Add terminal columns
  departure_terminal: varchar("departure_terminal"),
  arrival_terminal: varchar("arrival_terminal"),

  aircraft_type: varchar("aircraft_type"),
  distance: doublePrecision("distance"), // km
  duration: varchar("duration"),
  status: varchar("status").default("scheduled"),

  created_at: timestamp("created_at").defaultNow(),
});


export const insertFlightSchema = createInsertSchema(flights).omit({
  id: true,
  user_id: true,
  created_at: true,
});

export type Flight = typeof flights.$inferSelect;
export type InsertFlight = z.infer<typeof insertFlightSchema>;

/* =======================================================
   🏢 Airlines Table
   ======================================================= */
export const airlines = pgTable("airlines", {
  id: uuid("id").defaultRandom().primaryKey(),
  airline_code: varchar("airline_code", { length: 3 }).unique().notNull(),
  airline_name: varchar("airline_name").notNull(),
  country: varchar("country").notNull(),
  icao: varchar("icao"),
  iata: varchar("iata"),
});

export const insertAirlineSchema = createInsertSchema(airlines);
export type Airline = typeof airlines.$inferSelect;
export type InsertAirline = z.infer<typeof insertAirlineSchema>;

/* =======================================================
   🌍 Airports Table
   ======================================================= */
export const airports = pgTable("airports", {
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
  local_code: varchar("local_code"),
});

export const insertAirportSchema = createInsertSchema(airports);
export type Airport = typeof airports.$inferSelect;
export type InsertAirport = z.infer<typeof insertAirportSchema>;


/* =======================================================
   🏨 Stay Ins Table
   ======================================================= */
export const stayins = pgTable("stayins", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => users.id).notNull(),
  
  check_in: varchar("check_in").notNull(), // Date string
  check_out: varchar("check_out").notNull(), // Date string
  
  country: varchar("country").notNull(),
  city: varchar("city").notNull(), // Region/City (without Notion links)
  name: varchar("name").notNull(), // Hotel/Accommodation name
  maps_pin: text("maps_pin"), // Google Maps link
  type: varchar("type").notNull().default("Hotel"), // Hotel, Airbnb, Hostel, Motel
  
  created_at: timestamp("created_at").defaultNow(),
});

export const insertStayinSchema = createInsertSchema(stayins).omit({
  id: true,
  user_id: true,
  created_at: true,
});

export type Stayin = typeof stayins.$inferSelect;
export type InsertStayin = z.infer<typeof insertStayinSchema>;
