<?php
function pdoConn() {


    $host_name = '64.20.55.234';
    $database = 'st21569_registro';
    $user = 'st21569_registro';
    $password = '166ca201-3891-435f-9962-eb23e9b8eaa8';

    //$link = new mysqli($host_name, $user_name, $password);
    //$link = new mysqli($host_name, $user_name, $password, $database);

    try {
    	return new PDO('mysql:host='.$host_name.';dbname='.$database.';charset=utf8', $user, $password);
    	//return new PDO('mysql:host='.$host_name.';charset=utf8', $user, $password);

        //return new PDO($dsn, $user, $password);

    } catch (PDOException $exception) {
    	exit('Failed to connect to registro: '.$exception);
    }
}
?>
