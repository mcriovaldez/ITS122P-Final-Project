/* LIBROWSE BOOK EXCHANGE - Main JavaScript */


/* BACK-END LOCATION */

/*
   HTML Live Preview runs separately from PHP.
   PHP back-end will run at: http://127.0.0.1:8000/
   API files: book-marketplace-backend/api/
*/
const API_BASE =
    "http://127.0.0.1:8000/book-marketplace-backend/api";


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

    try {

        const response = await fetch(url, options);

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

        console.error(
            "API Error:",
            error
        );

        throw error;

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
                <td colspan="9">
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
                <td colspan="9">
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
                <td colspan="9">
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


                /* Book must pass all filters */

                return (
                    matchesSearch &&
                    matchesType &&
                    matchesCondition
                );

            }
        );


    renderBooks(filtered);

}


/* LIST A BOOK */

async function submitBookListing(event) {

    /* Prevent page refresh on submit */

    event.preventDefault();


    const bookId =
        document
            .getElementById("book-id")
            .value;


    const sellerId =
        document
            .getElementById("seller-id")
            .value;


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


    /* Build listing object for API */

    const listingData = {

        book_id:
            Number(bookId),

        seller_id:
            Number(sellerId),

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


    try {

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


/* BUY A BOOK */

async function buyBook(listing) {

    /* TODO: Replace with authenticated user ID */

    const buyerId =
        prompt(
            "Enter your Customer User ID:"
        );


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

    const buyerId =
        prompt(
            "Enter your Customer User ID:"
        );


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


        transactions =
            await apiRequest(
                "transactions.php"
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
        document
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
        document
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

    }
);