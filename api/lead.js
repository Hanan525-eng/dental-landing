export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const {
      name,
      phone,
      clinic = "",
      role = "",
      survey = {},
      type = "lead",
      ts,
    } = req.body || {};

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    const lead = {
      name: String(name).trim(),
      phone: String(phone).trim(),
      clinic: String(clinic).trim(),
      role: String(role).trim(),
      survey,
      type,
      created_at: ts || new Date().toISOString(),
    };

    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/leads`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(lead),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Supabase error:", errorText);

      return res.status(500).json({
        success: false,
        message: "Failed to save lead",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead received successfully",
    });
  } catch (error) {
    console.error("Lead API error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}