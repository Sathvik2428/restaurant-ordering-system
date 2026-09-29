// ==========================================
// RAJATHADRI PALACE - SESSION-WIDE ORDER STATUS
// ==========================================

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TABLE_NUMBER = localStorage.getItem("rajathadri_table") || "1";
let currentSessionId = localStorage.getItem("rajathadri_session_id");

// Status display names
const statusNames = {
    new: "Order Received",
    preparing: "Preparing",
    ready: "Ready",
    served: "Served",
    cancelled: "Cancelled"
};

const statusOrder = ["new", "preparing", "ready", "served"];

document.addEventListener("DOMContentLoaded", function () {
    loadTableSessionOrders();

    // Auto refresh every 7 seconds to catch status updates from kitchen/admin
    setInterval(loadTableSessionOrders, 7000);
});

// Load all orders for the current dining session
async function loadTableSessionOrders() {
    const information = document.getElementById("orderInformation");
    const statusContainer = document.getElementById("orderStatus");

    if (!currentSessionId) {
        // Fallback: check if we can get session from token
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token") || localStorage.getItem("rajathadri_order_token");

        if (token) {
            const { data: tokenOrder } = await supabaseClient
                .from("orders")
                .select("session_id")
                .eq("order_token", token)
                .maybeSingle();

            if (tokenOrder && tokenOrder.session_id) {
                currentSessionId = tokenOrder.session_id;
                localStorage.setItem("rajathadri_session_id", currentSessionId);
            }
        }
    }

    if (!currentSessionId) {
        information.innerHTML = "<p>No active table session found.</p>";
        statusContainer.innerHTML = "<p>Please start by adding items from the menu.</p>";
        return;
    }

    try {
        // 1. Fetch table session details
        const { data: session } = await supabaseClient
            .from("table_sessions")
            .select("*")
            .eq("id", currentSessionId)
            .maybeSingle();

        // 2. Fetch all orders for this session
        const { data: orders, error } = await supabaseClient
            .from("orders")
            .select("*")
            .eq("session_id", currentSessionId)
            .neq("order_status", "cancelled")
            .order("created_at", { ascending: true });

        if (error) throw error;

        if (!orders || orders.length === 0) {
            information.innerHTML = "<p>No orders recorded in this session.</p>";
            statusContainer.innerHTML = "";
            return;
        }

        // Render combined items and breakdown
        let sessionGrandTotal = 0;
        let allItemsHTML = "";

        orders.forEach((ord, idx) => {
            sessionGrandTotal += Number(ord.total || 0);
            const items = Array.isArray(ord.items) ? ord.items : [];

            allItemsHTML += `
                <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed rgba(212, 175, 55, 0.3);">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
                        <strong style="color: #d4af37; font-size: 0.95rem;">ROUND #${idx + 1} (${escapeHtml(ord.order_number)})</strong>
                        <span class="order-status status-${escapeHtml(ord.order_status)}" style="padding: 2px 8px; font-size: 10px;">
                            ${escapeHtml(ord.order_status)}
                        </span>
                    </div>
            `;

            items.forEach(item => {
                allItemsHTML += `
                    <div class="order-item" style="padding: 3px 0;">
                        <span class="order-item-name">${escapeHtml(item.name)} × ${item.qty}</span>
                        <span class="order-item-qty">₹${Number(item.price) * Number(item.qty)}</span>
                    </div>
                `;
            });

            allItemsHTML += `</div>`;
        });

        // Add overall running grand total
        allItemsHTML += `
            <div class="order-total" style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #d4af37;">
                <span style="font-weight: 600;">COMBINED TOTAL (TABLE ${escapeHtml(TABLE_NUMBER)})</span>
                <strong>₹${sessionGrandTotal.toFixed(2)}</strong>
            </div>
        `;

        information.innerHTML = allItemsHTML;

        // Render overall latest status
        const latestOrder = orders[orders.length - 1];
        renderOverallStatus(latestOrder.order_status, orders.length);

        // If bill was requested
        if (session && session.status === "bill_requested") {
            const billBtn = document.getElementById("billBtn");
            if (billBtn) {
                billBtn.textContent = "⏳ BILL REQUESTED - WAITING FOR STAFF";
                billBtn.disabled = true;
                billBtn.style.opacity = "0.7";
            }
        }

    } catch (err) {
        console.error(err);
        information.innerHTML = `<p>Error loading table orders: ${escapeHtml(err.message)}</p>`;
    }
}

function renderOverallStatus(currentStatus, roundsCount) {
    const status = document.getElementById("orderStatus");
    let html = `<p style="font-size: 0.85rem; color: #aaa; margin-bottom: 10px;">Total Rounds Ordered: <strong>${roundsCount}</strong> (Latest Round Status below)</p>`;

    html += `<div class="order-progress">`;
    statusOrder.forEach(item => {
        const active = item === currentStatus;
        const completed = statusOrder.indexOf(item) <= statusOrder.indexOf(currentStatus);

        let className = "order-status-step";
        if (active) className += " active";
        if (completed) className += " completed";

        html += `
            <div class="${className}">
                <div class="status-circle">${completed ? "✓" : ""}</div>
                <div class="status-name">${statusNames[item]}</div>
            </div>
        `;
    });
    html += `</div>`;

    status.innerHTML = html;
}

// Order more food
function orderMore() {
    window.location.href = "menu.html?table=" + encodeURIComponent(TABLE_NUMBER);
}

// Request combined final bill
async function requestBill() {
    if (!currentSessionId) {
        showMessage("No active session found.", "error");
        return;
    }

    const billBtn = document.getElementById("billBtn");
    billBtn.disabled = true;
    billBtn.textContent = "REQUESTING FINAL BILL...";

    try {
        const { error } = await supabaseClient
            .from("table_sessions")
            .update({ status: "bill_requested" })
            .eq("id", currentSessionId);

        if (error) throw error;

        showMessage("Combined final bill requested! Hotel counter staff is generating your bill.", "success");
        billBtn.textContent = "⏳ BILL REQUESTED - WAITING FOR STAFF";
        billBtn.style.opacity = "0.7";

    } catch (err) {
        showMessage("Failed to request bill: " + err.message, "error");
        billBtn.disabled = false;
        billBtn.textContent = "🧾 REQUEST FINAL BILL";
    }
}

function showMessage(text, type) {
    const msg = document.getElementById("statusMessage");
    if (!msg) return;
    msg.textContent = text;
    msg.className = "checkout-message " + type;
    msg.style.display = "block";
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
