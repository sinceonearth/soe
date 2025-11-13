import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import dotenv from "dotenv";
import { sql, eq, desc, and } from "drizzle-orm";
import crypto from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { db } from "./db";
import { storage } from "./storage";
import { flights, airports, stayins, users, contactMessages } from "@shared/schema";
import authRouter from "./auth";
import { verifyToken } from "./jwt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const airportsData = JSON.parse(readFileSync(join(__dirname, "../client/src/airports.json"), "utf-8"));

dotenv.config();

/* =========================
   Request with user type
========================= */
export interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
    country?: string | null;
    alien?: string | null;
    isAdmin?: boolean;
  };
}

/* =========================
   Auth middleware
========================= */
export function requireAuth(req: RequestWithUser, res: Response, next: NextFunction) {
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
    isAdmin: decoded.isAdmin ?? false,
  };

  next();
}

export function requireAdmin(req: RequestWithUser, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) return res.status(403).json({ message: "Admins only" });
  next();
}

/* =========================
   Register routes
========================= */
export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api/auth", authRouter);

  // --- Admin: list all users ---
  app.get("/api/admin/users", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const usersList = await storage.getAllUsers();
      return res.json(usersList.map(({ password_hash, ...u }) => ({ ...u, country: u.country ?? null })));
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      return res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // --- Admin: get pending users ---
  app.get("/api/admin/pending-users", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const pendingUsers = await storage.getPendingUsers();
      return res.json(pendingUsers);
    } catch (err) {
      console.error("❌ Error fetching pending users:", err);
      return res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });

  // --- Admin: approve user ---
  app.post("/api/admin/approve-user/:userId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.approveUser(userId);
      return res.json({ message: "User approved", user });
    } catch (err) {
      console.error("❌ Error approving user:", err);
      return res.status(500).json({ message: "Failed to approve user" });
    }
  });

  // --- Admin: reject user ---
  app.delete("/api/admin/reject-user/:userId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.rejectUser(userId);
      return res.json({ message: "User rejected" });
    } catch (err) {
      console.error("❌ Error rejecting user:", err);
      return res.status(500).json({ message: "Failed to reject user" });
    }
  });

  // --- Admin: create invite code ---
  app.post("/api/admin/invite-codes", requireAuth, requireAdmin, async (req: RequestWithUser, res) => {
    try {
      const { maxUses, expiresAt } = req.body;
      const code = await storage.createInviteCode(
        req.user!.userId,
        maxUses || 1,
        expiresAt ? new Date(expiresAt) : undefined
      );
      return res.json(code);
    } catch (err) {
      console.error("❌ Error creating invite code:", err);
      return res.status(500).json({ message: "Failed to create invite code" });
    }
  });

  // --- Admin: list invite codes ---
  app.get("/api/admin/invite-codes", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const codes = await storage.getAllInviteCodes();
      return res.json(codes);
    } catch (err) {
      console.error("❌ Error fetching invite codes:", err);
      return res.status(500).json({ message: "Failed to fetch invite codes" });
    }
  });

  // --- Admin: deactivate invite code ---
  app.patch("/api/admin/invite-codes/:codeId/deactivate", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { codeId } = req.params;
      const code = await storage.deactivateInviteCode(codeId);
      return res.json({ message: "Code deactivated", code });
    } catch (err) {
      console.error("❌ Error deactivating invite code:", err);
      return res.status(500).json({ message: "Failed to deactivate invite code" });
    }
  });

  // --- Admin: get users by invite code ---
  app.get("/api/admin/invite-codes/:code/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { code } = req.params;
      const users = await storage.getUsersByInviteCode(code);
      return res.json(users);
    } catch (err) {
      console.error("❌ Error fetching users by invite code:", err);
      return res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // --- Get public stats for landing page ---
  app.get("/api/public/stats", async (_req, res) => {
    try {
      // Get total flights count
      const totalFlightsResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(flights);
      const totalFlights = totalFlightsResult[0]?.count || 0;

      // Get unique countries using airport codes (same logic as Achievements page)
      const allFlights = await db
        .select({ arrival: flights.arrival })
        .from(flights);

      const countriesSet = new Set<string>();
      
      allFlights.forEach(f => {
        if (f.arrival) {
          const trimmed = f.arrival.trim();
          // Check both IATA (3-letter) and ICAO (4-letter) codes
          const airport = airportsData.find((a: any) => a.iata === trimmed || a.icao === trimmed);
          if (airport?.iso_country) {
            countriesSet.add(airport.iso_country.toLowerCase());
          }
        }
      });
      
      const totalCountries = countriesSet.size;

      // Get total approved users
      const totalUsersResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(eq(users.approved, true));
      const totalUsers = totalUsersResult[0]?.count || 0;

      return res.json({
        totalFlights,
        totalCountries,
        totalUsers,
        userRating: 4.9 // Static rating for now
      });
    } catch (err) {
      console.error("❌ Error fetching public stats:", err);
      return res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // --- List flights for logged-in user ---
  app.get("/api/flights", requireAuth, async (req: RequestWithUser, res) => {
    try {
      // First, update flight statuses for past flights (excluding today)
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      await db
        .update(flights)
        .set({ status: "Landed" })
        .where(
          and(
            eq(flights.user_id, req.user!.userId),
            sql`LOWER(${flights.status}) = 'scheduled'`,
            sql`${flights.date} < ${today}`
          )
        );
      
      // Fetch all flights
      const flightsList = await db
        .select()
        .from(flights)
        .where(eq(flights.user_id, req.user!.userId))
        .orderBy(desc(flights.date));
      return res.json(flightsList);
    } catch (err) {
      console.error("❌ Error fetching flights:", err);
      return res.status(500).json({ message: "Failed to fetch flights" });
    }
  });

  // --- Add flight ---
  app.post("/api/flights", requireAuth, async (req: RequestWithUser, res) => {
    try {
      const body = req.body;
      const userId = req.user!.userId;

      if (!body.date || !body.flight_number || !body.departure || !body.arrival || !body.status) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const findAirport = async (code: string) => {
        if (!code) return null;
        const result = await db
          .select()
          .from(airports)
          .where(eq(airports.iata, code))
          .limit(1);
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
        created_at: new Date(),
        airline_name: body.airline_name ?? null,
        departure_terminal: body.departure_terminal ?? null,
        arrival_terminal: body.arrival_terminal ?? null,
        departure_latitude: body.departure_latitude ?? depAirport?.latitude ?? null,
        departure_longitude: body.departure_longitude ?? depAirport?.longitude ?? null,
        arrival_latitude: body.arrival_latitude ?? arrAirport?.latitude ?? null,
        arrival_longitude: body.arrival_longitude ?? arrAirport?.longitude ?? null,
        duration: body.duration ?? null,
        distance: body.distance ? Number(body.distance) : null,
        airline_code: body.airline_code ?? null,
      };

      await db.insert(flights).values(newFlight);
      return res.status(201).json({ message: "Flight added successfully", flight: newFlight });
    } catch (err) {
      console.error("❌ Error adding flight:", err);
      return res.status(500).json({ message: "Failed to add flight" });
    }
  });

  // --- Delete flight ---
  app.delete("/api/flights/:id", requireAuth, async (req: RequestWithUser, res) => {
    try {
      const { id } = req.params;
      const deleted = await db
        .delete(flights)
        .where(and(eq(flights.id, id), eq(flights.user_id, req.user!.userId)));
      if (!deleted) return res.status(404).json({ message: "Flight not found" });
      return res.json({ message: "Flight deleted successfully" });
    } catch (err) {
      console.error("❌ Error deleting flight:", err);
      return res.status(500).json({ message: "Failed to delete flight" });
    }
  });

  // --- List stay ins for logged-in user ---
  app.get("/api/stayins", requireAuth, async (req: RequestWithUser, res) => {
    try {
      const stayinsList = await db
        .select()
        .from(stayins)
        .where(eq(stayins.user_id, req.user!.userId))
        .orderBy(desc(stayins.check_in));
      return res.json(stayinsList);
    } catch (err) {
      console.error("❌ Error fetching stay ins:", err);
      return res.status(500).json({ message: "Failed to fetch stay ins" });
    }
  });

  // --- Add stay in ---
  app.post("/api/stayins", requireAuth, async (req: RequestWithUser, res) => {
    try {
      const body = req.body;
      const userId = req.user!.userId;

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
        created_at: new Date(),
      };

      await db.insert(stayins).values(newStayIn);
      return res.status(201).json({ message: "Stay in added successfully", stayin: newStayIn });
    } catch (err) {
      console.error("❌ Error adding stay in:", err);
      return res.status(500).json({ message: "Failed to add stay in" });
    }
  });

  // --- Delete stay in ---
  app.delete("/api/stayins/:id", requireAuth, async (req: RequestWithUser, res) => {
    try {
      const { id } = req.params;
      const deleted = await db
        .delete(stayins)
        .where(and(eq(stayins.id, id), eq(stayins.user_id, req.user!.userId)));
      if (!deleted) return res.status(404).json({ message: "Stay in not found" });
      return res.json({ message: "Stay in deleted successfully" });
    } catch (err) {
      console.error("❌ Error deleting stay in:", err);
      return res.status(500).json({ message: "Failed to delete stay in" });
    }
  });

  // --- Search flights (local DB only) ---
  app.get("/api/flights/search", requireAuth, async (req: RequestWithUser, res) => {
    try {
      const { flight_number, airline_name, dep_iata, arr_iata, date } = req.query;

      if (!date) return res.status(400).json({ message: "Date is required" });

      const conditions = [eq(flights.user_id, req.user!.userId), eq(flights.date, date as string)];

      if (flight_number) conditions.push(eq(flights.flight_number, flight_number as string));
      if (airline_name) conditions.push(sql`${flights.airline_name} ILIKE ${'%' + (airline_name as string) + '%'}`);
      if (dep_iata) conditions.push(eq(flights.departure, dep_iata as string));
      if (arr_iata) conditions.push(eq(flights.arrival, arr_iata as string));

      const flightsList = await db
        .select()
        .from(flights)
        .where(and(...conditions))
        .orderBy(desc(flights.date));

      return res.json(flightsList);
    } catch (err) {
      console.error("❌ Error searching flights:", err);
      return res.status(500).json({ message: "Failed to search flights" });
    }
  });

  // --- Contact form submission (public) ---
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const contactMessage = await storage.createContactMessage(name, email, subject, message);
      return res.status(201).json({ message: "Message sent successfully", contactMessage });
    } catch (err) {
      console.error("❌ Error saving contact message:", err);
      return res.status(500).json({ message: "Failed to send message" });
    }
  });

  // --- Admin: get all contact messages ---
  app.get("/api/admin/contact-messages", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      return res.json(messages);
    } catch (err) {
      console.error("❌ Error fetching contact messages:", err);
      return res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  // --- Admin: mark message as read ---
  app.patch("/api/admin/contact-messages/:messageId/read", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { messageId } = req.params;
      const message = await storage.markMessageAsRead(messageId);
      return res.json({ message: "Message marked as read", data: message });
    } catch (err) {
      console.error("❌ Error marking message as read:", err);
      return res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // --- Admin: delete contact message ---
  app.delete("/api/admin/contact-messages/:messageId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { messageId } = req.params;
      await storage.deleteContactMessage(messageId);
      return res.json({ message: "Message deleted" });
    } catch (err) {
      console.error("❌ Error deleting message:", err);
      return res.status(500).json({ message: "Failed to delete message" });
    }
  });

// --- Radar: update & get nearby users ---
const activeUsers = new Map<
  string,
  { userId: string; username: string; lat: number; lng: number; lastSeen: number }
>();

app.post("/api/radr/update", requireAuth, async (req: RequestWithUser, res) => {
  const { lat, lng } = req.body;
  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ message: "Invalid coordinates" });
  }

  const userId = req.user!.userId;
  const username = req.user!.username;
  const now = Date.now();

  activeUsers.set(userId, { userId, username, lat, lng, lastSeen: now });

  // Remove users who haven't updated in 2 minutes
  const cutoff = now - 2 * 60 * 1000;
  for (const [id, u] of activeUsers.entries()) {
    if (u.lastSeen < cutoff) activeUsers.delete(id);
  }

  return res.json({ message: "Location updated" });
});

app.get("/api/radr/nearby", requireAuth, async (req: RequestWithUser, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ message: "Missing coordinates" });

  const userLat = parseFloat(lat as string);
  const userLng = parseFloat(lng as string);

  const toRad = (v: number) => (v * Math.PI) / 180;
  const distanceKm = (a: any, b: any) => {
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const nearby = [...activeUsers.values()]
    .filter((u) => u.userId !== req.user!.userId)
    .map((u) => ({
      ...u,
      distance: distanceKm({ lat: userLat, lng: userLng }, u),
    }))
    .filter((u) => u.distance <= 10); // within 10 km

  return res.json({ nearby });
});

  return createServer(app);
}
