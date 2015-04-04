<?php
// Script to connect us to database, for use on other pages
// mostly borrowed from class wiki example
$mysqli = new mysqli('localhost','calAdmin','calAdmin','calendar');

if($mysqli->connect_errno) {
	echo json_encode(array(
						"success" => false,
						"message" => "Connection to Events Database failed.",
						));
						exit;
						}

?>