<?php

try
{
    include('yagdrassel.php');
    $pdo = pdoConn();

    $folderId = $_GET['folderId'];
    $path = $_GET['path'];

    $cmd = $pdo->query("select * from CategoryFolder where Id=".$folderId);
    $catRow = $cmd->fetch();

    $cmd = $pdo->query("select * from CategoryFolder where Parent=".$folderId);
    $childRows = $cmd->fetchAll();

    $key = array_search('what are you Jewish ', $childRows);



//
//    $path = "../../danni/" . $catRow.FolderPath;

    $files = preg_grep('/^([^.])/', scandir($path));

    $results = [];
    foreach ($files as $file) {
        if ( is_dir($file) ) {

        //$thisChild = array_search($file, array_column($childRows, 'FolderName'));

        $results[] = ['name' => $file,'type' => 'dir','folderId' => $key', 'path' => '$thisChild.FolderPath'];
        
        }
        else{
           $results[] = ['name' => $file,'type' => 'file','folderId' => $key];
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
