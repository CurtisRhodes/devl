<?php

function pdoConn() {
      $host_name = '64.20.55.234';
      $database = 'st21569_wysiwyg';
      $user_name = 'st21569_wysiwyg';
      $password = 'Swan_0075cea3-2316-42c7-ba30-a7f22641f197.jpg';

    try {
    	return new PDO('mysql:host=' . $host_name . ';dbname=' . $database . ';charset=utf8', $user_name, $password);
    } catch (PDOException $exception) {
    	// If there is an error with the connection, stop the script and display the error.
    	exit('Failed to connect to database!');
    }
}

?>




