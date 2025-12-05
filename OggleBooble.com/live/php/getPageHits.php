<?php

    include('getConnection.php');
    $conn = pdoConn('oggleboo_Stats');

   $pageId = $_GET['pageId'];

   $cmd = $conn->query("select count(*) hits from PageHit where PageId=".$pageId);
   $curPageHits = $cmd->fetch()[hits];

   $cmd = $conn->query("select Hits from FolderPageHit where PageId=".$pageId);
   $histPageHits = $cmd->fetch()[Hits];
      
   echo (int)$curPageHits + (int)$histPageHits;

   $conn = null;
?>


