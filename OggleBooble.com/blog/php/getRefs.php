<?php

include('wysiwyg.php');
$pdo = pdoConn();

$refType = $_GET['refType'];

$cmd = $pdo->query("select RefCode, Description from Ref where Reftype='".$refType."' order by Description");

$results = $cmd->fetchAll();

$cmd = null;
$pdo = null;
	
echo json_encode($results);

?>