<?php

/*
    ============================================================
    LIBROWSE BOOK EXCHANGE
    XML Book Feed
    ============================================================

    This file gets book information from MySQL
    and returns it in XML format.

    It does NOT replace our existing JSON API.
*/


/*
    Connect to the existing project database.

    bootstrap.php already loads:
    - database.php
    - PDO connection
    - other backend files
*/
require_once __DIR__ . '/../lib/bootstrap.php';


/*
    Tell the browser that this page returns XML
    instead of normal HTML or JSON.
*/
header('Content-Type: application/xml; charset=UTF-8');


/*
    This function safely converts special characters
    into XML-friendly characters.

    Example:

    & becomes &amp;
    < becomes &lt;
*/
function xmlEscape($value)
{
    return htmlspecialchars(
        (string) $value,
        ENT_XML1 | ENT_QUOTES,
        'UTF-8'
    );
}


try {

    /*
        Retrieve book listing information.

        We combine:

        USER_BOOKS
        BOOKS_CATALOG
        BOOK_CATEGORIES
        USER

        so the XML contains useful information.
    */
    $sql = "
        SELECT

            ub.inventory_id,
            ub.book_id,
            ub.seller_id,
            ub.listing_type,
            ub.price,
            ub.condition,
            ub.status,
            ub.listed_at,

            bc.title,
            bc.author,
            bc.isbn,

            cat.category_name,

            u.username AS seller_name

        FROM USER_BOOKS ub

        INNER JOIN BOOKS_CATALOG bc
            ON ub.book_id = bc.book_id

        INNER JOIN BOOK_CATEGORIES cat
            ON bc.category_id = cat.category_id

        INNER JOIN USER u
            ON ub.seller_id = u.user_id

        ORDER BY ub.inventory_id ASC
    ";


    /*
        Send the SQL command to MySQL.
    */
    $statement = $pdo->query($sql);


    /*
        Retrieve all matching records.
    */
    $books = $statement->fetchAll();


    /*
        Start the XML document.

        XML documents normally begin with:

        <?xml version="1.0" encoding="UTF-8"?>
    */
    echo '<?xml version="1.0" encoding="UTF-8"?>';


    /*
        Main/root XML element.
    */
    echo '<librowse>';


    /*
        Information about the XML feed.
    */
    echo '<information>';

    echo '<system>';
    echo 'Librowse Book Exchange';
    echo '</system>';

    echo '<format>';
    echo 'XML';
    echo '</format>';

    echo '<total_books>';
    echo count($books);
    echo '</total_books>';

    echo '</information>';


    /*
        Container for all book listings.
    */
    echo '<books>';


    /*
        Loop through each database record.
    */
    foreach ($books as $book) {

        /*
            Start one <book> element.

            inventory_id is stored as an attribute.

            Example:

            <book inventory_id="1">
        */
        echo '<book inventory_id="' .
            xmlEscape($book['inventory_id']) .
            '">';


        echo '<book_id>';
        echo xmlEscape($book['book_id']);
        echo '</book_id>';


        echo '<title>';
        echo xmlEscape($book['title']);
        echo '</title>';


        echo '<author>';
        echo xmlEscape($book['author']);
        echo '</author>';


        echo '<isbn>';
        echo xmlEscape($book['isbn']);
        echo '</isbn>';


        echo '<category>';
        echo xmlEscape($book['category_name']);
        echo '</category>';


        echo '<seller>';

        echo '<seller_id>';
        echo xmlEscape($book['seller_id']);
        echo '</seller_id>';

        echo '<seller_name>';
        echo xmlEscape($book['seller_name']);
        echo '</seller_name>';

        echo '</seller>';


        echo '<listing_type>';
        echo xmlEscape($book['listing_type']);
        echo '</listing_type>';


        /*
            A trade-only book may have no price.

            Instead of returning nothing,
            we return 0.00.
        */
        echo '<price>';

        if ($book['price'] === null) {

            echo '0.00';

        } else {

            echo xmlEscape($book['price']);

        }

        echo '</price>';


        echo '<condition>';
        echo xmlEscape($book['condition']);
        echo '</condition>';


        echo '<status>';
        echo xmlEscape($book['status']);
        echo '</status>';


        echo '<listed_at>';
        echo xmlEscape($book['listed_at']);
        echo '</listed_at>';


        /*
            Close one book record.
        */
        echo '</book>';

    }


    /*
        Close books container.
    */
    echo '</books>';


    /*
        Close root element.
    */
    echo '</librowse>';


} catch (PDOException $error) {

    /*
        If MySQL encounters an error,
        still return valid XML.
    */

    http_response_code(500);


    echo '<?xml version="1.0" encoding="UTF-8"?>';

    echo '<error>';

    echo '<message>';
    echo 'Unable to retrieve book information.';
    echo '</message>';

    echo '</error>';

}

?>
