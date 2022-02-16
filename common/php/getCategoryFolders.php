<?php
 <?php
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, GET, DELETE, PUT, PATCH, OPTIONS');
        header('Access-Control-Allow-Headers: token, Content-Type');
        header('Access-Control-Max-Age: 1728000');
        header('Content-Length: 0');
        header('Content-Type: text/plain');
        die();
    }

    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');


include('oggleConn.php');

$pdo = pdoConn();

$whereClause = $_GET['whereClause'];

$cmd = $pdo->query("select * from CategoryFolder " . $whereClause);

//$results = $cmd->fetchAll('PDO::FETCH_ASSOC');

$results = $cmd->fetchAll();

$pdo = null;

echo json_encode($results);

?>