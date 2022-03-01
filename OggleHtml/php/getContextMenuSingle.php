<?php

    include('settings.php');
    $pdo = pdoConn();

    $linkId = $_GET['linkId'];

    $sql = 'select p.FolderName as ParentFolderName, i.*, f.* from ImageFile i '.
             'join CategoryFolder f on i.FolderId=f.Id join CategoryFolder p on f.Parent=p.Id where i.id ="'.$linkId.'"';

    $cmd = $pdo->query($sql);

    $results = $cmd->fetch();

    $cmd = null;
    $pdo = null;

    echo json_encode($results);

?>