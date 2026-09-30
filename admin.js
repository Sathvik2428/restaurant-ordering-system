// ==========================================
// RAJATHADRI PALACE
// ADMIN DASHBOARD & REVENUE ANALYTICS
// ==========================================

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// ==========================================
// STATE VARIABLES
// ==========================================
let allOrders = [];
let currentFilter = "all";
let currentReportPeriod = "today";

// ==========================================
// LOAD ORDERS
// ==========================================
async function loadOrders() {
    // Only query database if staff is authenticated
    if (sessionStorage.getItem("rajathadri_admin_auth") !== "true") {
        return;
    }

    const container = document.getElementById("ordersContainer");
    if (container && (!allOrders || allOrders.length === 0)) {
        container.innerHTML = '<div class="loading">Loading orders...</div>';
    }

    const { data, error } = await supabaseClient
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error loading orders:", error);
        if (container) {
            container.innerHTML = `
                <div class="empty-orders">
                    Unable to load orders.<br>
                    ${escapeHtml(error.message)}
                </div>
            `;
        }
        return;
    }

    allOrders = data || [];

    updateStatistics();
    displayOrders();
    calculateRevenue(currentReportPeriod);
}

// ==========================================
// UPDATE REAL-TIME COUNTERS
// ==========================================
function updateStatistics() {
    const totalEl = document.getElementById("totalOrders");
    const newEl = document.getElementById("newOrders");
    const prepEl = document.getElementById("preparingOrders");
    const readyEl = document.getElementById("readyOrders");

    if (totalEl) totalEl.textContent = allOrders.length;
    if (newEl) newEl.textContent = allOrders.filter(order => order.order_status === "new").length;
    if (prepEl) prepEl.textContent = allOrders.filter(order => order.order_status === "preparing").length;
    if (readyEl) readyEl.textContent = allOrders.filter(order => order.order_status === "ready").length;
}

// ==========================================
// FILTER ORDERS
// ==========================================
function filterOrders(status) {
    currentFilter = status;

    document.querySelectorAll(".filter-section .filter-btn").forEach(button => {
        button.classList.remove("active");
    });

    const activeButton = document.querySelector(`.filter-section [data-status="${status}"]`);
    if (activeButton) {
        activeButton.classList.add("active");
    }

    displayOrders();
}

// ==========================================
// DISPLAY ORDERS CARDS
// ==========================================
function displayOrders() {
    const container = document.getElementById("ordersContainer");
    if (!container) return;

    let orders = allOrders;

    if (currentFilter !== "all") {
        orders = allOrders.filter(order => order.order_status === currentFilter);
    }

    const orderCountEl = document.getElementById("orderCount");
    if (orderCountEl) {
        orderCountEl.textContent = orders.length + (orders.length === 1 ? " order" : " orders");
    }

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-orders">
                No orders found.
            </div>
        `;
        return;
    }

    container.innerHTML = "";

    orders.forEach(order => {
        container.appendChild(createOrderCard(order));
    });
}

// ==========================================
// CREATE ORDER CARD
// ==========================================
function createOrderCard(order) {
    const card = document.createElement("div");
    card.className = "order-card";

    const items = Array.isArray(order.items) ? order.items : [];
    let itemsHTML = "";

    items.forEach(item => {
        itemsHTML += `
            <div class="order-item">
                <span class="order-item-name">
                    ${escapeHtml(item.name)}
                </span>
                <span class="order-item-qty">
                    × ${Number(item.qty)}
                </span>
            </div>
        `;
    });

    const status = order.order_status || "new";

    card.innerHTML = `
        <div class="order-top">
            <div>
                <div class="order-number">
                    ${escapeHtml(order.order_number)}
                </div>
                <div class="table-number">
                    TABLE ${escapeHtml(order.table_no)}
                </div>
            </div>

            <span class="order-status status-${escapeHtml(status)}">
                ${escapeHtml(status)}
            </span>
        </div>

        <div class="order-details">
            <div class="detail-box">
                <span>CUSTOMER</span>
                <strong>${escapeHtml(order.customer_name || "Guest")}</strong>
            </div>

            <div class="detail-box">
                <span>PHONE</span>
                <strong>${escapeHtml(order.customer_phone || "-")}</strong>
            </div>

            <div class="detail-box">
                <span>PAYMENT</span>
                <strong>${escapeHtml(order.payment_status || "pending")}</strong>
            </div>
        </div>

        <div class="order-items">
            ${itemsHTML}
        </div>

        <div class="order-total">
            <span>TOTAL</span>
            <strong>₹${Number(order.total || 0).toFixed(2)}</strong>
        </div>

        <button 
            type="button"
            onclick="viewTableSessionBill('${order.session_id}', '${escapeHtml(order.table_no)}')"
            style="width: 100%; margin-top: 10px; padding: 10px; background: transparent; border: 1px solid #d4af37; color: #d4af37; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: 'Montserrat', sans-serif; letter-spacing: 1px;"
        >
            🧾 VIEW FULL TABLE BILL
        </button>
    `;

    return card;
}

// ==========================================
// VIEW COMBINED TABLE BILL (FOR CASHIER/ADMIN)
// ==========================================
async function viewTableSessionBill(sessionId, tableNo) {
    if (!sessionId || sessionId === "null" || sessionId === "undefined") {
        alert("No active session linked to this order.");
        return;
    }

    const { data: sessionOrders, error } = await supabaseClient
        .from("orders")
        .select("*")
        .eq("session_id", sessionId)
        .neq("order_status", "cancelled")
        .order("created_at", { ascending: true });

    if (error) {
        alert("Failed to load session orders: " + error.message);
        return;
    }

    if (!sessionOrders || sessionOrders.length === 0) {
        alert("No active orders found for Table " + tableNo);
        return;
    }

    let billItemsText = "";
    let grandTotal = 0;

    sessionOrders.forEach((ord, idx) => {
        billItemsText += `\n--- ROUND ${idx + 1} (${ord.order_number}) ---\n`;
        (ord.items || []).forEach(it => {
            const lineTotal = Number(it.price) * Number(it.qty);
            billItemsText += `${it.name} x ${it.qty} = ₹${lineTotal.toFixed(2)}\n`;
        });
        grandTotal += Number(ord.total);
    });

    const confirmPayment = confirm(
        `RAJATHADRI PALACE - TABLE ${tableNo} FINAL BILL\n` +
        `----------------------------------------\n` +
        billItemsText +
        `----------------------------------------\n` +
        `GRAND TOTAL: ₹${grandTotal.toFixed(2)}\n\n` +
        `Has the customer completed payment?\nClick OK to mark as PAID and CLOSE this table session.`
    );

    if (confirmPayment) {
        try {
            await supabaseClient
                .from("table_sessions")
                .update({
                    status: "closed",
                    payment_status: "paid",
                    closed_at: new Date().toISOString()
                })
                .eq("id", sessionId);

            await supabaseClient
                .from("orders")
                .update({ payment_status: "paid" })
                .eq("session_id", sessionId);

            alert(`Table ${tableNo} session closed and marked as PAID.`);
            loadOrders();
        } catch (err) {
            console.error("Error closing session:", err);
            alert("Failed to close session: " + err.message);
        }
    }
}

// ==========================================
// SALES & REVENUE REPORTING ENGINE
// ==========================================
async function calculateRevenue(period = "today") {
    currentReportPeriod = period;

    // Toggle button active styling
    ["today", "week", "month", "year"].forEach(p => {
        const btn = document.getElementById("btn" + p.charAt(0).toUpperCase() + p.slice(1));
        if (btn) btn.classList.remove("active");
    });
    const activeBtn = document.getElementById("btn" + period.charAt(0).toUpperCase() + period.slice(1));
    if (activeBtn) activeBtn.classList.add("active");

    // Establish date bounds
    const now = new Date();
    let startDate = new Date();

    if (period === "today") {
        startDate.setHours(0, 0, 0, 0);
    } else if (period === "week") {
        const day = now.getDay() || 7; // Monday = 1, Sunday = 7
        startDate.setDate(now.getDate() - day + 1);
        startDate.setHours(0, 0, 0, 0);
    } else if (period === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "year") {
        startDate = new Date(now.getFullYear(), 0, 1);
    }

    try {
        const { data: sales, error } = await supabaseClient
            .from("orders")
            .select("total, payment_status, created_at, order_status")
            .gte("created_at", startDate.toISOString())
            .neq("order_status", "cancelled");

        if (error) throw error;

        let totalRevenue = 0;
        let onlineRevenue = 0;
        let cashRevenue = 0;
        let count = sales ? sales.length : 0;

        (sales || []).forEach(order => {
            const amount = Number(order.total || 0);
            totalRevenue += amount;

            const payStatus = String(order.payment_status || "").toLowerCase();
            if (payStatus.includes("cash") || payStatus.includes("pending_cash")) {
                cashRevenue += amount;
            } else {
                onlineRevenue += amount;
            }
        });

        const repTotalEl = document.getElementById("repTotalRevenue");
        const repOnlineEl = document.getElementById("repOnlineRevenue");
        const repCashEl = document.getElementById("repCashRevenue");
        const repOrdersEl = document.getElementById("repTotalOrdersCount");

        if (repTotalEl) repTotalEl.textContent = "₹" + totalRevenue.toFixed(2);
        if (repOnlineEl) repOnlineEl.textContent = "₹" + onlineRevenue.toFixed(2);
        if (repCashEl) repCashEl.textContent = "₹" + cashRevenue.toFixed(2);
        if (repOrdersEl) repOrdersEl.textContent = count;

    } catch (err) {
        console.error("Error computing sales report:", err);
    }
}

// ==========================================
// HTML ESCAPE UTILITY
// ==========================================
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==========================================
// START REALTIME LISTENER
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    // Realtime auto-update on new or updated tickets
    supabaseClient
        .channel("admin-orders-watch")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "orders" },
            () => {
                loadOrders();
            }
        )
        .subscribe();
});
