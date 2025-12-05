<?php
try
{
    include('getConnection.php');
    $pdo = pdoConn('oggleboo_Danni');

    $imageId = $_GET['imageId'];
    $cmd = $pdo->query("select Id from ImageFile where Id='".$imageId."'");

    $result = $cmd->fetch()[Id];

    echo $result != "";
}
catch(Exception $e) {
  echo 'Error: ' .$e->getMessage();
}
?>
