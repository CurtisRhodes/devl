﻿<?php

include('yagdrassel.php');
$pdo = pdoConn();

$query = $_GET['query'];

$cmd = $pdo->query($_GET['query']);

$results = $cmd->fetchAll();

$cmd = null;
$pdo = null;

echo json_encode($results);

?>