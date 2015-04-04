<?php

header("Content-Type: application/json");
//mode checks for whether user wants to create , change or delete events
require ('database.php');

// $_POST["id"] = "2";
// $_POST["mode"] = "view";
// $_POST["date"] = "2015-03-15";
// $_POST["time"] = "20:00:00";
//  $_POST["name"] = "Pi Day!";
//  $_POST["location"] = "BD";

$mode = $_POST["mode"];

	if (!isset($_POST["mode"]) ){

		echo json_encode(array("success" => false,"message" => "Mode not set."));
		exit;
	
	} else { 
	
		session_start();
		ini_set("session.cookie_httponly", 1);
		// Fail if they are not logged in
		if(!isset($_SESSION['user'])) {
			if($mode="view") { // special for view: if they're not logged in, just give them structure of no events
				echo json_encode(array());
				exit;
			}
			echo json_encode(array("success" => false,"message" => "Must be logged in to manipulate events."));
			exit;
		}
		$username = $_SESSION['user'];
		
		// check for request forgery with the CSRF token
		if($_SESSION['token'] !== $_POST['token']){
			echo json_encode(array("success" => false,"message" => "Request Foragery Detected."));
			exit;
		}
		
		if ($mode == "create"){ //if user chooses to create events

			if ((!isset($_POST["date"])) || (!isset($_POST["time"])) || (!isset($_POST["name"])) ){

				echo json_encode(array("success" => false,"message" => "Date, Time and Name not set."));
				exit;
				
			} else {

				$date = $_POST["date"];
				$time = $_POST["time"];
				$name = $_POST["name"];
				$location = null;
				
				if(isset($_POST["location"])){
					$location = $_POST["location"];
				}

				$stmt = $mysqli->prepare("INSERT INTO events(username, date, time, name, location) values (?, ?, ?, ?, ?)");

				if(!$stmt){
					echo json_encode(array("success" => false,"message" => "Data insert failed."));
					exit;
				}
 
				$stmt->bind_param("sssss", $username, $date, $time, $name, $location);
				$stmt->execute();
				$stmt->close();
				
				// We need to send back the id we used (the client can't possibly know what it was)
				// so we make another query
				// Credit: http://stackoverflow.com/questions/13451070/how-to-get-the-value-of-autoincrement-of-last-row-at-the-insert
				$stmt = $mysqli->prepare("select id AS lastId from events where id = @@Identity;");

				if(!$stmt){
					echo json_encode(array("success" => false,"message" => "Add Event Get-Id Query failed."));
					exit;
				}
				$stmt->execute();
				$stmt->bind_result($lastId);
				$stmt->fetch();
				$stmt->close();
				 

				echo json_encode(array("success" => true,"id" => $lastId));
				exit;
			}
		}
		
		//if user wants to view events 

		else if ($mode == "view"){
			
			if(!isset($_POST['start']) || !isset($_POST['end'])) {
				echo json_encode(array("success" => false,"message" => "Start and end dates not supplied in view query"));	//show mysql error? $mysqli->error
				exit;
			}
			
			$start = $_POST['start'];
			$end = $_POST['end'];
			
			$stmt = $mysqli->prepare("SELECT id, date, time, name, location from events where date>=? and date<=? and username = ?");
			if(!$stmt){
				echo json_encode(array("success" => false,"message" => "Query Prep failed."));	//show mysql error? $mysqli->error
				exit;
			}
			$stmt->bind_param("sss",$start,$end,$username);
			$stmt->execute();
			$stmt->bind_result($id, $date, $time, $name, $location);
			$events_array = array();

			while($stmt->fetch()){
				$id = htmlspecialchars($id);
				$date = htmlspecialchars($date);
				$time = htmlspecialchars($time);
				$name = htmlspecialchars($name);
				$location = htmlspecialchars($location);

				array_push($events_array, array(
					"id" =>$id, 
					"date" => $date, 
					"time" => $time, 
					"name" => $name, 
					"location" => $location));
			}
			
			echo json_encode($events_array);
			$stmt->close();
			exit;
		} 

		//if user chooses to modify events
		else if ($mode == "modify"){

			$id = $_POST["id"];
			//$date = $_POST["date"];
			//$time = $_POST["time"];
			//$name =  $_POST["name"];
			//$location = $_POST["location"];

			
			// Make sure the event belongs to the user
			$stmt = $mysqli->prepare("SELECT username from events where id=".$id);
			if(!$stmt){
				echo json_encode(array(
					"success" => false,
					"message" => "Query Prep failed.",						//show mysql error? $mysqli->error
					));
				exit;
			}

			$stmt->bind_result($eventUsername);
			$stmt->execute();
			
			// If this user is not the one who made the event, disallow!
			
			if($eventUsername != $username) {
				echo json_encode(array(
			 		"success" => false,
			 		"message" => "That is not your event",						//show mysql error? $mysqli->error
			 		));
				exit;
			}
			
			
			//for each variable have an if statement with a new prepared statement when the isset is true 
			//bind paramater here with ?

			if (isset($_POST["date"])){
				$date = $_POST["date"];
				$stmt = $mysqli->prepare("UPDATE events SET date=? WHERE id = $id");
				
				if(!$stmt){
					echo json_encode(array("success" => false,"message" => "Modifying Date Query Prep Failed."));
					exit;
				}
				
				$stmt->bind_param("s",$date);

				if(!$stmt){
					echo json_encode(array(
						"success" => false,
						"message" => "Date Update Event failed.",									//show mysql error? $mysqli->error
						));
						exit;
					}

				$stmt->execute();
				$stmt->close();
				//echo json_encode(array(
				//	"success-update date" => true,
				//	));
				//	exit;
			}

			if (isset($_POST["time"]) ){
				$time = $_POST["time"];
				$stmt = $mysqli->prepare("UPDATE events SET time=? WHERE id = $id");
				
				if(!$stmt){
					echo json_encode(array("success" => false,"message" => "Modifying Time Query Prep Failed."));
					exit;
				}
				
				$stmt->bind_param("s",$time);

				if(!$stmt){
					echo json_encode(array(
						"success" => false,
						"message" => "Time Update Event failed.",									//show mysql error? $mysqli->error
						));
						exit;
					}
				$stmt->execute();
				$stmt->close();
				//echo json_encode(array(
				//	"success-time update" => true,
				//	));
				//	exit;
			}

			if (isset($_POST["name"]) ){
				$name = $_POST["name"];
				$stmt = $mysqli->prepare("UPDATE events SET name=? WHERE id = $id");
				
				if(!$stmt){
					echo json_encode(array("success" => false,"message" => "Modifying Name Query Prep Failed."));
					exit;
				}
				
				$stmt->bind_param("s",$name);

				if(!$stmt){
					echo json_encode(array(
						"success" => false,
						"message" => "Name Update Event failed.",									//show mysql error? $mysqli->error
						));
					exit;
				}
			
				$stmt->execute();
				$stmt->close();
				//echo json_encode(array(
				//	"success-name" => true,
				//	));
				//	exit;

			}

			if (isset($_POST["location"]) ){
				$location = $_POST["location"];
				$stmt = $mysqli->prepare("UPDATE events SET location=? WHERE id = $id");
				
				if(!$stmt){
					echo json_encode(array("success" => false,"message" => "Modifying Location Query Prep Failed."));
					exit;
				}
				
				$stmt->bind_param("s",$location);

				if(!$stmt){
					echo json_encode(array(
						"success" => false,
						"message" => "Date Update Event failed.",									//show mysql error? $mysqli->error
						));
					exit;
				}
				
				$stmt->execute();
				$stmt->close();
				//echo json_encode(array(
				//"success-location" => true,
				//));
				//exit;
				
			}
			
			// We've done all the parts, so if it hasn't failed yet, modification succeeded
			echo json_encode(array("success" => true));
			exit;
		}

		//delete event entry
		else if ($mode == "delete"){
		
			$id = $_POST["id"];

			// Make sure the event belongs to the user
			$stmt = $mysqli->prepare("SELECT username from events where id=".$id);
			if(!$stmt){
				echo json_encode(array(
					"success" => false,
					"message" => "Query Prep failed.",						//show mysql error? $mysqli->error
					));
				exit;
			}

			$stmt->bind_result($eventUsername);
			$stmt->execute();
			
			// If this user is not the one who made the event, disallow!
			if($eventUsername != $username) {
				echo json_encode(array(
			 		"success" => false,
			 		"message" => "That is not your event",						//show mysql error? $mysqli->error
			 		));
				exit;
			}
			
			$stmt = $mysqli->prepare("DELETE FROM events WHERE id=$id");
			if(!$stmt){
				echo json_encode(array(
					"success" => false,
					"message" => "Entry Deletion failed.",									//show mysql error? $mysqli->error
					));
				exit;
			}

			$stmt->execute(); 				
			$stmt->close();
			echo json_encode(array(
					"success" => true,
					));
			exit;

		}
	}

	


?>