<?php


function pdoConn() {
      $host_name = '64.20.55.234';
      $database = 'st21569_yagdrassel';
      $user_name = 'st21569_webVisitor';
      $password = 'Terry_ecac8432-304a-44be-ac2b-76559b4b0e85';

    try {
    	return new PDO('mysql:host=' . $host_name . ';dbname=' . $database . ';charset=utf8', $user_name, $password);
    } catch (PDOException $exception) {
    	// If there is an error with the connection, stop the script and display the error.
    	exit('Failed to connect to database!');
    }
}

?>




