// ==========================================
// RAJATHADRI PALACE
// ADMIN DASHBOARD
// ==========================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ==========================================
// VARIABLES
// ==========================================

let allOrders = [];

let currentFilter = "all";


// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {

    const container =
        document.getElementById(
            "ordersContainer"
        );

    container.innerHTML =
        '<div class="loading">Loading orders...</div>';


    const {
        data,
        error
    } = await supabaseClient

        .from("orders")

        .select("*")

        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Error loading orders:",
            error
        );

        container.innerHTML = `
            <div class="empty-orders">
                Unable to load orders.<br>
                ${escapeHtml(error.message)}
            </div>
        `;

        return;
    }


    allOrders = data || [];


    updateStatistics();

    displayOrders();

}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    document.getElementById(
        "totalOrders"
    ).textContent =
        allOrders.length;


    document.getElementById(
        "newOrders"
    ).textContent =
        allOrders.filter(
            order =>
                order.order_status === "new"
        ).length;


    document.getElementById(
        "preparingOrders"
    ).textContent =
        allOrders.filter(
            order =>
                order.order_status === "preparing"
        ).length;


    document.getElementById(
        "readyOrders"
    ).textContent =
        allOrders.filter(
            order =>
                order.order_status === "ready"
        ).length;

}


// ==========================================
// FILTER ORDERS
// ==========================================

function filterOrders(status) {

    currentFilter = status;


    document
        .querySelectorAll(".filter-btn")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    const activeButton =
        document.querySelector(
            `[data-status="${status}"]`
        );


    if (activeButton) {

        activeButton.classList.add(
            "active"
        );

    }


    displayOrders();

}


// ==========================================
// DISPLAY ORDERS
// ==========================================

function displayOrders() {

    const container =
        document.getElementById(
            "ordersContainer"
        );


    let orders =
        allOrders;


    if (currentFilter !== "all") {

        orders =
            allOrders.filter(
                order =>
                    order.order_status ===
                    currentFilter
            );

    }


    document.getElementById(
        "orderCount"
    ).textContent =
        orders.length +
        (
            orders.length === 1
                ? " order"
                : " orders"
        );


    if (orders.length === 0) {

        container.innerHTML = `
            <div class="empty-orders">
                No orders found.
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    orders.forEach(
        order => {

            container.appendChild(
                createOrderCard(order)
            );

        }
    );

}


// ==========================================
// CREATE ORDER CARD
// ==========================================

function createOrderCard(order) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "order-card";


    const items =
        Array.isArray(order.items)
            ? order.items
            : [];


    let itemsHTML = "";


    items.forEach(item => {

        itemsHTML += `

            <div class="order-item">

                <span class="order-item-name">

                    ${escapeHtml(
                        item.name
                    )}

                </span>

                <span class="order-item-qty">

                    × ${Number(
                        item.qty
                    )}

                </span>

            </div>

        `;

    });


    const status =
        order.order_status ||
        "new";


    card.innerHTML = `

        <div class="order-top">

            <div>

                <div class="order-number">

                    ${escapeHtml(
                        order.order_number
                    )}

                </div>

                <div class="table-number">

                    TABLE ${escapeHtml(
                        order.table_no
                    )}

                </div>

            </div>


            <span
                class="
                    order-status
                    status-${escapeHtml(status)}
                "
            >

                ${escapeHtml(status)}

            </span>

        </div>


        <div class="order-details">


            <div class="detail-box">

                <span>
                    CUSTOMER
                </span>

                <strong>
                    ${escapeHtml(
                        order.customer_name
                    )}
                </strong>

            </div>


            <div class="detail-box">

                <span>
                    PHONE
                </span>

                <strong>
                    ${escapeHtml(
                        order.customer_phone
                    )}
                </strong>

            </div>


            <div class="detail-box">

                <span>
                    PAYMENT
                </span>

                <strong>
                    ${escapeHtml(
                        order.payment_status ||
                        "pending"
                    )}
                </strong>

            </div>


        </div>


        <div class="order-items">

            ${itemsHTML}

        </div>


        <div class="order-total">

            <span>
                TOTAL
            </span>

            <strong>
                ₹${Number(
                    order.total || 0
                ).toFixed(2)}
            </strong>

        </div>

    `;


    return card;

}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHtml(value) {

    return String(value ?? "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// START ADMIN DASHBOARD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadOrders();

    }
);
