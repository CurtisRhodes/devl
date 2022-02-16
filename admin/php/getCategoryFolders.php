<?php

include('settings.php');
$pdo = pdoConn();

$whereClause = $_GET['whereClause'];

$cmd = $pdo->query("select * from CategoryFolder " . $whereClause);

//$results = $cmd->fetchAll('PDO::FETCH_ASSOC');

$results = $cmd->fetchAll();

$pdo = null;

echo json_encode($results);

?>