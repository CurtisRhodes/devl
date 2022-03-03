<?php

   include('settings.php');
   $pdo = pdoConn();

   $folderId = $_GET['folderId'];

   $cmd = $pdo->query("select * from VwDirTree where Parent = " . $folderId." order by SortOrder,FolderName");

   $pdo = null;

   $results = $cmd->fetchAll();

   echo json_encode($results);

?>