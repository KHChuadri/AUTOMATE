import { supabase } from "@/config/supabase";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

// JWT secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

router.post("/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required" });
        }

        // Check if user already exists
        const { data: existingUser, error: checkError } = await supabase
            .from("users")
            .select("email")
            .eq("email", email)
            .maybeSingle();

        if (checkError) {
            return res.status(500).json({ error: "Database error" });
        }

        if (existingUser) {
            return res.status(400).json({ error: "Email already registered!" });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const { data, error } = await supabase
            .from("users")
            .insert({
                name: name,
                email: email,
                password: hashedPassword
            })
            .select();

        if (error) {
            return res.status(500).json({ error: "Failed to create user" });
        }

        return res.status(201).json({ 
            success: true, 
            message: "User registered successfully",
            user: { id: data[0].id, name: data[0].name, email: data[0].email }
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find user by email
        const { data: user, error } = await supabase
            .from("users")
            .select("id, name, email, password")
            .eq("email", email)
            .maybeSingle();

        if (error) {
            return res.status(500).json({ error: "Database error" });
        }

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email 
            },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Return user data and token (exclude password)
        const { password: _, ...userWithoutPassword } = user;
        
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;