<?php

    include('settings.php');
    $pdo = pdoConn();

    $searchString = $_GET['searchString'];
    $searchMode = $_GET['searchMode'];

    if($searchMode = 'startsWith') {
        $cmd = $pdo->query('select f.Id, p.FolderName as ParentName, f.FolderName from CategoryFolder f '.
                ' join CategoryFolder p on f.Parent = p.Id '.
                ' where f.FolderName like "'.$searchString.'%" and f.FolderType != "singleChild"');
    }
    if($searchMode = 'contains') {
        $cmd = $pdo->query('select f.Id, p.FolderName as ParentName, f.FolderName from CategoryFolder f '.
                ' join CategoryFolder p on f.Parent = p.Id '.
                ' where f.FolderName like "%'.$searchString.'%" and not like"'.$searchString.'%'" and f.FolderType != "singleChild"');
    }

    $results = $cmd->fetchAll();

    echo json_encode($results);

?>



