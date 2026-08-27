// ==========================================
// RAJATHADRI PALACE
// CHECKOUT SYSTEM
// MULTIPLE ORDERS / ONE FINAL BILL
// ==========================================


// ==========================================
// SUPABASE CLIENT
// ==========================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ==========================================
// GET TABLE NUMBER
// ==========================================

const urlParams =
    new URLSearchParams(window.location.search);

const TABLE_NUMBER =
    urlParams.get("table") ||
    localStorage.getItem("rajathadri_table") ||
    "1";


// Save table number

localStorage.setItem(
    "rajathadri_table",
    TABLE_NUMBER
);


// ==========================================
// CART
// ==========================================

let cart =
    JSON.parse(
        localStorage.getItem("rajathadri_cart") || "[]"
    );


// ==========================================
// CURRENT TABLE SESSION
// ==========================================

let currentSessionId =
    localStorage.getItem(
        "rajathadri_session_id"
    );


// ==========================================
// PAGE START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Show table number

        const tableElement =
            document.getElementById("tableNumber");

        if (tableElement) {

            tableElement.textContent =
                "TABLE " + TABLE_NUMBER;

        }


        // Display cart

        renderCheckout();

    }
);


// ==========================================
// RENDER COMPLETE CHECKOUT
// ==========================================

function renderCheckout() {

    renderCheckoutItems();

    updateCheckoutTotal();

}


// ==========================================
// RENDER CHECKOUT ITEMS
// ==========================================

function renderCheckoutItems() {

    const container =
        document.getElementById("checkoutItems");

    if (!container) return;


    // Empty cart

    if (cart.length === 0) {

        container.innerHTML = `
            <p class="empty-checkout">
                Your cart is empty.
            </p>
        `;

        updateCheckoutTotal();

        return;

    }


    container.innerHTML = "";


    cart.forEach(
        function (item, index) {

            const price =
                Number(item.price);

            const quantity =
                Number(item.qty);

            const itemTotal =
                price * quantity;


            const itemDiv =
                document.createElement("div");

            itemDiv.className =
                "checkout-item";


            itemDiv.innerHTML = `

                <div class="checkout-item-info">

                    <h3>
                        ${escapeHtml(item.name)}
                    </h3>

                    <p>
                        ₹${price} × ${quantity}
                    </p>

                </div>


                <div class="quantity-control">

                    <button
                        type="button"
                        class="qty-btn"
                        onclick="changeCheckoutQty(${index}, -1)"
                    >
                        −
                    </button>


                    <span class="qty-number">
                        ${quantity}
                    </span>


                    <button
                        type="button"
                        class="qty-btn"
                        onclick="changeCheckoutQty(${index}, 1)"
                    >
                        +
                    </button>

                </div>


                <div class="checkout-item-price">

                    ₹${itemTotal}

                </div>

            `;


            container.appendChild(
                itemDiv
            );

        }
    );


    updateCheckoutTotal();

}


// ==========================================
// CHANGE QUANTITY
// ==========================================

function changeCheckoutQty(
    index,
    change
) {

    if (!cart[index]) return;


    cart[index].qty =
        Number(cart[index].qty) +
        Number(change);


    // Remove item when quantity reaches zero

    if (cart[index].qty <= 0) {

        cart.splice(
            index,
            1
        );

    }


    // IMPORTANT:
    // Use the same localStorage key
    // used by menu/script.js

    localStorage.setItem(
        "rajathadri_cart",
        JSON.stringify(cart)
    );


    // Refresh checkout

    renderCheckout();

}


// ==========================================
// CALCULATE CART TOTAL
// ==========================================

function getCartTotal() {

    return cart.reduce(
        function (total, item) {

            return total +
                (
                    Number(item.price) *
                    Number(item.qty)
                );

        },
        0
    );

}


// ==========================================
// UPDATE CHECKOUT TOTAL
// ==========================================

function updateCheckoutTotal() {

    const total =
        getCartTotal();


    const totalElement =
        document.getElementById(
            "checkoutTotal"
        );


    if (totalElement) {

        totalElement.textContent =
            "₹" + total;

    }

}


// ==========================================
// GET OR CREATE TABLE SESSION
// ==========================================

async function getOrCreateSession() {


    // --------------------------------------
    // Check saved session
    // --------------------------------------

    if (currentSessionId) {

        const {
            data,
            error
        } = await supabaseClient

            .from("table_sessions")

            .select("id,status")

            .eq(
                "id",
                currentSessionId
            )

            .maybeSingle();


        if (
            !error &&
            data &&
            data.status === "active"
        ) {

            return data.id;

        }


        // Old/closed session

        currentSessionId = null;

        localStorage.removeItem(
            "rajathadri_session_id"
        );

    }


    // --------------------------------------
    // Find existing active session
    // --------------------------------------

    const {
        data: activeSession,
        error: activeError
    } = await supabaseClient

        .from("table_sessions")

        .select("id,status")

        .eq(
            "table_no",
            TABLE_NUMBER
        )

        .eq(
            "status",
            "active"
        )

        .order(
            "started_at",
            {
                ascending: false
            }
        )

        .limit(1)

        .maybeSingle();


    if (
        !activeError &&
        activeSession
    ) {

        currentSessionId =
            activeSession.id;


        localStorage.setItem(
            "rajathadri_session_id",
            currentSessionId
        );


        return currentSessionId;

    }


    // --------------------------------------
    // Create new session
    // --------------------------------------

    const {
        data: newSession,
        error: createError
    } = await supabaseClient

        .from("table_sessions")

        .insert({

            table_no:
                TABLE_NUMBER,

            status:
                "active",

            subtotal:
                0,

            tax:
                0,

            grand_total:
                0,

            payment_status:
                "pending"

        })

        .select("id")

        .single();


    if (createError) {

        console.error(
            "SESSION CREATION ERROR:",
            createError
        );

        throw new Error(
            createError.message
        );

    }


    currentSessionId =
        newSession.id;


    localStorage.setItem(
        "rajathadri_session_id",
        currentSessionId
    );


    return currentSessionId;

}


// ==========================================
// GENERATE ORDER NUMBER
// ==========================================

function generateOrderNumber() {

    const timestamp =
        Date.now();

    const random =
        Math.floor(
            100 +
            Math.random() * 900
        );


    return (
        "RP-" +
        timestamp +
        "-" +
        random
    );

}


// ==========================================
// GENERATE ORDER TOKEN
// ==========================================

function generateOrderToken() {

    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );

}


// ==========================================
// PLACE ORDER
// ==========================================

async function placeOrder() {

    const button =
        document.getElementById(
            "placeOrderBtn"
        );


    const customerName =
        document.getElementById(
            "customerName"
        ).value.trim();


    const customerPhone =
        document.getElementById(
            "customerPhone"
        ).value.trim();


    const notes =
        document.getElementById(
            "orderNotes"
        ).value.trim();


    // --------------------------------------
    // VALIDATION
    // --------------------------------------

    if (cart.length === 0) {

        showMessage(
            "Your cart is empty.",
            "error"
        );

        return;

    }


    if (!customerName) {

        showMessage(
            "Please enter your name.",
            "error"
        );

        return;

    }


    if (
        !/^[0-9]{10}$/.test(
            customerPhone
        )
    ) {

        showMessage(
            "Please enter a valid 10-digit mobile number.",
            "error"
        );

        return;

    }


    // --------------------------------------
    // Disable button
    // --------------------------------------

    button.disabled = true;

    button.textContent =
        "PLACING ORDER...";


    try {

        // ----------------------------------
        // Get/Create session
        // ----------------------------------

        const sessionId =
            await getOrCreateSession();


        // ----------------------------------
        // Calculate total
        // ----------------------------------

        const total =
            getCartTotal();


        // ----------------------------------
        // Create order
        // ----------------------------------

        const orderData = {

            order_number:
                generateOrderNumber(),

            order_token:
                generateOrderToken(),

            table_no:
                TABLE_NUMBER,

            session_id:
                sessionId,

            customer_name:
                customerName,

            customer_phone:
                customerPhone,

            items:
                cart,

            total:
                total,

            // Payment happens at the end

            payment_method:
                null,

            payment_status:
                "pending",

            order_status:
                "new",

            notes:
                notes || null

        };


        console.log(
            "ORDER DATA:",
            orderData
        );


        // ----------------------------------
        // Insert order into Supabase
        // ----------------------------------

        const {
            data,
            error
        } = await supabaseClient

            .from("orders")

            .insert(orderData)

            .select(
                "order_number,order_token"
            )

            .single();


        if (error) {

            console.error(
                "ORDER INSERT ERROR:",
                error
            );

            throw new Error(
                error.message
            );

        }


        // ----------------------------------
        // Update table session totals
        // ----------------------------------

        await updateSessionTotal(
            sessionId
        );


        // ----------------------------------
        // Save last order
        // ----------------------------------

        localStorage.setItem(
            "rajathadri_last_order",
            JSON.stringify(data)
        );


        // ----------------------------------
        // Clear cart
        // ----------------------------------

        cart = [];


        localStorage.setItem(
            "rajathadri_cart",
            JSON.stringify([])
        );


// ----------------------------------
// SUCCESS
// ----------------------------------

showMessage(

    "Order placed successfully! " +
    "Order number: " +
    data.order_number,

    "success"

);


// ----------------------------------
// SAVE ORDER TOKEN
// ----------------------------------

localStorage.setItem(
    "rajathadri_order_token",
    data.order_token
);


// ----------------------------------
// OPEN ORDER STATUS PAGE
// ----------------------------------

setTimeout(function () {

    window.location.href =
        "order-status.html?token=" +
        encodeURIComponent(
            data.order_token
        );

}, 1000);

}
catch (error) {

        console.error(
            "FULL CHECKOUT ERROR:",
            error
        );


        showMessage(

            "Unable to place your order: " +
            error.message,

            "error"

        );


        button.disabled =
            false;


        button.textContent =
            "PLACE ORDER";

    }

}


// ==========================================
// UPDATE SESSION TOTAL
// ==========================================

async function updateSessionTotal(
    sessionId
) {

    try {

        const {
            data: orders,
            error
        } = await supabaseClient

            .from("orders")

            .select("total")

            .eq(
                "session_id",
                sessionId
            )

            .neq(
                "order_status",
                "cancelled"
            );


        if (error) {

            console.error(
                "SESSION TOTAL ERROR:",
                error
            );

            return;

        }


        let subtotal = 0;


        orders.forEach(
            function (order) {

                subtotal +=
                    Number(order.total);

            }
        );


        const tax = 0;

        const grandTotal =
            subtotal + tax;


        await supabaseClient

            .from("table_sessions")

            .update({

                subtotal:
                    subtotal,

                tax:
                    tax,

                grand_total:
                    grandTotal

            })

            .eq(
                "id",
                sessionId
            );

    }

    catch (error) {

        console.error(
            "UPDATE SESSION ERROR:",
            error
        );

    }

}


// ==========================================
// ORDER MORE FOOD
// ==========================================

function orderMore() {

    window.location.href =
        "menu.html?table=" +
        encodeURIComponent(
            TABLE_NUMBER
        );

}


// ==========================================
// REQUEST FINAL BILL
// ==========================================

async function requestBill() {

    if (!currentSessionId) {

        showMessage(
            "No active table session found.",
            "error"
        );

        return;

    }


    const {
        error
    } = await supabaseClient

        .from("table_sessions")

        .update({

            status:
                "bill_requested"

        })

        .eq(
            "id",
            currentSessionId
        );


    if (error) {

        console.error(
            "BILL REQUEST ERROR:",
            error
        );


        showMessage(

            "Unable to request bill: " +
            error.message,

            "error"

        );

        return;

    }


    showMessage(

        "Final bill requested. " +
        "Please wait for the hotel to generate your bill.",

        "success"

    );

}


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(
    text,
    type
) {

    const message =
        document.getElementById(
            "checkoutMessage"
        );


    if (!message) return;


    message.textContent =
        text;


    message.className =
        "checkout-message " +
        type;

}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHtml(
    value
) {

    return String(value)

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
