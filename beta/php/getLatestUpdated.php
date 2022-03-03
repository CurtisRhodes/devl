<?php

   include('settings.php');
   $pdo = pdoConn();

   $spaType = $_GET['spaType'];

   $limit = $_GET['limit'];

	try{         
	   $p = $pdo->query('CALL spLatestTouchedGalleries()');
	   $p->setFetchMode(PDO::FETCH_ASSOC);
	}  
	catch (PDOException $e) {
		die("Error occurred:" . $e->getMessage());
	}

   $cmd = $pdo->query("select * from LatestTouchedGalleries where RootFolder = '".$spaType."' order by Acquired desc"); 

   $results = $cmd->fetchAll();

   $pdo = null;
   echo json_encode($results);

?>