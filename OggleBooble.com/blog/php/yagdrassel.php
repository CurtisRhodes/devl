<?php

function pdoConn() {
     $host_name = 'da100.is.cc';
     $database = 'oggleboo_yagdrassel';
     $user_name = 'oggleboo_yagdrassel';
     $password = 'Terry_ecac8432-304a-44be-ac2b-76559b4b0e85';

    try {
    	return new PDO('mysql:host=' . $host_name . ';dbname=' . $database . ';charset=utf8', $user_name, $password);
    } catch (PDOException $exception) {
    	// If there is an error with the connection, stop the script and display the error.
    	exit('Failed to connect to database!');
    }
}

?>




