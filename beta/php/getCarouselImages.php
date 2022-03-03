<?php

   include('settings.php');
   $pdo = pdoConn();

   $limit = $_GET['limit'];
   $pageContext = $_GET['pageContext'];

   //$cmd = $pdo->query("select * from VwCarouselImages where (Orientation='L') and (RootFolder='". $rootFolder ."') order by rand() limit ". $limit);
   $cmd = $pdo->query("select * from VwCarouselImages where Width > Height and RootFolder='". $pageContext ."' order by rand() limit ". $limit);

   $results = $cmd->fetchAll();

   $pdo = null;
   $cmd = null;

   echo json_encode($results);

?>