const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const currentSessionId = localStorage.getItem("rajathadri_session_id");
const tableNo = localStorage.getItem("rajathadri_table") || "1";

document.addEventListener("DOMContentLoaded", () => {
  const tableTitle = document.getElementById("historyTableTitle");
  if (tableTitle) tableTitle.textContent = `TABLE ${tableNo}`;
  loadSessionOrders();
});

async function loadSessionOrders() {
  const container = document.getElementById("historyList");
  if (!currentSessionId) {
    container.innerHTML = `<p class="empty-checkout">No active orders found for this table session.</p>`;
    return;
  }

  const { data, error } = await supabaseClient
    .from("orders")
    .select("*")
    .eq("session_id", currentSessionId)
    .order("created_at", { ascending: false });

  if (error) {
    container.innerHTML = `<p class="empty-checkout">Error: ${escapeHtml(error.message)}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = `<p class="empty-checkout">No orders placed in this session yet.</p>`;
    return;
  }

  container.innerHTML = data.map(order => {
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsHtml = items.map(item => `
      <div class="checkout-item" style="padding: 10px 0;">
        <div class="checkout-item-info">
          <strong style="color:#eee;">${escapeHtml(item.name)}</strong>
          <p style="color:#888;">₹${item.price} × ${item.qty}</p>
        </div>
        <strong style="color:var(--gold);">₹${item.price * item.qty}</strong>
      </div>
    `).join("");

    return `
      <div class="checkout-section">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid rgba(212,175,55,0.2); padding-bottom:8px;">
          <div>
            <strong style="color:var(--gold); font-size:1rem;">#${escapeHtml(order.order_number)}</strong>
            <div style="font-size:0.75rem; color:#888;">${new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          </div>
          <span class="order-status status-${escapeHtml(order.order_status)}">${escapeHtml(order.order_status)}</span>
        </div>
        ${itemsHtml}
        <div class="checkout-total" style="margin-top:10px; padding-top:10px;">
          <span>Subtotal</span>
          <strong>₹${Number(order.total).toFixed(2)}</strong>
        </div>
      </div>
    `;
  }).join("");
}

async function requestSessionBill() {
  const msg = document.getElementById("historyMessage");
  if (!currentSessionId) {
    msg.className = "checkout-message error";
    msg.textContent = "No active session found.";
    msg.style.display = "block";
    return;
  }

  const { error } = await supabaseClient
    .from("table_sessions")
    .update({ status: "bill_requested" })
    .eq("id", currentSessionId);

  if (error) {
    msg.className = "checkout-message error";
    msg.textContent = "Error: " + error.message;
  } else {
    msg.className = "checkout-message success";
    msg.textContent = "Final bill requested. Staff will attend to your table shortly.";
  }
  msg.style.display = "block";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
