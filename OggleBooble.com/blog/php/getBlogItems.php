<?php

	include('wysiwyg.php');
	$pdo = pdoConn();

	$commentType = $_GET['commentType'];

	$cmd = $pdo->query("select * from BlogComment where CommentType='".$commentType."'");

	$results = $cmd->fetchAll();

	$pdo = null;
	
	echo json_encode($results);

?>