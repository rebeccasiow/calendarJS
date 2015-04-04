<?php
	// After registering, user will be redirected to this page with POST variables set 
	 require('database.php');
	 header("Content-Type: application/json");
	 
	if($_POST['type']=="login") {
		//inserts username and hashed password into newsite.USERS

		$username = $_POST['username'];
		$userpassword = $_POST['password'];
		//$hashedpassword = crypt($userpassword);

		//Checks newsite.USERS table to see if username exists already

		//if not in system, will create a new entry into the USERS table
		$stmt = $mysqli->prepare("select hashedpassword from users where username=?");

		$stmt->bind_param('s', $username);
		 
		$stmt->execute();
		$stmt->store_result();

		if($stmt->num_rows==1) { // since we're searching based on primary key, there can only be 1
			$stmt->bind_result($hashedPassDatabase);
			$stmt->fetch();
			$stmt->close();

			if(crypt($userpassword, $hashedPassDatabase)==$hashedPassDatabase) { // password correct
			
				session_start();
				ini_set("session.cookie_httponly", 1);
				
				$_SESSION['user'] = $username;
				$_SESSION['token'] = substr(md5(rand()), 0, 10);
				
				echo json_encode(array(
						"success" => true,
						"token" => $_SESSION['token']
				));
				exit;
				
			} else { // password incorrect
				echo json_encode(array(
						"success" => false,
						"message" => "Incorrect password"
				));
				exit;
			}
			
		}
		else{	
			echo json_encode(array(
					"success" => false,
					"message" => "Username not found",
			));
			exit;
		}

		//if($_SESSION['token'] !== $_POST['token']){
		//	die("Request forgery detected");
		//}
		//$mysqli->query(/* perform transfer */);
	} else if($_POST['type']=="logout") {
		session_start();
		ini_set("session.cookie_httponly", 1);
		session_destroy();
		echo json_encode(array(
			"success" => true
		));
	}


?>