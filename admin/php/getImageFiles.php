<?php

   include('yagdrassel.php');
   $pdo = pdoConn();

    try 
    {
        $folderId = $_GET['folderId'];

        $cmd = $pdo->query("select * from ImageFile where FolderId=". $folderId);

    } catch (PDOException $exception) {
    	exit('error: '+ $exception);
    }

   $pdo = null;

   $results = $cmd->fetchAll();

   echo json_encode($results);

?>