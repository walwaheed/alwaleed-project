import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "";

const STATUS_COLORS = {
  paid: "bg-green-100 text-green-800",
  processing: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  abandoned: "bg-gray-100 text-gray-500",
  pending_payment: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-teal-100 text-teal-800",
};

export default function Admin() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/Login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.status === 401) { navigate("/Login"); return; }
        if (res.status === 403) {
          setError(`Not authorized. Logged in as: ${session.user?.email}`);
          setLoading(false);
          return;
        }
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Failed to load data");
        }

        const { rows } = await res.json();
        setRows(rows);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Print Size</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.order_number}</td>
                <td className="px-4 py-3 font-medium">{row.customer_name || ""}</td>
                <td className="px-4 py-3 text-gray-500">{row.email || ""}</td>
                <td className="px-4 py-3 capitalize">{row.channel || ""}</td>
                <td className="px-4 py-3">
                  {row.lifecycle_stage
                    ? <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs">{row.lifecycle_stage}</span>
                    : ""}
                </td>
                <td className="px-4 py-3">
                  {row.photo_url
                    ? <img src={row.photo_url} alt={row.photo_title || ""} className="h-10 w-10 object-cover rounded" />
                    : ""}
                </td>
                <td className="px-4 py-3">{row.print_size || ""}</td>
                <td className="px-4 py-3">SAR {row.total_amount}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[row.status] || "bg-gray-100 text-gray-600"}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(row.created_at).toLocaleDateString("en-GB")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="text-center py-10 text-gray-400">No orders found.</p>
        )}
      </div>
    </div>
  );
}
