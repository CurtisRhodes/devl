<?php

try
{
    include('yagdrassel.php');
    $pdo = pdoConn();

    $folderId = $_GET['folderId'];
    $path = $_GET['path'];

    $files = preg_grep('/^([^.])/', scandir($path));

    $results = [];
    foreach ($files as $file) {
        if(is_dir($path.'/'.$file)) {
            $cmd = $pdo->query("select * from CategoryFolder where Parent=".$folderId." and substr(FolderPath,CHAR_LENGTH(FolderPath) - LOCATE('/', REVERSE(FolderPath))+2)='".$file."'");
            //$cmd = $pdo->query("select * from CategoryFolder where FolderName = '".$file."'");
            $catRow = $cmd->fetch();

            $results[] = ['name' => $file,'type' => 'dir','folderId' => $catRow[Id]];
        }
        else{
            $results[] = ['name' => $file,'type' => 'file'];
        }
    }
    

    $cmd = null;
    $pdo = null;
    echo json_encode($results);
}
catch(Exception $e) {
  echo 'Error: ' .$e->getMessage();
}

?>
