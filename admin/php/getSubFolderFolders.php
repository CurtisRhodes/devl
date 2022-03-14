<?php

include('settings.php');
$pdo = pdoConn();

$rootFolderId = $_GET['rootFolderId'];

$cmd = $pdo->query('select Parent, Id, substr(FolderPath,char_length(FolderPath) - locate("/", reverse(FolderPath))+2) as FolderName from CategoryFolder where Parent='.$rootFolderId;

$results = $cmd->fetchAll();

$cmd = null;
$pdo = null;

echo json_encode($results);

?>