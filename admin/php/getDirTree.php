<?php

   include('settings.php');
   $pdo = pdoConn();

    try {
       $cmd = $pdo->query("select * from VwDirTree order by Id");
    } catch (PDOException $exception) {
    	// If there is an error with the connection, stop the script and display the error.
    	exit('error: '+ $exception);
    }

   $pdo = null;

   $results = $cmd->fetchAll();

   echo json_encode($results);

?>