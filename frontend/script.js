/* LIBROWSE BOOK EXCHANGE - Main JavaScript */


/* BACK-END LOCATION */

/*
   HTML Live Preview runs separately from PHP.
   PHP back-end will run at: http://127.0.0.1:8000/
   API files are served from: /api/
*/
const API_BASE =
    "http://127.0.0.1:8000/api";


/* GLOBAL DATA */

/* Temporary storage for API data */

let bookListings = [];

let booksCatalog = [];

let users = [];

let transactions = [];


/* Quick lookup maps for IDs */

let bookMap = {};

let userMap = {};

let inventoryMap = {};

let categoryMap = {};

let currentUser = null;


/* AUTH HELPERS */

function loadCurrentUser() {

    try {

        const stored =
            localStorage.getItem(
                "librowseCurrentUser"
            );

        currentUser =
            stored ? JSON.parse(stored) : null;

    } catch {

        currentUser = null;

    }

}


function updateAuthStatusUI() {

    const authStatus =
        document.getElementById(
            "auth-status"
        );


    if (!authStatus) {
        return;
    }


    if (!currentUser) {

        authStatus.innerHTML = `
            <a href="login.html">
                Sign in
            </a>
            <a href="register.html">
                Create account
            </a>
        `;

        return;

    }


    authStatus.innerHTML = `
        <span>
            Signed in as <strong>${currentUser.username}</strong>
        </span>

        <button id="logout-button" type="button">
            Log out
        </button>
    `;


    const logoutButton =
        document.getElementById(
            "logout-button"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                localStorage.removeItem(
                    "librowseCurrentUser"
                );

                currentUser = null;

                updateAuthStatusUI();

                alert("You have been logged out.");

                window.location.href =
                    "login.html";

            }
        );

    }

}


function requireAuthenticatedCustomer() {

    if (!currentUser) {

        alert(
            "Please login or register first."
        );

        window.location.href =
            "login.html";

        return false;

    }


    if (currentUser.role !== "Customer") {

        alert(
            "This page currently supports Customer accounts only."
        );

        window.location.href =
            "login.html";

        return false;

    }


    return true;

}


function applyCurrentUserToForms() {

    if (!currentUser) {
        return;
    }


    const customerIdInput =
        document.getElementById(
            "customer-id"
        );

    if (customerIdInput) {
        customerIdInput.value =
            currentUser.user_id;

        customerIdInput.readOnly = true;
    }


    const submittedByInput =
        document.getElementById(
            "submitted-by"
        );

    if (submittedByInput) {
        submittedByInput.value =
            currentUser.user_id;

        submittedByInput.readOnly = true;
    }

}


/* GENERAL API FUNCTION */

/* Handles all communication with PHP back-end */
/*
   GET    = retrieve data
   POST   = create data
   PUT    = update data
   DELETE = remove data
*/

async function apiRequest(endpoint, options = {}) {

    const url = `${API_BASE}/${endpoint}`;

    /* Abort the request if the server takes too long to respond, so the
       UI shows an error instead of hanging on "Loading..." forever */

    const controller = new AbortController();

    const timeoutId = setTimeout(function () {
        controller.abort();
    }, 8000);

    try {

        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        /* PHP API returns JSON */
        const text = await response.text();

        let data;

        try {

            data = JSON.parse(text);

        } catch {

            throw new Error(
                "The server did not return valid JSON."
            );

        }


        /* response.ok = success */
        if (!response.ok) {

            throw new Error(
                data.error || "Something went wrong."
            );

        }

        return data;

    } catch (error) {

        if (error.name === "AbortError") {

            error = new Error(
                `Request to ${url} timed out. Is the PHP server running (php -S 127.0.0.1:8000) and reachable?`
            );

        }

        console.error(
            "API Error:",
            error
        );

        throw error;

    } finally {

        clearTimeout(timeoutId);

    }

}


/* FORMAT FUNCTIONS */

/* Convert database values to readable text */
/*
   Example: For_sale becomes For Sale
*/

function formatListingType(type) {

    if (type === "For_sale") {
        return "For Sale";
    }

    if (type === "For_trade") {
        return "For Trade";
    }

    if (type === "Both") {
        return "Sale / Trade";
    }

    return type;

}


/* Format price to Philippine Peso */
/*
   Example: 500 becomes ₱500.00
*/

function formatPrice(price) {

    if (
        price === null ||
        price === "" ||
        price === undefined
    ) {

        return "Trade Only";

    }

    const amount = Number(price);

    return `₱${amount.toFixed(2)}`;

}


/* LOAD BOOKS */

/* Fetch books, catalog, and user data from API */

async function loadBooks() {

    const bookList =
        document.getElementById("book-list");

    try {

        bookList.innerHTML = `
            <tr>
                <td colspan="10">
                    Loading books...
                </td>
            </tr>
        `;


        /* Fetch multiple endpoints at once */

        /* Fetch multiple endpoints at once */

        const results = await Promise.all([

            apiRequest("user_books.php"),

            apiRequest("books_catalog.php"),

            apiRequest("user.php")

        ]);


        bookListings = results[0];

        booksCatalog = results[1];

        users = results[2];


        /* Reset maps */

        /* Reset maps */

        bookMap = {};

        userMap = {};

        inventoryMap = {};


        /* Create book lookup map */

        booksCatalog.forEach(function (book) {

            bookMap[book.book_id] = book;

        });


        /* Create user lookup map */

        users.forEach(function (user) {

            userMap[user.user_id] = user;

        });


        /* Create inventory/listing lookup map */

        bookListings.forEach(function (listing) {

            inventoryMap[listing.inventory_id] =
                listing;

        });


        renderBooks(bookListings);


    } catch (error) {

        bookList.innerHTML = `
            <tr>
                <td colspan="10">
                    Unable to connect to the back-end.
                </td>
            </tr>
        `;

        console.error(error);

    }

}


/* DISPLAY BOOKS */

function renderBooks(listings) {

    const bookList =
        document.getElementById("book-list");


    /* No books found */

    if (listings.length === 0) {

        bookList.innerHTML = `
            <tr>
                <td colspan="10">
                    No books found.
                </td>
            </tr>
        `;

        return;

    }


    /* Clear previous contents */

    bookList.innerHTML = "";


    /* Loop through listings */

    listings.forEach(function (listing) {

        const book =
            bookMap[listing.book_id];

        const seller =
            userMap[listing.seller_id];


        /* Use fallback if no match */

        const title =
            book ? book.title : "Unknown Book";

        const author =
            book ? book.author : "Unknown Author";

        const categoryNames =
            book ? formatCategoryNames(book) : "Uncategorized";

        const sellerName =
            seller
                ? seller.username
                : `User #${listing.seller_id}`;


        /* Create table row */

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${listing.book_id}
            </td>

            <td>
                ${title}
            </td>

            <td>
                ${author}
            </td>

            <td>
                ${categoryNames}
            </td>

            <td>
                ${sellerName}
            </td>

            <td>
                ${formatListingType(
            listing.listing_type
        )}
            </td>

            <td>
                ${listing.condition}
            </td>

            <td>
                ${formatPrice(
            listing.price
        )}
            </td>

            <td>
                ${listing.status}
            </td>

            <td class="book-actions"></td>

        `;


        /* Show action buttons only when available */

        const actionCell =
            row.querySelector(".book-actions");


        if (listing.status === "Available") {

            /* Show Buy button if available for purchase */

            if (
                listing.listing_type === "For_sale" ||
                listing.listing_type === "Both"
            ) {

                const buyButton =
                    document.createElement("button");

                buyButton.textContent = "Buy";

                buyButton.addEventListener(
                    "click",
                    function () {

                        buyBook(listing);

                    }
                );

                actionCell.appendChild(
                    buyButton
                );

            }


            /* Show Trade button if available for trade */

            if (
                listing.listing_type === "For_trade" ||
                listing.listing_type === "Both"
            ) {

                const tradeButton =
                    document.createElement("button");

                tradeButton.textContent = "Trade";

                tradeButton.addEventListener(
                    "click",
                    function () {

                        tradeBook(listing);

                    }
                );

                actionCell.appendChild(
                    tradeButton
                );

            }

        } else {

            actionCell.textContent =
                "Not Available";

        }


        /* Add row to table */

        bookList.appendChild(row);

    });

}


/* SEARCH AND FILTER BOOKS */

function filterBooks() {

    const searchValue =
        document
            .getElementById("search-book")
            .value
            .toLowerCase()
            .trim();


    const listingType =
        document
            .getElementById("filter-type")
            .value;


    const condition =
        document
            .getElementById("filter-condition")
            .value;


    const selectedCategoryIds =
        getSelectedFilterCategoryIds();


    const filtered =
        bookListings.filter(
            function (listing) {

                const book =
                    bookMap[listing.book_id];


                const title =
                    book
                        ? book.title.toLowerCase()
                        : "";


                const author =
                    book
                        ? book.author.toLowerCase()
                        : "";


                /* Check search text */

                const matchesSearch =

                    title.includes(searchValue) ||

                    author.includes(searchValue);


                /* Check listing type */

                const matchesType =

                    listingType === "" ||

                    listing.listing_type ===
                    listingType;


                /* Check condition */

                const matchesCondition =

                    condition === "" ||

                    listing.condition ===
                    condition;


                /* Check category - book must have at least one of the
                   checked categories (no boxes checked = match everything) */

                const bookCategoryIds =
                    (book && Array.isArray(book.category_ids))
                        ? book.category_ids
                        : [];

                const matchesCategory =

                    selectedCategoryIds.length === 0 ||

                    bookCategoryIds.some(function (categoryId) {
                        return selectedCategoryIds.includes(categoryId);
                    });


                /* Book must pass all filters */

                return (
                    matchesSearch &&
                    matchesType &&
                    matchesCondition &&
                    matchesCategory
                );

            }
        );


    renderBooks(filtered);

}


/* LOAD BOOK CATEGORIES (for the List a Book form) */
/* Rendered as checkboxes, since a book can belong to more than one category */

/* Builds a row of checkboxes for one category list inside a container */

function renderCategoryCheckboxes(container, categories, idPrefix) {

    if (categories.length === 0) {

        container.innerHTML = `
            <p class="checkbox-group-empty">
                No categories available.
            </p>
        `;

        return;

    }

    container.innerHTML = "";

    categories.forEach(function (category) {

        const optionWrapper =
            document.createElement("label");

        optionWrapper.className =
            "checkbox-option";

        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.name = "category_ids";
        checkbox.value = category.category_id;
        checkbox.id = `${idPrefix}-${category.category_id}`;

        optionWrapper.appendChild(checkbox);

        optionWrapper.appendChild(
            document.createTextNode(
                ` ${category.category_name}`
            )
        );

        container.appendChild(optionWrapper);

    });

}


async function loadCategories() {

    const categoryOptions =
        document.getElementById(
            "book-category-options"
        );

    const filterCategoryOptions =
        document.getElementById(
            "filter-category-options"
        );

    if (!categoryOptions && !filterCategoryOptions) {
        return;
    }

    try {

        const categories =
            await apiRequest(
                "book_categories.php"
            );

        /* Keep a lookup of category_id -> category_name for display
           elsewhere (e.g. the browse table) */

        categoryMap = {};

        categories.forEach(function (category) {

            categoryMap[category.category_id] =
                category.category_name;

        });


        if (categoryOptions) {

            renderCategoryCheckboxes(
                categoryOptions,
                categories,
                "book-category"
            );

        }


        if (filterCategoryOptions) {

            renderCategoryCheckboxes(
                filterCategoryOptions,
                categories,
                "filter-category"
            );

            /* Re-run the search whenever a filter checkbox is toggled */

            filterCategoryOptions
                .querySelectorAll('input[name="category_ids"]')
                .forEach(function (checkbox) {

                    checkbox.addEventListener(
                        "change",
                        filterBooks
                    );

                });

        }

    } catch (error) {

        const message = `
            <p class="checkbox-group-empty">
                Unable to load categories.
            </p>
        `;

        if (categoryOptions) {
            categoryOptions.innerHTML = message;
        }

        if (filterCategoryOptions) {
            filterCategoryOptions.innerHTML = message;
        }

        console.error(
            "Unable to load categories.",
            error
        );

    }

}


/* Reads the checked category checkboxes from the List a Book form */

function getSelectedCategoryIds() {

    const checkedBoxes =
        document.querySelectorAll(
            '#book-category-options input[name="category_ids"]:checked'
        );

    return Array.from(checkedBoxes).map(function (checkbox) {
        return Number(checkbox.value);
    });

}


/* Reads the checked category checkboxes from the Browse Books filters */

function getSelectedFilterCategoryIds() {

    const checkedBoxes =
        document.querySelectorAll(
            '#filter-category-options input[name="category_ids"]:checked'
        );

    return Array.from(checkedBoxes).map(function (checkbox) {
        return Number(checkbox.value);
    });

}


/* Turns a book's category_ids into a readable, comma-separated list
   of category names, using the categoryMap loaded above */

function formatCategoryNames(book) {

    if (!book || !Array.isArray(book.category_ids) || book.category_ids.length === 0) {
        return "Uncategorized";
    }

    return book.category_ids
        .map(function (categoryId) {
            return categoryMap[categoryId] || `Category #${categoryId}`;
        })
        .join(", ");

}


/* LIST A BOOK */

async function submitBookListing(event) {

    /* Prevent page refresh on submit */

    event.preventDefault();


    /* Must be logged in - seller ID comes from the session, never from a text field */

    if (!requireAuthenticatedCustomer()) {
        return;
    }


    const title =
        document
            .getElementById("book-title")
            .value
            .trim();


    const author =
        document
            .getElementById("book-author")
            .value
            .trim();


    const isbn =
        document
            .getElementById("book-isbn")
            .value
            .trim();


    const categoryIds =
        getSelectedCategoryIds();


    const listingType =
        document
            .getElementById("listing-type")
            .value;


    const price =
        document
            .getElementById("price")
            .value;


    const condition =
        document
            .getElementById("book-condition")
            .value;


    if (categoryIds.length === 0) {

        alert(
            "Please select at least one category."
        );

        return;

    }


    /* Sale listings require a price */

    if (
        (
            listingType === "For_sale" ||
            listingType === "Both"
        ) &&
        price === ""
    ) {

        alert(
            "Please enter a price for this listing."
        );

        return;

    }


    try {

        /* Step 1: create a new BOOKS_CATALOG entry for this title/author.
           Every listing creates its own catalog row - nothing here is
           limited to books that already exist in the database. */

        const catalogData = {

            category_ids:
                categoryIds,

            managed_by_admin_id:
                currentUser.user_id,

            title:
                title,

            author:
                author,

            isbn:
                isbn

        };

        const newBook =
            await apiRequest(
                "books_catalog.php",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            catalogData
                        )

                }
            );


        /* Step 2: create the USER_BOOKS listing, pointing at the book
           we just created and the currently logged-in seller */

        const listingData = {

            book_id:
                newBook.book_id,

            seller_id:
                currentUser.user_id,

            listing_type:
                listingType,

            condition:
                condition,

            status:
                "Available"

        };

        /* Include price only if entered */

        if (price !== "") {

            listingData.price =
                Number(price);

        }

        const newListing =
            await apiRequest(
                "user_books.php",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            listingData
                        )

                }
            );


        alert(
            "Book listed successfully!"
        );


        /* Show the newly created listing back to the user */

        showNewListingResult(
            newListing,
            newBook
        );


        /* Clear form after submission */

        document
            .getElementById(
                "list-book-form"
            )
            .reset();


        /* Refresh table to show new listing */

        await loadBooks();


    } catch (error) {

        alert(
            "Unable to list book.\n\n" +
            error.message
        );

    }

}


/* DISPLAY THE LISTING JUST CREATED */

function showNewListingResult(listing, book) {

    const resultPanel =
        document.getElementById(
            "new-listing-result"
        );

    const detailsBody =
        document.getElementById(
            "new-listing-details"
        );

    if (!resultPanel || !detailsBody) {
        return;
    }

    const rows = [

        ["Inventory ID", listing.inventory_id],
        ["Book ID", listing.book_id],
        ["Seller ID", listing.seller_id],
        ["Title", book.title],
        ["Author", book.author],
        ["ISBN", book.isbn],
        ["Categories", formatCategoryNames(book)],
        ["Listing Type", formatListingType(listing.listing_type)],
        ["Condition", listing.condition],
        ["Price", formatPrice(listing.price)],
        ["Status", listing.status]

    ];

    detailsBody.innerHTML =
        rows
            .map(function (row) {

                return `
                    <tr>
                        <th>${row[0]}</th>
                        <td>${row[1]}</td>
                    </tr>
                `;

            })
            .join("");

    resultPanel.style.display = "block";

}


/* BUY A BOOK */

async function buyBook(listing) {

    if (!requireAuthenticatedCustomer()) {
        return;
    }

    const buyerId =
        String(currentUser.user_id);


    if (!buyerId) {
        return;
    }


    const confirmed =
        confirm(
            "Do you want to purchase this book?"
        );


    if (!confirmed) {
        return;
    }


    const transactionData = {

        buyer_id:
            Number(buyerId),

        requested_inventory_id:
            Number(
                listing.inventory_id
            ),

        transaction_type:
            "Purchase",

        amount_paid:
            listing.price
                ? Number(listing.price)
                : 0,

        status:
            "Pending"

    };


    try {

        await apiRequest(
            "transactions.php",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        transactionData
                    )

            }
        );


        alert(
            "Purchase request submitted!"
        );


        await loadTransactions();


    } catch (error) {

        alert(
            "Unable to create transaction.\n\n" +
            error.message
        );

    }

}


/* TRADE A BOOK */

async function tradeBook(listing) {

    if (!requireAuthenticatedCustomer()) {
        return;
    }

    const buyerId =
        String(currentUser.user_id);


    if (!buyerId) {
        return;
    }


    /* Trade requires offering own inventory item */

    const offeredInventoryId =
        prompt(
            "Enter the Inventory ID of the book you want to offer:"
        );


    if (!offeredInventoryId) {
        return;
    }


    const transactionData = {

        buyer_id:
            Number(buyerId),

        requested_inventory_id:
            Number(
                listing.inventory_id
            ),

        offered_inventory_id:
            Number(
                offeredInventoryId
            ),

        transaction_type:
            "Trade",

        amount_paid:
            0,

        status:
            "Pending"

    };


    try {

        await apiRequest(
            "transactions.php",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        transactionData
                    )

            }
        );


        alert(
            "Trade request submitted!"
        );


        await loadTransactions();


    } catch (error) {

        alert(
            "Unable to create trade request.\n\n" +
            error.message
        );

    }

}


/* LOAD TRANSACTIONS */

async function loadTransactions() {

    const transactionList =
        document.getElementById(
            "transaction-list"
        );


    try {

        transactionList.innerHTML = `
            <tr>
                <td colspan="6">
                    Loading transactions...
                </td>
            </tr>
        `;


        const allTransactions =
            await apiRequest(
                "transactions.php"
            );

        transactions =
            allTransactions.filter(
                function (transaction) {

                    return Number(
                        transaction.buyer_id
                    ) === Number(
                        currentUser.user_id
                    );

                }
            );


        renderTransactions(
            transactions
        );


    } catch (error) {

        transactionList.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load transactions.
                </td>
            </tr>
        `;

    }

}


/* DISPLAY TRANSACTIONS */

function renderTransactions(transactionData) {

    const transactionList =
        document.getElementById(
            "transaction-list"
        );


    if (transactionData.length === 0) {

        transactionList.innerHTML = `
            <tr>
                <td colspan="6">
                    No transactions found.
                </td>
            </tr>
        `;

        return;

    }


    transactionList.innerHTML = "";


    transactionData.forEach(
        function (transaction) {

            /* Find inventory record */

            const inventory =
                inventoryMap[
                transaction
                    .requested_inventory_id
                ];


            /* Find book from inventory */

            let bookTitle =
                "Unknown Book";


            if (inventory) {

                const book =
                    bookMap[
                    inventory.book_id
                    ];


                if (book) {

                    bookTitle =
                        book.title;

                }

            }


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${transaction.transaction_id}
                </td>

                <td>
                    ${bookTitle}
                </td>

                <td>
                    ${transaction.transaction_type}
                </td>

                <td>
                    ${formatPrice(
                transaction.amount_paid
            )}
                </td>

                <td>
                    ${transaction.status}
                </td>

                <td class="transaction-action"></td>

            `;


            const actionCell =
                row.querySelector(
                    ".transaction-action"
                );


            /* Allow canceling pending transactions */

            if (
                transaction.status ===
                "Pending"
            ) {

                const cancelButton =
                    document.createElement(
                        "button"
                    );


                cancelButton.textContent =
                    "Cancel";


                cancelButton.addEventListener(
                    "click",
                    function () {

                        cancelTransaction(
                            transaction
                                .transaction_id
                        );

                    }
                );


                actionCell.appendChild(
                    cancelButton
                );

            } else {

                actionCell.textContent =
                    "-";

            }


            transactionList.appendChild(
                row
            );

        }
    );

}


/* CANCEL TRANSACTION */

async function cancelTransaction(
    transactionId
) {

    const confirmed =
        confirm(
            "Are you sure you want to cancel this transaction?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `transactions.php?id=${transactionId}`,
            {

                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        {
                            status:
                                "Cancelled"
                        }
                    )

            }
        );


        alert(
            "Transaction cancelled."
        );


        await loadTransactions();


    } catch (error) {

        alert(
            "Unable to cancel transaction.\n\n" +
            error.message
        );

    }

}


/* REFUND REQUEST */

async function submitRefund(event) {

    event.preventDefault();


    const transactionId =
        document
            .getElementById(
                "refund-transaction-id"
            )
            .value;


    const customerId =
        currentUser
            ? currentUser.user_id
            : document
                .getElementById(
                    "customer-id"
                )
                .value;


    const reason =
        document
            .getElementById(
                "refund-reason"
            )
            .value
            .trim();


    const refundData = {

        transaction_id:
            Number(transactionId),

        customer_id:
            Number(customerId),

        reason:
            reason,

        status:
            "Pending"

    };


    try {

        await apiRequest(
            "refund_request.php",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        refundData
                    )

            }
        );


        alert(
            "Refund request submitted!"
        );


        document
            .getElementById(
                "refund-form"
            )
            .reset();


    } catch (error) {

        alert(
            "Unable to submit refund.\n\n" +
            error.message
        );

    }

}


/* SUBMIT REPORT */

async function submitReport(event) {

    event.preventDefault();


    const submittedBy =
        currentUser
            ? currentUser.user_id
            : document
                .getElementById(
                    "submitted-by"
                )
                .value;


    const category =
        document
            .getElementById(
                "report-category"
            )
            .value;


    const relatedEntity =
        document
            .getElementById(
                "related-entity"
            )
            .value;


    const details =
        document
            .getElementById(
                "report-details"
            )
            .value
            .trim();


    /* form_data can contain JSON */

    const reportData = {

        submitted_by_id:
            Number(submittedBy),

        report_category:
            category,

        related_entity_type:
            relatedEntity,

        form_data: {
            details:
                details
        },

        status:
            "Pending"

    };


    try {

        await apiRequest(
            "reports.php",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        reportData
                    )

            }
        );


        alert(
            "Report submitted successfully!"
        );


        document
            .getElementById(
                "report-form"
            )
            .reset();


    } catch (error) {

        alert(
            "Unable to submit report.\n\n" +
            error.message
        );

    }

}


/* EVENT LISTENERS */

/* Initialize event handlers when page loads */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCurrentUser();

        if (!requireAuthenticatedCustomer()) {
            return;
        }

        updateAuthStatusUI();

        applyCurrentUserToForms();


        /* SEARCH */

        const searchForm =
            document.getElementById(
                "search-form"
            );


        searchForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                filterBooks();

            }
        );


        /* Filter on dropdown change */

        document
            .getElementById(
                "filter-type"
            )
            .addEventListener(
                "change",
                filterBooks
            );


        document
            .getElementById(
                "filter-condition"
            )
            .addEventListener(
                "change",
                filterBooks
            );


        /* Filter as user types */

        document
            .getElementById(
                "search-book"
            )
            .addEventListener(
                "input",
                filterBooks
            );


        /* LIST BOOK */

        document
            .getElementById(
                "list-book-form"
            )
            .addEventListener(
                "submit",
                submitBookListing
            );


        /* REFUND */

        document
            .getElementById(
                "refund-form"
            )
            .addEventListener(
                "submit",
                submitRefund
            );


        /* REPORT */

        document
            .getElementById(
                "report-form"
            )
            .addEventListener(
                "submit",
                submitReport
            );


        /* INITIAL DATA */

        /* Load books and transactions on page open */

        loadBooks()
            .then(function () {

                loadTransactions();

            });

        loadCategories();

    }
);