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

    const cleanedPhone = String(phone).trim();

    // نتأكد من عدم التكرار بس لتسجيلات النوع "lead" الأساسية
    // (مش لإجابات الاستبيان "survey" اللي بتتبعت لنفس الرقم عمداً)
    if (type === "lead") {
      const checkResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/leads?phone=eq.${encodeURIComponent(
          cleanedPhone,
        )}&type=eq.lead&select=id`,
        {
          method: "GET",
          headers: {
            apikey: process.env.SUPABASE_SECRET_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
          },
        },
      );

      if (checkResponse.ok) {
        const existing = await checkResponse.json();
        if (Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({
            success: false,
            message: "This phone number is already registered",
          });
        }
      } else {
        console.error(
          "Supabase duplicate-check error:",
          await checkResponse.text(),
        );
        // منوقفش التسجيل بسبب فشل التحقق نفسه - نكمل ونحاول الإدراج العادي
      }
    }

    const lead = {
      name: String(name).trim(),
      phone: cleanedPhone,
      clinic: String(clinic).trim(),
      role: String(role).trim(),
      survey,
      type,
      created_at: ts || new Date().toISOString(),
    };

    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(lead),
    });

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
