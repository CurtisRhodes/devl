<?php

include('settings.php');
$pdo = pdoConn();

$query = $_GET['query'];

$cmd = $pdo->query($_GET['query']);

$result = $cmd->fetch();

$cmd = null;
$pdo = null;

echo json_encode($result);

?>