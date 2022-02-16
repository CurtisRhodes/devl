<?php

include('wysiwyg.php');
$pdo = pdoConn();

$commentType = $_GET['commentType'];

$cmd = $pdo->query("select * from BlogEntry where CommentType='".$commentType."'");

$results = $cmd->fetchAll();

$cmd = null;
$pdo = null;
	
echo json_encode($results);

?>