const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/requireAdmin");
const supabase = require("../lib/supabase");
const crmSupabase = require("../lib/crm-supabase");

router.get("/dashboard", requireAdmin, async (req, res) => {
  try {
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("order_number, user_email, total_amount, status, items, created_at, tracking_number")
      .order("created_at", { ascending: false });

    if (ordersError) throw ordersError;

    const emails = [...new Set((orders || [])
      .map(o => o.user_email)
      .filter(e => e && e !== "guest@alwaleed.pro")
    )];

    let customers = [];
    if (emails.length > 0) {
      const { data: customerRows, error: customersError } = await crmSupabase
        .from("customers")
        .select("email, name, lifecycle_stage, last_interaction_channel")
        .in("email", emails);

      if (customersError) throw customersError;
      customers = customerRows || [];
    }

    const customerByEmail = new Map(customers.map(c => [c.email, c]));

    const rows = (orders || []).flatMap(order => {
      const customer = customerByEmail.get(order.user_email);
      const items = Array.isArray(order.items) ? order.items : [];

      const base = {
        order_number: order.order_number,
        tracking_number: order.tracking_number,
        email: order.user_email,
        customer_name: customer?.name || null,
        channel: customer?.last_interaction_channel || null,
        lifecycle_stage: customer?.lifecycle_stage || null,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
      };

      if (items.length === 0) {
        return [{ ...base, photo_url: null, print_size: null, photo_title: null }];
      }

      return items.map(item => ({
        ...base,
        photo_url: item.photo_url || null,
        print_size: item.print_size || null,
        photo_title: item.photo_title || null,
      }));
    });

    res.json({ rows });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

module.exports = router;
