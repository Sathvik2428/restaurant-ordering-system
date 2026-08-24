// ==========================================
// RAJATHADRI PALACE
// CHECKOUT SYSTEM
// ==========================================


// ==========================================
// SUPABASE
// ==========================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ==========================================
// TABLE NUMBER
// ==========================================

const checkoutParams =
    new URLSearchParams(
        window.location.search
    );

const TABLE_NUMBER =
    checkoutParams.get("table") || "Unknown";


// ==========================================
// CART
// ==========================================

let cart = JSON.parse(
    localStorage.getItem(
        "rajathadri_cart"
    ) || "[]"
);


// ==========================================
// DOM
// ==========================================

const tableNumberElement =
    document.getElementById(
        "tableNumber"
    );

const orderItemsElement =
    document.getElementById(
        "orderItems"
    );

const orderTotalElement =
    document.getElementById(
        "orderTotal"
    );

const errorElement =
    document.getElementById(
        "errorMessage"
    );

const placeOrderButton =
    document.getElementById(
        "placeOrderButton"
    );


// ==========================================
// SHOW TABLE
// ==========================================

tableNumberElement.textContent =
    "TABLE " + TABLE_NUMBER;


// ==========================================
// CALCULATE TOTAL
// ==========================================

function calculateTotal() {

    return cart.reduce(
        (total, item) => {

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
// DISPLAY CART
// ==========================================

function renderOrder() {

    if (cart.length === 0) {

        orderItemsElement.innerHTML = `
            <p style="color:#aaa;text-align:center;">
                Your cart is empty.
            </p>
        `;

        placeOrderButton.disabled = true;

        orderTotalElement.textContent =
            "₹0";

        return;
    }


    orderItemsElement.innerHTML =
        cart.map(item => `

            <div class="order-item">

                <div>

                    <div class="item-name">
                        ${escapeHTML(item.name)}
                    </div>

                    <div class="item-details">
                        ${escapeHTML(item.category)}
                        ×
                        ${item.qty}
                    </div>

                </div>

                <div class="item-price">
                    ₹${Number(item.price) *
                       Number(item.qty)}
                </div>

            </div>

        `).join("");


    orderTotalElement.textContent =
        "₹" + calculateTotal();

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// ERROR
// ==========================================

function showError(message) {

    errorElement.textContent =
        message;

    errorElement.style.display =
        "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ==========================================
// VALIDATE PHONE
// ==========================================

function validPhone(phone) {

    return /^[6-9]\d{9}$/.test(phone);

}


// ==========================================
// CREATE ORDER NUMBER
// ==========================================

function generateOrderNumber() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    const random =
        Math.floor(
            1000 + Math.random() * 9000
        );

    return `RP-${year}${month}${day}-${random}`;

}


// ==========================================
// CREATE ORDER TOKEN
// ==========================================

function generateOrderToken() {

    if (
        window.crypto &&
        crypto.randomUUID
    ) {

        return crypto.randomUUID();

    }

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2)
    );

}


// ==========================================
// PLACE ORDER
// ==========================================

async function placeOrder() {

    errorElement.style.display =
        "none";


    // -----------------------------
    // CART CHECK
    // -----------------------------

    if (cart.length === 0) {

        showError(
            "Your cart is empty."
        );

        return;

    }


    // -----------------------------
    // CUSTOMER DETAILS
    // -----------------------------

    const customerName =
        document
            .getElementById("customerName")
            .value
            .trim();

    const customerPhone =
        document
            .getElementById("customerPhone")
            .value
            .trim();

    const notes =
        document
            .getElementById("notes")
            .value
            .trim();


    // -----------------------------
    // PAYMENT
    // -----------------------------

    const paymentElement =
        document.querySelector(
            'input[name="payment"]:checked'
        );


    const paymentMethod =
        paymentElement
            ? paymentElement.value
            : "cash";


    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (customerName.length < 2) {

        showError(
            "Please enter your name."
        );

        return;

    }


    if (!validPhone(customerPhone)) {

        showError(
            "Please enter a valid 10-digit Indian mobile number."
        );

        return;

    }


    // -----------------------------
    // DISABLE BUTTON
    // -----------------------------

    placeOrderButton.disabled =
        true;

    placeOrderButton.textContent =
        "PLACING ORDER...";


    // -----------------------------
    // ORDER DATA
    // -----------------------------

    const orderNumber =
        generateOrderNumber();

    const orderToken =
        generateOrderToken();

    const total =
        calculateTotal();


    const orderData = {

        order_number:
            orderNumber,

        order_token:
            orderToken,

        table_no:
            TABLE_NUMBER,

        customer_name:
            customerName,

        customer_phone:
            customerPhone,

        items:
            cart,

        total:
            total,

        payment_method:
            paymentMethod,

        payment_status:
            "pending",

        order_status:
            "new",

        notes:
            notes || null

    };


    try {

        // -------------------------
        // SEND TO SUPABASE
        // -------------------------

        const {
            data,
            error
        } =
            await supabaseClient
                .from("orders")
                .insert(orderData)
                .select()
                .single();


        if (error) {

            console.error(
                "Supabase error:",
                error
            );

            throw new Error(
                error.message
            );

        }


        // -------------------------
        // SAVE CUSTOMER ORDER
        // -------------------------

        localStorage.setItem(
            "rajathadri_last_order",
            JSON.stringify(data)
        );


        // -------------------------
        // CLEAR CART
        // -------------------------

        localStorage.removeItem(
            "rajathadri_cart"
        );


        // -------------------------
        // UPI
        // -------------------------

        if (
            paymentMethod === "upi"
        ) {

            const upiURL =
                "upi://pay" +
                "?pa=" +
                encodeURIComponent(
                    HOTEL_UPI_ID
                ) +
                "&pn=" +
                encodeURIComponent(
                    HOTEL_UPI_NAME
                ) +
                "&am=" +
                encodeURIComponent(
                    total.toFixed(2)
                ) +
                "&cu=INR" +
                "&tn=" +
                encodeURIComponent(
                    orderNumber
                );


            // Try opening UPI app

            window.location.href =
                upiURL;


            // After returning from UPI,
            // customer can check order.

            setTimeout(
                function () {

                    window.location.href =
                        "order.html?token=" +
                        encodeURIComponent(
                            orderToken
                        );

                },
                2500
            );

        }

        else {

            // -------------------------
            // CASH
            // -------------------------

            window.location.href =
                "order.html?token=" +
                encodeURIComponent(
                    orderToken
                );

        }


    }

    catch (error) {

        console.error(error);

        showError(
            "Unable to place your order. " +
            "Please check your internet connection and try again."
        );

        placeOrderButton.disabled =
            false;

        placeOrderButton.textContent =
            "PLACE ORDER";

    }

}


// ==========================================
// BACK TO MENU
// ==========================================

function goBackToMenu() {

    window.location.href =
        "menu.html?table=" +
        encodeURIComponent(
            TABLE_NUMBER
        );

}


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderOrder();

    }
);
