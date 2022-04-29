<?php

include('wysiwyg.php');
$pdo = pdoConn();

$blogId = $_GET['blogId'];

$cmd = $pdo->query("select * from BlogComment where Id='".$blogId."'");

$results = $cmd->fetchAll();

$cmd = null;
$pdo = null;
	
echo json_encode($results);

?>