<?php
try
{    
    $dataBase = $_GET['schema'];
    include('getConnection.php');
    $conn = pdoConn($dataBase);

    $query = $_GET['query'];

    $cmd = $conn->query($query);
        
    $result = $cmd->fetch(PDO::FETCH_ASSOC);

    echo json_encode($result);
}
catch(Exception $e) {
    echo $e->getMessage();
}
finally {
    $cmd = null;
}
?>