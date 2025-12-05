
<?php
try
{    
    $dataBase = $_GET['schema'];
    include('getConnection.php');
    $conn = pdoConn($dataBase);

    $query = $_GET['query'];

    $cmd = $conn->query($_GET['query']);
        
    $results = $cmd->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($results);
}
catch(Exception $e) {
    echo $e->getMessage();
}
finally {
    $cmd = null;
    $pdo = null;
}
?>