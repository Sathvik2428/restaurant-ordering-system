// ================================
// RAJATHADRI PALACE - MENU SCRIPT
// ================================
// ==========================================
// TABLE NUMBER
// ==========================================

const urlParams = new URLSearchParams(
    window.location.search
);

const TABLE_NUMBER =
    urlParams.get("table") || "Unknown";
const MENU = {
    "Hot Beverages": [
        { name: "Coffee / Tea", price: 35 },
        { name: "Badam Milk", price: 40 },
        { name: "Horlicks", price: 50 },
        { name: "Bournvita", price: 50 },
        { name: "Masala Tea", price: 45 },
        { name: "Ginger Tea", price: 45 },
        { name: "Lemon Tea", price: 45 }
    ],

    "Breakfast": [
        { name: "Idly (2)", price: 50 },
        { name: "Mini Idly", price: 55 },
        { name: "Rava Idly", price: 60 },
        { name: "Vada (1)", price: 45 },
        { name: "Idly Vada", price: 80 },
        { name: "Poori", price: 80 },
        { name: "Khara Bhath", price: 45 },
        { name: "Kesari Bath", price: 45 },
        { name: "Rice Bath", price: 70 },
        { name: "Chow Chow Bath", price: 80 }
    ],

    "Dosa": [
        { name: "Plain Dosa", price: 70 },
        { name: "Masala Dosa", price: 85 },
        { name: "Vegetable Dosa", price: 90 },
        { name: "Onion Dosa", price: 100 },
        { name: "Paper Plain Dosa", price: 110 },
        { name: "Paper Masala Dosa", price: 125 },
        { name: "Rava Dosa", price: 100 },
        { name: "Onion Rava Dosa", price: 115 },
        { name: "Rava Masala Dosa", price: 115 },
        { name: "Set Dosa", price: 90 },
        { name: "Cheese Plain Dosa", price: 100 },
        { name: "Cheese Masala Dosa", price: 125 },
        { name: "Butter Masala Dosa", price: 110 },
        { name: "Paneer Dosa", price: 125 }
    ],

    "Beverages": [
        { name: "Fresh Lime Juice", price: 70 },
        { name: "Pudina Nimboo", price: 80 },
        { name: "Fresh Lime Soda", price: 85 },
        { name: "Pudina Soda", price: 90 }
    ],

    "Fresh Fruit Juice": [
        { name: "Apple", price: 120 },
        { name: "Grape", price: 110 },
        { name: "Mango", price: 120 },
        { name: "Orange", price: 110 },
        { name: "Mosambi", price: 110 },
        { name: "Pineapple", price: 100 },
        { name: "Watermelon", price: 100 },
        { name: "Sweet Lassi", price: 95 },
        { name: "Butter Milk", price: 45 }
    ],

    "Milk Shakes": [
        { name: "Rose", price: 130 },
        { name: "Pista", price: 170 },
        { name: "Apple", price: 180 },
        { name: "Anjeer", price: 170 },
        { name: "Litchi", price: 180 },
        { name: "Mango", price: 180 },
        { name: "Vanilla", price: 140 },
        { name: "Chikoo", price: 140 },
        { name: "Banana", price: 130 },
        { name: "Strawberry", price: 140 },
        { name: "Cold Badam Milk", price: 120 },
        { name: "Kesar with Nuts", price: 190 },
        { name: "Chocolate with Nuts", price: 180 }
    ],

    "Anytime Breads": [
        { name: "Veg Sandwich", price: 80 },
        { name: "Veg Grill Sandwich", price: 120 },
        { name: "Cheese Sandwich", price: 110 },
        { name: "Veg Cheese Sandwich", price: 120 },
        { name: "Bread Butter Jam", price: 80 },
        { name: "Toast Butter", price: 70 },
        { name: "Bread Butter", price: 70 }
    ],

    "Salad & Raitha": [
        { name: "Green Salad", price: 90 },
        { name: "Cucumber Salad", price: 90 },
        { name: "Tomato Salad", price: 90 },
        { name: "Aloo Raitha", price: 90 },
        { name: "Onion Raitha", price: 90 },
        { name: "Boondi Raitha", price: 90 },
        { name: "Mixed Raitha", price: 100 },
        { name: "Plain Curd", price: 40 }
    ],

    "Soup": [
        { name: "Cream of Tomato", price: 120 },
        { name: "Sweet Corn Vegetable", price: 130 },
        { name: "Cream of Vegetable", price: 135 },
        { name: "Cream of Mushroom", price: 140 },
        { name: "Hot & Sour Veg.", price: 145 },
        { name: "Veg Manchow", price: 145 },
        { name: "Veg Clear Soup", price: 145 },
        { name: "French Onion Soup", price: 145 },
        { name: "Lemon Coriander Soup", price: 150 }
    ],

    "Jain Curries": [
        { name: "Dal Fry", price: 180 },
        { name: "Dal Palak", price: 190 },
        { name: "Mixed Veg Curry", price: 210 },
        { name: "Paneer Butter Masala", price: 230 },
        { name: "Veg Kolhapur", price: 250 },
        { name: "Kadai Paneer", price: 250 },
        { name: "Veg Malai Kofta", price: 250 },
        { name: "Kaju Masala", price: 280 },
        { name: "Shahi Paneer", price: 270 }
    ],

    "Rotiyon Ka Pariwar": [
        { name: "Roti", price: 40 },
        { name: "Butter Roti", price: 50 },
        { name: "Methi Roti", price: 60 },
        { name: "Naan", price: 60 },
        { name: "Garlic Naan", price: 80 },
        { name: "Butter Naan", price: 80 },
        { name: "Plain Paratha", price: 60 },
        { name: "Lacha Paratha", price: 70 },
        { name: "Pudina Paratha", price: 75 },
        { name: "Aloo Paratha", price: 85 },
        { name: "Gobi Paratha", price: 85 },
        { name: "Paneer Paratha", price: 95 },
        { name: "Kulcha", price: 50 },
        { name: "Butter Kulcha", price: 60 },
        { name: "Channa Batura", price: 140 }
    ],

    "Meals of South": [
        { name: "South Indian Meals", price: 140 },
        { name: "South Indian Special Meals", price: 275 }
    ],

    "North Indian Meals": [
        { name: "North Indian Special Meals", price: 300 }
    ],

    "Flavoured Rice": [
        { name: "Peas Pulao", price: 210 },
        { name: "Veg Handi Biriyani", price: 240 },
        { name: "Tawa Pulao", price: 250 },
        { name: "Paneer Tikka Biriyani", price: 260 },
        { name: "Mushroom Tikka Biriyani", price: 270 },
        { name: "Shahjahani Biriyani", price: 250 },
        { name: "Chef Special Biriyani", price: 280 },
        { name: "Mughlai Biriyani", price: 270 },
        { name: "Veg Hydrabadi Biriyani", price: 260 },
        { name: "Kashmiri Pulao", price: 270 },
        { name: "Ghee Rice", price: 230 },
        { name: "Dal Khichdi", price: 230 },
        { name: "Curd Rice", price: 90 },
        { name: "Jeer Rice", price: 200 }
    ],

    "Main Course Indian": [
        { name: "Paneer Tikka Masala", price: 280 },
        { name: "Paneer Butter Masala", price: 250 },
        { name: "Paneer Korma", price: 245 },
        { name: "Punjabi Paneer Bhurji", price: 250 },
        { name: "Veg Makhanwala", price: 250 },
        { name: "Mixed Veg Curry", price: 230 },
        { name: "Channa Masala", price: 200 },
        { name: "Navarthna Korma", price: 250 },
        { name: "Vegetable Kofta", price: 250 },
        { name: "Paneer Kofta", price: 250 },
        { name: "Mushroom Masala", price: 265 },
        { name: "Kadai Paneer", price: 275 },
        { name: "Kadai Vegetable", price: 265 },
        { name: "Kaju Kadai", price: 290 }
    ],

    "Dal": [
        { name: "Dal Fry", price: 180 },
        { name: "Dal Palak", price: 190 },
        { name: "Dal Makhani", price: 210 },
        { name: "Dal Tadka", price: 200 },
        { name: "Dal Punjabi", price: 210 }
    ],

    "Special Desserts": [
        { name: "Golden Cherry", price: 230 },
        { name: "Hot Chocolate Fudge", price: 220 },
        { name: "Banana Split", price: 240 },
        { name: "Vanilla Nut Sundae", price: 210 },
        { name: "Gud Bud Special", price: 210 },
        { name: "Fruit Bowl with Ice Cream", price: 220 },
        { name: "Ice Cream Bowl Special", price: 260 }
    ],

    "Falooda": [
        { name: "Special Falooda", price: 200 },
        { name: "Kesar Falooda", price: 190 },
        { name: "Royal Falooda", price: 190 }
    ],

    "Choice of Ice Creams": [
        { name: "Dry Fruit", price: 120 },
        { name: "Chocolate", price: 110 },
        { name: "Strawberry", price: 100 },
        { name: "Kesar Pista", price: 115 },
        { name: "Tutty Fruity", price: 110 },
        { name: "Fig & Honey", price: 120 },
        { name: "Butter Scotch", price: 115 }
    ],

    "Chinese Starters": [
        { name: "Crispy Assorted Veg", price: 230 },
        { name: "Paneer Navy Cut Chilli", price: 240 },
        { name: "Vegetable Spring Roll", price: 230 },
        { name: "Veg Ball Chilli", price: 210 },
        { name: "Gobi 65", price: 200 },
        { name: "French Fries", price: 100 },
        { name: "Mushroom Pepper Dry", price: 250 },
        { name: "Mushroom Chilli", price: 250 },
        { name: "Gobi Manchurian", price: 190 },
        { name: "Veg Manchurian", price: 220 },
        { name: "Paneer Manchurian", price: 240 },
        { name: "Mushroom Manchurian", price: 240 },
        { name: "Paneer Chilli", price: 250 },
        { name: "Babycorn Chilli", price: 225 },
        { name: "Gobi Chilli", price: 240 }
    ],

    "Tandoor Se": [
        { name: "Aloo Ki Sholey", price: 210 },
        { name: "Rangeeli Paneer Tikka", price: 250 },
        { name: "Paneer Tikka Makamali", price: 280 },
        { name: "Stuffed Mushroom", price: 280 },
        { name: "Babycorn Angara", price: 260 },
        { name: "Rajatadri Special Paneer Tikka", price: 280 },
        { name: "Aloo Tikka Amritswari", price: 230 },
        { name: "Hara Bhara Kebab", price: 250 },
        { name: "Paneer Pahadi Tikka", price: 260 },
        { name: "Paneer Kali Mirch", price: 260 },
        { name: "Paneer Tikka", price: 260 },
        { name: "Masala Paneer Tikka", price: 260 },
        { name: "Tandoori Assorted Platter - Small", price: 380 },
        { name: "Tandoori Assorted Platter - Large", price: 490 }
    ],

    "Chats": [
        { name: "Pani Puri", price: 85 },
        { name: "Masala Puri", price: 85 },
        { name: "Sev Puri", price: 85 },
        { name: "Aloo Puri", price: 80 },
        { name: "Special Sev Puri", price: 100 },
        { name: "Bhel Puri", price: 90 },
        { name: "Special Bhel Puri", price: 100 },
        { name: "Dahi Puri", price: 90 },
        { name: "Sev Dahi Batata Puri", price: 100 },
        { name: "Dahi Papdi Chat", price: 100 },
        { name: "Vegetable Samosa", price: 50 },
        { name: "Vegetable Cutlet", price: 50 },
        { name: "Ragada Samosa", price: 80 },
        { name: "Ragada Cutlet", price: 80 },
        { name: "Pav Bhaji", price: 130 },
        { name: "Cheese Pav Bhaji", price: 160 },
        { name: "Paneer Pav Bhaji", price: 160 },
        { name: "Mushroom Pav Bhaji", price: 160 },
        { name: "Extra Pav", price: 50 },
        { name: "Masala Pav", price: 90 },
        { name: "Special Pav Bhaji", price: 175 }
    ]
};


// ================================
// CATEGORY ICONS
// ================================

const categoryIcons = {
    "Hot Beverages": "☕",
    "Breakfast": "🍽️",
    "Dosa": "🥞",
    "Beverages": "🥤",
    "Fresh Fruit Juice": "🍹",
    "Milk Shakes": "🥛",
    "Anytime Breads": "🥪",
    "Salad & Raitha": "🥗",
    "Soup": "🍲",
    "Jain Curries": "🥘",
    "Rotiyon Ka Pariwar": "🫓",
    "Meals of South": "🍛",
    "North Indian Meals": "🍛",
    "Flavoured Rice": "🍚",
    "Main Course Indian": "🍛",
    "Dal": "🥣",
    "Special Desserts": "🍮",
    "Falooda": "🥤",
    "Choice of Ice Creams": "🍦",
    "Chinese Starters": "🥟",
    "Tandoor Se": "🔥",
    "Chats": "🥙"
};


// ================================
// CART
// ================================

let cart = [];


// ================================
// CREATE CATEGORIES
// ================================

function renderCategories() {

    const container = document.getElementById("categories");

    if (!container) return;

    container.innerHTML = "";

    Object.keys(MENU).forEach((category, index) => {

        const div = document.createElement("div");

        div.className =
            "category" + (index === 0 ? " active" : "");

        div.dataset.category = category;

        div.innerHTML = `
            <div class="cat-icon">
                ${categoryIcons[category] || "🍴"}
            </div>

            <p>${category}</p>
        `;

        div.onclick = function () {
            showCategory(category);
        };

        container.appendChild(div);
    });
}


// ================================
// CREATE FOOD MENU
// ================================

function renderMenu(searchText = "") {

    const container =
        document.getElementById("menuContainer");

    if (!container) return;

    container.innerHTML = "";

    const search =
        searchText.trim().toLowerCase();

    Object.entries(MENU).forEach(
        ([category, items]) => {

            const filteredItems =
                items.filter(item =>
                    item.name
                        .toLowerCase()
                        .includes(search)
                );

            if (filteredItems.length === 0)
                return;

            const section =
                document.createElement("section");

            section.className = "menu-section";

            section.id =
                "section-" +
                category
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-");

            section.innerHTML = `
                <div class="section-header">

                    <h2>
                        <span class="gold-icon">
                            ${categoryIcons[category] || "✦"}
                        </span>

                        ${category.toUpperCase()}
                    </h2>

                    <span class="view-all">
                        ${filteredItems.length} items
                    </span>

                </div>

                <div class="cards-scroll-container"></div>
            `;

            const cards =
                section.querySelector(
                    ".cards-scroll-container"
                );

            filteredItems.forEach(item => {

                const card =
                    document.createElement("div");

                card.className =
                    "food-card no-photo";

                card.innerHTML = `

                    <div class="food-icon">
                        ${categoryIcons[category] || "🍴"}
                    </div>

                    <div class="card-content">

                        <h3>
                            ${item.name}
                        </h3>

                        <p>
                            ${category}
                        </p>

                        <div class="price-action">

                            <span class="price">
                                ₹${item.price}
                            </span>

                            <button
                                class="add-btn"
                                onclick="addToCart(
                                    '${category.replace(/'/g, "\\'")}',
                                    '${item.name.replace(/'/g, "\\'")}',
                                    ${item.price}
                                )"
                            >
                                +
                            </button>

                        </div>

                    </div>
                `;

                cards.appendChild(card);
            });

            container.appendChild(section);
        }
    );

    if (!container.children.length) {

        container.innerHTML = `
            <div class="no-results">
                No food item found for
                "<strong>${searchText}</strong>"
            </div>
        `;
    }
}


// ================================
// SHOW CATEGORY
// ================================

function showCategory(category) {

    document
        .querySelectorAll(".category")
        .forEach(categoryElement => {

            categoryElement.classList.toggle(
                "active",
                categoryElement.dataset.category === category
            );

        });

    const section =
        document.getElementById(
            "section-" +
            category
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
        );

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
}


// ================================
// SEARCH
// ================================

function searchMenu(value) {

    document
        .querySelectorAll(".category")
        .forEach(category => {

            category.classList.remove("active");

        });

    renderMenu(value);
}


// ================================
// ADD TO CART
// ================================

function addToCart(category, name, price) {

    const existingItem =
        cart.find(item =>
            item.name === name &&
            item.category === category
        );

    if (existingItem) {

        existingItem.qty++;

    } else {

        cart.push({
            category: category,
            name: name,
            price: price,
            qty: 1
        });

    }

    updateCart();
}


// ================================
// UPDATE CART
// ================================

function updateCart() {

    const count =
        cart.reduce(
            (sum, item) =>
                sum + item.qty,
            0
        );

    const total =
        cart.reduce(
            (sum, item) =>
                sum + item.price * item.qty,
            0
        );


    const topCount =
        document.getElementById("topCartCount");

    const cartCount =
        document.getElementById("cartCount");

    const cartTotal =
        document.getElementById("cartTotal");

    const modalTotal =
        document.getElementById("modalTotal");


    if (topCount)
        topCount.textContent = count;

    if (cartCount)
        cartCount.textContent = count;

    if (cartTotal)
        cartTotal.textContent =
            "₹" + total;

    if (modalTotal)
        modalTotal.textContent =
            "₹" + total;


    renderCartItems();
}


// ================================
// RENDER CART
// ================================

function renderCartItems() {

    const container =
        document.getElementById("cartItems");

    if (!container) return;


    if (cart.length === 0) {

        container.innerHTML = `
            <p class="empty-cart">
                Your cart is empty.
            </p>
        `;

        return;
    }


    container.innerHTML =
        cart.map((item, index) => `

            <div class="cart-item">

                <div>

                    <strong>
                        ${item.name}
                    </strong>

                    <small>
                        ${item.category}
                    </small>

                    <span>
                        ₹${item.price}
                        ×
                        ${item.qty}
                    </span>

                </div>


                <div class="qty-controls">

                    <button
                        onclick="changeQty(${index}, -1)"
                    >
                        −
                    </button>

                    <b>
                        ${item.qty}
                    </b>

                    <button
                        onclick="changeQty(${index}, 1)"
                    >
                        +
                    </button>

                </div>

            </div>

        `).join("");
}


// ================================
// CHANGE QUANTITY
// ================================

function changeQty(index, change) {

    cart[index].qty += change;

    if (cart[index].qty <= 0) {

        cart.splice(index, 1);

    }

    updateCart();
}


// ================================
// CLEAR CART
// ================================

function clearCart() {

    cart = [];

    updateCart();
}


// ================================
// OPEN CART
// ================================

function openCart() {

    const modal =
        document.getElementById("cartModal");

    if (!modal) return;

    modal.classList.add("show");

    updateCart();
}


// ================================
// CLOSE CART
// ================================

function closeCart(event) {

    const modal =
        document.getElementById("cartModal");

    if (!modal) return;

    if (
        !event ||
        event.target === modal
    ) {

        modal.classList.remove("show");

    }
}


// ================================
// START WEBSITE
// ================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderCategories();

        renderMenu();

        updateCart();

    }
);
