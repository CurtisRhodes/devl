<?php

    $host_name = 'db5006287599.hosting-data.io';
    $database = 'dbs5250893';
    $user_name = 'dbu50024';
    $password = 'Larimore_311d496b-6e28-4231-a1f8-09c3941a6c8f.jpg';
    $link = new mysqli($host_name, $user_name, $password, $database);

    if ($link->connect_error) {
    die('<p>Failed to connect to MySQL: '. $link->connect_error .'</p>');
    } else {
    echo '<p>Connection to MySQL server successfully established.</p>';
    }

/*
include('hitCounterConn.php');
$pdo = pdoConn();

$ipAddress = $_GET['ipAddress'];

$cmd = $pdo->query('select * from Visitor where ipAddress="'.$ipAddress.'"');

$pdo = null;

 echo "ok";
 */
?>
