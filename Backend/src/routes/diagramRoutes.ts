import { supabase } from "../config/supabase";
import { Router } from "express";
const router = Router();

router.post("/diagram/create", async (req, res) => {
    try {
        let { title, diagram_information, userId} = req.body;

        // Validate input
        if (!title || !userId) {
            return res.status(400).json({ error: "Title, descriotion, and owner are required" });
        }
        if (!diagram_information) {
            diagram_information = "";
        }

        // Check if user already exists
        const { data: existingUser, error: checkError } = await supabase
            .from("users")
            .select("id")
            .eq("id", userId)
            .maybeSingle();

        if (checkError) {
            return res.status(500).json({ error: "Database error" });
        }

        if (!existingUser) {
            return res.status(400).json({ error: "Creator not found!" });
        }

        // Insert new diagram
        const { data, error } = await supabase
        .from("diagrams")
            .insert({
                title: title,
                diagram_information: diagram_information,
            })
            .select();
            
            if (error) {
                return res.status(500).json({ error: "Failed to create diagram" });
            }

        return res.status(201).json({ 
            success: true, 
            message: "Diagram created successfully",
            diagram: { id: data[0].id, title: data[0].title, diagram_information: data[0].diagram_information },
        });
    } catch (error) {
        console.error("Session Creation Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/diagram/fetch", async (req, res) => {
    try {
        let { userId, diagramId } = req.body;

        // Validate input
        if (!userId || !diagramId) {
            return res.status(400).json({ error: "Owner or Diagram not valid" });
        }

        // Check if user already exists
        const { data: matchPerms, error: checkError } = await supabase
            .from("diagrams")
            .select("owner")
            .eq("owner", userId)
            .maybeSingle();

        if (checkError) {
            return res.status(500).json({ error: "Database error" });
        }

        if (!matchPerms) {
            return res.status(400).json({ error: "Owner does not match!" });
        }

        // Insert new diagram
        const { data, error } = await supabase
            .from("diagrams")
            .select("id, title, diagram_information, history")
            .eq("id", diagramId)
            .maybeSingle();

        if (!data ||error) {
            return res.status(500).json({ error: "Failed to fetch diagram" });
        }

        return res.status(201).json({ 
            success: true, 
            message: "Diagram fetched successfully",
            diagram: { id: data[0].id, title: data[0].title, diagram_information: data[0].diagram_information},
        });
    } catch (error) {
        console.error("Session Creation Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});