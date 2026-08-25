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
// CURRENT SESSION
// ==========================================

let currentSessionId =
    localStorage.getItem(
        "rajathadri_session_id"
    );


// ==========================================
// DISPLAY TABLE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const tableElement =
            document.getElementById("tableNumber");

        if (tableElement) {

            tableElement.textContent =
                "TABLE " + TABLE_NUMBER;

        }

        renderCheckout();

    }
);


// ==========================================
// RENDER CHECKOUT
// ==========================================

function renderCheckout() {

    const container =
        document.getElementById("checkoutItems");

    const totalElement =
        document.getElementById("checkoutTotal");

    if (!container || !totalElement) {
        return;
    }


    if (cart.length === 0) {

        container.innerHTML =
            "<p>Your cart is empty.</p>";

        totalElement.textContent =
            "₹0";

        return;
    }


    let total = 0;


    container.innerHTML =
        cart.map(function (item) {

            const itemTotal =
                item.price * item.qty;

            total += itemTotal;

            return `
                <div class="checkout-item">

                    <div>

                        <strong>
                            ${escapeHtml(item.name)}
                        </strong>

                        <p>
                            ₹${item.price} × ${item.qty}
                        </p>

                    </div>

                    <strong>
                        ₹${itemTotal}
                    </strong>

                </div>
            `;

        }).join("");


    totalElement.textContent =
        "₹" + total;

}


// ==========================================
// CALCULATE TOTAL
// ==========================================

function getCartTotal() {

    return cart.reduce(
        function (total, item) {

            return total +
                (Number(item.price) *
                 Number(item.qty));

        },
        0
    );

}


// ==========================================
// GET OR CREATE TABLE SESSION
// ==========================================

async function getOrCreateSession() {

    // --------------------------------------
    // If we already have a session
    // --------------------------------------

    if (currentSessionId) {

        const {
            data,
            error
        } = await supabaseClient

            .from("table_sessions")

            .select("id,status")

            .eq("id", currentSessionId)

            .maybeSingle();


        if (!error && data) {

            if (data.status === "active") {

                return data.id;

            }

        }


        // Old/closed session

        currentSessionId = null;

        localStorage.removeItem(
            "rajathadri_session_id"
        );

    }


    // --------------------------------------
    // Look for existing active session
    // --------------------------------------

    const {
        data: activeSession,
        error: activeError
    } = await supabaseClient

        .from("table_sessions")

        .select("id,status")

        .eq("table_no", TABLE_NUMBER)

        .eq("status", "active")

        .order("started_at", {
            ascending: false
        })

        .limit(1)
        .maybeSingle();


    if (!activeError && activeSession) {

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

            table_no: TABLE_NUMBER,

            status: "active",

            subtotal: 0,

            tax: 0,

            grand_total: 0,

            payment_status: "pending"

        })

        .select("id")
        .single();


    if (createError) {

        console.error(
            "Session creation error:",
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
            100 + Math.random() * 900
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


    const message =
        document.getElementById(
            "checkoutMessage"
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
    // Validation
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


    if (!/^[0-9]{10}$/.test(customerPhone)) {

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
        // Get/Create table session
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

            // Payment happens at the end.
            payment_method:
                null,

            payment_status:
                "pending",

            order_status:
                "new",

            notes:
                notes || null

        };


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
                "Order error:",
                error
            );

            throw new Error(
                error.message
            );

        }


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
        // Success
        // ----------------------------------

        showMessage(

            "Order placed successfully! " +
            "Order number: " +
            data.order_number,

            "success"

        );


        button.style.display =
            "none";


        document.getElementById(
            "orderMoreBtn"
        ).style.display =
            "block";


        document.getElementById(
            "billBtn"
        ).style.display =
            "block";


        // ----------------------------------
        // Update display
        // ----------------------------------

        document.getElementById(
            "checkoutItems"
        ).innerHTML =

            "<p>Your order has been sent to the hotel.</p>";


        document.getElementById(
            "checkoutTotal"
        ).textContent =
            "₹0";


    }

    catch (error) {

        console.error(error);

        showMessage(

            "Unable to place your order: " +
            error.message,

            "error"

        );

        button.disabled = false;

        button.textContent =
            "PLACE ORDER";

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
// MESSAGE
// ==========================================

function showMessage(
    text,
    type
) {

    const message =
        document.getElementById(
            "checkoutMessage"
        );


    message.textContent =
        text;


    message.className =
        "checkout-message " +
        type;

}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHtml(value) {

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
