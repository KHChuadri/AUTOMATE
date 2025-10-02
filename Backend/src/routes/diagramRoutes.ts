import { supabase } from "../config/supabase";
import { Router } from "express";
import { GenerateMermaidDiagram } from "../services/openAI";

const router = Router();

router.post("/diagram/create", async (req, res) => {
  try {
    let { title, userId } = req.body;

    if (!title || !userId) {
      return res
        .status(400)
        .json({ error: "Title, descriotion, and owner are required" });
    }
    console.log("Checkpoint 1");
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    console.log("Checkpoint 2");
    if (checkError) {
      return res.status(500).json({ error: "Database error" });
    }

    if (!existingUser) {
      return res.status(400).json({ error: "Creator not found!" });
    }

    console.log("Checkpoint 3");
    // Insert new diagram
    const { data, error } = await supabase
      .from("diagrams")
      .insert({
        title: title,
        owner: userId,
      })
      .select();

    console.log("Checkpoint 4")
    console.log("Insert result:", error); 
    if (error) {
      console.log("err here")
      return res.status(500).json({ error: "Failed to create diagram" });
    }

    return res.status(201).json({
      success: true,
      message: "Diagram created successfully",
      diagram: {
        id: data[0].id,
        title: data[0].title,
        diagram_information: data[0].diagram_information,
      },
    });
  } catch (error) {
    console.error("Session Creation Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/diagram/fetch", async (req, res) => {
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
      .select("id, title, history")
      .eq("id", diagramId)
      .maybeSingle();

    if (!data || error) {
      return res.status(500).json({ error: "Failed to fetch diagram" });
    }
    console.log(data)
    return res.status(201).json({
      success: true,
      message: "Diagram fetched successfully",
      diagram: {
        id: data[0].id,
        title: data[0].title,
      },
    });
  } catch (error) {
    console.error("Session Creation Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/diagram/fetch-all", async (req, res) => {
  try {
    let { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch all diagrams for this user
    const { data, error } = await supabase
      .from("diagrams")
      .select("id, title, created_at")
      .eq("owner", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch diagrams" });
    }

    return res.status(200).json({
      success: true,
      diagrams: data || [],
    });
  } catch (error) {
    console.error("Fetch diagrams error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/diagram/generate-diagram", async (req, res) => {
  const { prompt, previousDiagram } = req.body;
  try {
    const response = await GenerateMermaidDiagram(prompt, previousDiagram);
    return res.status(200).json({
      success: true,
      mermaidCode: response
    });
  } catch (err) {
    console.error("Fetch diagrams error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
