<?php

   include('settings.php');
   $pdo = pdoConn();

   $folderId = $_GET['folderId'];

   $cmd = $pdo->query("SELECT * FROM VwLinks WHERE FolderId = " . $folderId);

   $pdo = null;

   $results = $cmd->fetchAll();

   echo json_encode($results);

?>