// ==========================================
// RAJATHADRI PALACE
// ORDER STATUS
// BATCH 3
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
// GET ORDER TOKEN
// ==========================================

const urlParams =
    new URLSearchParams(window.location.search);

const ORDER_TOKEN =
    urlParams.get("token") ||
    localStorage.getItem("rajathadri_order_token");


// ==========================================
// LOAD ORDER
// ==========================================

async function loadOrder() {

    const information =
        document.getElementById(
            "orderInformation"
        );

    const status =
        document.getElementById(
            "orderStatus"
        );


    if (!ORDER_TOKEN) {

        information.innerHTML =
            "<p>No order found.</p>";

        status.innerHTML =
            "<p>Please open your order status using the order link.</p>";

        return;

    }


    try {

        const {
            data,
            error
        } = await supabaseClient.rpc(
            "get_order_by_token",
            {
                p_token: ORDER_TOKEN
            }
        );


        if (error) {

            console.error(error);

            throw new Error(
                error.message
            );

        }


        if (!data || data.length === 0) {

            information.innerHTML =
                "<p>Order not found.</p>";

            status.innerHTML =
                "<p>Please check your order link.</p>";

            return;

        }


        const order =
            data[0];


        // ----------------------------------
        // SAVE TOKEN
        // ----------------------------------

        localStorage.setItem(
            "rajathadri_order_token",
            ORDER_TOKEN
        );


        // ----------------------------------
        // ORDER INFORMATION
        // ----------------------------------

        information.innerHTML = `

            <div class="checkout-item">

                <div class="checkout-item-info">

                    <h3>
                        Order ${escapeHtml(
                            order.order_number
                        )}
                    </h3>

                    <p>
                        Table ${escapeHtml(
                            order.table_no
                        )}
                    </p>

                </div>

                <div class="checkout-item-price">

                    ₹${Number(
                        order.total
                    ).toFixed(0)}

                </div>

            </div>

        `;


        // ----------------------------------
        // STATUS
        // ----------------------------------

        displayStatus(
            order.order_status
        );


    }

    catch (error) {

        console.error(error);

        information.innerHTML =
            "<p>Unable to load your order.</p>";

        status.innerHTML =
            "<p>" +
            escapeHtml(error.message) +
            "</p>";

    }

}


// ==========================================
// DISPLAY STATUS
// ==========================================

function displayStatus(
    currentStatus
) {

    const status =
        document.getElementById(
            "orderStatus"
        );


    const statuses = [

        "new",

        "preparing",

        "ready",

        "served"

    ];


    const statusNames = {

        new:
            "Order Received",

        preparing:
            "Preparing",

        ready:
            "Ready",

        served:
            "Served"

    };


    let html = "";


    statuses.forEach(
        function (item) {

            const active =
                item === currentStatus;

            const completed =
                statuses.indexOf(item) <
                statuses.indexOf(currentStatus);


            let className =
                "order-status-step";


            if (active) {

                className +=
                    " active";

            }


            if (completed) {

                className +=
                    " completed";

            }


            html += `

                <div class="${className}">

                    <div class="status-circle">

                        ${completed || active ? "✓" : ""}

                    </div>

                    <div class="status-name">

                        ${statusNames[item]}

                    </div>

                </div>

            `;

        }
    );


    status.innerHTML =
        `<div class="order-progress">
            ${html}
        </div>`;

}


// ==========================================
// ORDER MORE FOOD
// ==========================================

function orderMore() {

    const table =
        localStorage.getItem(
            "rajathadri_table"
        ) || "1";


    window.location.href =
        "menu.html?table=" +
        encodeURIComponent(table);

}


// ==========================================
// REQUEST FINAL BILL
// ==========================================

async function requestBill() {

    const sessionId =
        localStorage.getItem(
            "rajathadri_session_id"
        );


    if (!sessionId) {

        showMessage(
            "No active table session found.",
            "error"
        );

        return;

    }


    try {

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
                sessionId
            );


        if (error) {

            throw new Error(
                error.message
            );

        }


        showMessage(

            "Final bill requested successfully. Please wait for the hotel.",

            "success"

        );

    }

    catch (error) {

        console.error(error);

        showMessage(

            "Unable to request bill: " +
            error.message,

            "error"

        );

    }

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
            "statusMessage"
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


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadOrder();

    }
);
