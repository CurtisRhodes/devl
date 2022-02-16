<?php

   include('settings.php');
   $pdo = pdoConn();

   $startFolder = $_GET['startFolder'];

   $cmd = $pdo->query("select Id, Parent, FolderName from CategoryFolder where Id = " . $startFolder);

   $folder = $cmd->fetch();
   
   $results = json_encode($folder);

   $parentId = $_POST('Parent');

    echo json_encode($parentId);

    /*

   while( $parentId > -1) {

		$cmd = $pdo->query("select * from CategoryFolder where Id = " . $parentId);
	   $folder = $cmd->fetch();

      $results += json_encode($folder);

      $parentId += json_encode($folder).Id;

   }

      

      echo json_encode($results);
   */

   $pdo = null;
?>