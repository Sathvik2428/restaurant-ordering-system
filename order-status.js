// ==========================================
// RAJATHADRI PALACE - SESSION-WIDE ORDER STATUS & BILLING
// ==========================================

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TABLE_NUMBER = localStorage.getItem("rajathadri_table") || "1";
let currentSessionId = localStorage.getItem("rajathadri_session_id");

let cachedOrders = [];
let sessionGrandTotal = 0;

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
    setInterval(loadTableSessionOrders, 6000);
});

// Load all orders for the current dining session
async function loadTableSessionOrders() {
    const information = document.getElementById("orderInformation");
    const statusContainer = document.getElementById("orderStatus");

    if (!currentSessionId) {
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
        statusContainer.innerHTML = "<p>Please add items from the menu first.</p>";
        return;
    }

    try {
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

        cachedOrders = orders;
        sessionGrandTotal = 0;
        let allItemsHTML = "";

        orders.forEach((ord, idx) => {
            sessionGrandTotal += Number(ord.total || 0);
            const items = Array.isArray(ord.items) ? ord.items : [];

            allItemsHTML += `
                <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px dashed rgba(212, 175, 55, 0.3);">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
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
                        <span class="order-item-qty">₹${(Number(item.price) * Number(item.qty)).toFixed(2)}</span>
                    </div>
                `;
            });

            allItemsHTML += `</div>`;
        });

        allItemsHTML += `
            <div class="order-total" style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #d4af37;">
                <span style="font-weight: 600;">COMBINED TOTAL (TABLE ${escapeHtml(TABLE_NUMBER)})</span>
                <strong>₹${sessionGrandTotal.toFixed(2)}</strong>
            </div>
        `;

        information.innerHTML = allItemsHTML;

        const latestOrder = orders[orders.length - 1];
        renderOverallStatus(latestOrder.order_status, orders.length);

    } catch (err) {
        console.error(err);
        information.innerHTML = `<p>Error loading table orders: ${escapeHtml(err.message)}</p>`;
    }
}

function renderOverallStatus(currentStatus, roundsCount) {
    const status = document.getElementById("orderStatus");
    let html = `<p style="font-size: 0.85rem; color: #aaa; margin-bottom: 10px;">Total Rounds: <strong>${roundsCount}</strong> (Latest Status)</p>`;

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

// ------------------------------------------
// FINAL BILL MODAL LOGIC
// ------------------------------------------

function openFinalBillModal() {
    if (!cachedOrders || cachedOrders.length === 0) {
        showMessage("No orders to bill yet.", "error");
        return;
    }

    const modal = document.getElementById("finalBillModal");
    const container = document.getElementById("billBreakdownContent");

    let breakdownHtml = `
        <div style="font-size: 0.9rem; margin-bottom: 12px; color: #bbb;">
            Table Number: <strong style="color: #fff;">${escapeHtml(TABLE_NUMBER)}</strong><br>
            Total Rounds Placed: <strong style="color: #fff;">${cachedOrders.length}</strong>
        </div>
        <div style="max-height: 220px; overflow-y: auto; margin-bottom: 15px; border-top: 1px solid #333; border-bottom: 1px solid #333; padding: 10px 0;">
    `;

    cachedOrders.forEach((ord, i) => {
        breakdownHtml += `<p style="color: #d4af37; font-size: 0.85rem; margin-top: 6px;"><b>Round ${i + 1} (${ord.order_number})</b></p>`;
        (ord.items || []).forEach(item => {
            breakdownHtml += `
                <div style="display:flex; justify-content:space-between; font-size: 0.85rem; color:#eee; padding: 2px 0;">
                    <span>${escapeHtml(item.name)} × ${item.qty}</span>
                    <span>₹${(Number(item.price) * Number(item.qty)).toFixed(2)}</span>
                </div>
            `;
        });
    });

    breakdownHtml += `
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size: 1.2rem; font-weight:700; color: #d4af37;">
            <span>Grand Total:</span>
            <span>₹${sessionGrandTotal.toFixed(2)}</span>
        </div>
    `;

    container.innerHTML = breakdownHtml;

    // Create UPI deep-link URL (Works with PhonePe, GPay, Paytm on smartphones)
    const upiLink = `upi://pay?pa=${encodeURIComponent(HOTEL_UPI_ID)}&pn=${encodeURIComponent(HOTEL_UPI_NAME)}&am=${sessionGrandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent("Table " + TABLE_NUMBER + " Bill")}`;

    const upiBtn = document.getElementById("payUpiBtn");
    upiBtn.href = upiLink;

    modal.classList.add("show");
}

function closeFinalBillModal() {
    document.getElementById("finalBillModal").classList.remove("show");
}

// Option A: Cash Payment
async function chooseCashPayment() {
    closeFinalBillModal();

    try {
        await supabaseClient
            .from("table_sessions")
            .update({
                status: "bill_requested",
                payment_status: "pending_cash"
            })
            .eq("id", currentSessionId);

        showMessage("Cash payment selected. Please pay ₹" + sessionGrandTotal.toFixed(2) + " at the counter or to your waiter.", "success");
        
        const billBtn = document.getElementById("billBtn");
        billBtn.textContent = "⏳ CASH PAYMENT NOTIFIED TO COUNTER";
    } catch (err) {
        showMessage("Error notifying counter: " + err.message, "error");
    }
}

// Order more food
function orderMore() {
    window.location.href = "menu.html?table=" + encodeURIComponent(TABLE_NUMBER);
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
