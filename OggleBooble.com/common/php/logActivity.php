<?php

include('hitCounterConn.php');
$pdo = pdoConn();

$eventCode = $_GET['eventCode'];
$folderId = $_GET['folderId'];
$eventDetail = $_GET['eventDetail'];
$calledFrom = $_GET['calledFrom'];
$visitorId = $_GET['visitorId'];

$cmd = $pdo->query("insert into eventlog values($eventCode.,.$folderId.,.$eventDetail.,.$calledFrom.,.$visitorId.,.now());

$if(cmd->exec($sql)==1)
{ echo "New record created successfully";} 
else 
{ echo "Error: " . $sql . "<br>" . $cmd->error;}

$cmd->close();
$pdo = null;
?>