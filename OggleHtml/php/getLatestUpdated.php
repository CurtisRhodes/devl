<?php

   include('settings.php');
   $pdo = pdoConn();

   $spaType = $_GET['spaType'];

   $limit = $_GET['limit'];
         
   call spLatestTouchedGalleries(); 


   if($spaType == 'playboy'){
       $cmd = $pdo->query("select * from LatestTouchedGalleries ". 
       "where ((RootFolder = 'playboy') or (RootFolder = 'centerfold') or (RootFolder = 'cybergirl')) limit .$limit ");
   }
   if($spaType == 'porn'){
       $cmd = $pdo->query("select * from LatestTouchedGalleries ". 
       "where ((RootFolder = 'playboy') or (RootFolder = 'centerfold') or (RootFolder = 'cybergirl'))");
   }


   $results = $cmd->fetchAll();

   $pdo = null;
   echo json_encode($results);

?>