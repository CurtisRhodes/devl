<?php

   include('settings.php');
   $pdo = pdoConn();

   $spaType = $_GET['spaType'];

   $limit = $_GET['limit'];
         
   //$cmd = $pdo->query("select * from VwLatestUpdateGalleries where RootFolder='boobs' limit 10");
   $cmd = $pdo->query("select * from VwLatestUpdateGalleries where RootFolder='" . $spaType . "' limit " . $limit);
   //$cmd = $pdo->query("SELECT * FROM VwLatestUpdateGalleries");
   $pdo = null;

   $results = $cmd->fetchAll();

   echo json_encode($results);

?>