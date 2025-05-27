import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Vault management routes
  
  // Save vault data to MySQL
  app.post("/api/vault", async (req: Request, res: Response) => {
    try {
      const { userId, encryptedData, salt, iv } = req.body;
      
      if (!userId || !encryptedData || !salt || !iv) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      await storage.saveVault(userId, encryptedData, salt, iv);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving vault:", error);
      res.status(500).json({ error: "Failed to save vault" });
    }
  });

  // Get vault data from MySQL
  app.get("/api/vault/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const vault = await storage.getVault(userId);
      
      if (!vault) {
        return res.status(404).json({ error: "Vault not found" });
      }

      res.json(vault);
    } catch (error) {
      console.error("Error getting vault:", error);
      res.status(500).json({ error: "Failed to get vault" });
    }
  });

  // Check if vault exists for user
  app.get("/api/vault/:userId/exists", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const vault = await storage.getVault(userId);
      res.json({ exists: !!vault });
    } catch (error) {
      console.error("Error checking vault:", error);
      res.status(500).json({ error: "Failed to check vault" });
    }
  });

  // Share password routes
  
  // Create a shared password link
  app.post("/api/share", async (req: Request, res: Response) => {
    try {
      const { passwordData, expiresAt } = req.body;
      
      if (!passwordData || !expiresAt) {
        return res.status(400).json({ error: "Password data and expiration time are required" });
      }

      const shareId = await storage.createSharedPassword(passwordData, expiresAt);
      res.json({ shareId });
    } catch (error) {
      console.error("Error creating shared password:", error);
      res.status(500).json({ error: "Failed to create shared password" });
    }
  });

  // Get shared password by share ID
  app.get("/api/share/:shareId", async (req: Request, res: Response) => {
    try {
      const { shareId } = req.params;
      
      const sharedPassword = await storage.getSharedPassword(shareId);
      
      if (!sharedPassword) {
        return res.status(404).json({ error: "Shared password not found or expired" });
      }

      // Check if expired
      if (new Date() > new Date(sharedPassword.expiresAt)) {
        // Delete expired share
        await storage.deleteSharedPassword(shareId);
        return res.status(404).json({ error: "Shared password has expired" });
      }

      res.json(sharedPassword);
    } catch (error) {
      console.error("Error getting shared password:", error);
      res.status(500).json({ error: "Failed to get shared password" });
    }
  });

  // User management routes
  
  // Create user with PIN hash or update existing user's PIN
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const { username, pinHash } = req.body;
      
      if (!username || !pinHash) {
        return res.status(400).json({ error: "Username and PIN hash are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        // Update existing user's PIN hash
        await storage.updateUserPin(existingUser.id, pinHash);
        res.json({ id: existingUser.id, username: existingUser.username });
      } else {
        // Create new user
        const user = await storage.createUser({ username, pinHash });
        res.json({ id: user.id, username: user.username });
      }
    } catch (error) {
      console.error("Error creating/updating user:", error);
      res.status(500).json({ error: "Failed to create/update user" });
    }
  });

  // Get user by username
  app.get("/api/users/:username", async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ id: user.id, username: user.username, pinHash: user.pinHash });
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
