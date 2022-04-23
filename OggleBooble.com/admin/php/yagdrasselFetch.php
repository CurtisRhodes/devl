<?php

include('yagdrassel.php');
$pdo = pdoConn();

$query = $_GET['query'];

$cmd = $pdo->query($_GET['query']);

$result = $cmd->fetch();

$pdo = null;

echo json_encode($result);

?>