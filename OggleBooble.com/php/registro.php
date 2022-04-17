<?php
function pdoConn() {

     $host_name = 'da100.is.cc';
     $database = 'oggleboo_registo';
     $user_name = 'oggleboo_registo';
     $password = 'Terry_ecac8432-304a-44be-ac2b-76559b4b0e85';

    try {
    	return new PDO('mysql:host='.$host_name.';dbname='.$database.';charset=utf8', $user_name, $password);

    } catch (PDOException $exception) {
    	exit('Failed to connect to registro: '.$exception);
    }
}
?>
