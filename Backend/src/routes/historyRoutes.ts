import { supabase } from "../config/supabase";
import { Router } from "express";
const router = Router();

router.post("/diagram/history/create", async (req, res) => {
    try {
        let { diagramId, prompt, mermaidjs } = req.body;

        // Validate input
        if (!diagramId || !prompt || !mermaidjs) {
            return res.status(400).json({ error: "diagramId, prompt, and mermaidjs are required" });
        }

        // Check if user already exists
        const { data, error } = await supabase
            .from("diagram_history")
                .insert({
                prompt: prompt,
                mermaidjs: mermaidjs,
                diagramId: diagramId,
            })
            .select();  

        if (error) {
            return res.status(500).json({ error: "Database error" });
        }

       return res.status(201).json({ 
            success: true, 
            message: "History created successfully",
            diagram_history: { id: data[0].id, prompt: data[0].prompt, mermaidjs: data[0].mermaidjs },
        });
    } catch (error) {
        console.error("Session Creation Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/diagram/history/fetch", async (req, res) => {
    try {
        let { diagramId } = req.body;

        // Validate input
        if (!diagramId) {
            return res.status(400).json({ error: "Diagram not valid" });
        }

        // Check if user already exists
        const { data, error: checkError } = await supabase
            .from("diagram_history")
            .select("created_at, diagramId, prompt, mermaidjs")
            .eq("diagramId", diagramId)
            .order('created_at', { ascending: false });

        if (checkError) {
            return res.status(500).json({ error: "Database error" });
        }

        if (!data) {
            return res.status(400).json({ error: "Owner does not match!" });
        }

        return res.status(201).json({ 
            success: true, 
            message: "Diagram History fetched successfully",
            history: data,
        });
    } catch (error) {
        console.error("Session Creation Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;