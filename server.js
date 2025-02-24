import mysql from 'mysql';
import config from './config.js';
import fetch from 'node-fetch';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import response from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, "client/build")));


app.post('/api/loadUserSettings', (req, res) => {

	let connection = mysql.createConnection(config);
	let userID = req.body.userID;

	let sql = `SELECT mode FROM user WHERE userID = ?`;
	console.log(sql);
	let data = [userID];
	console.log(data);

	connection.query(sql, data, (error, results, fields) => {
		if (error) {
			return console.error(error.message);
		}

		let string = JSON.stringify(results);
		//let obj = JSON.parse(string);
		res.send({ express: string });
	});
	connection.end();
});

app.post("/api/users/search", (req, res) => {
	let connection = mysql.createConnection(config);
  
	const { skill, timeAvailability } = req.body;
  
	// Build dynamic SQL query based on user input
	let sql = "SELECT * FROM users WHERE 1=1";
	const values = [];
  
	if (skill) {
	  sql += " AND skill LIKE ?";
	  values.push(`%${skill}%`);
	}
  
	if (timeAvailability) {
	  sql += " AND time_availability LIKE ?";
	  values.push(`%${timeAvailability}%`);
	}
  
	connection.query(sql, values, (error, results) => {
	  if (error) {
		console.error("Error executing query:", error.message);
		return res.status(500).json({ error: "Database query error" });
	  }
  
	  // Convert results to JSON and send response
	  let string = JSON.stringify(results);
	  let obj = JSON.parse(string);
	  console.log(obj); // Optionally log the results
	  res.send(obj); // Send the results to the client
	});
  
	connection.end();
  });
  
 
//   app.post("/api/register", async (req, res) => {
// 	const { firebase_uid, email } = req.body;
// 	try {
// 	  await pool.query("INSERT INTO users (firebase_uid, email) VALUES (?, ?)", [firebase_uid, email]);
// 	  res.json({ message: "User registered successfully!" });
// 	} catch (error) {
// 	  res.status(500).json({ error: error.message });
// 	}
//   });

// Register User After Firebase Signup
app.post('/api/register', async (req, res) => {
	const { firebase_uid, email } = req.body;
  
	// Validate Required Fields
	if (!firebase_uid || !email) {
	  return res.status(400).json({ error: "Missing required fields (email, firebase_uid)" });
	}
  
	// Create MySQL Connection (as required)
	const connection = mysql.createConnection(config);
  
	connection.connect((err) => {
	  if (err) {
		console.error("MySQL Connection Error:", err.message);
		return res.status(500).json({ error: "Failed to connect to database" });
	  }
  
	  // Insert with NULL for optional fields
	  const sql = `
		INSERT INTO users (firebase_uid, email, name, skill, location, time_availability, years_of_experience, password)
		VALUES (?, ?, NULL, NULL, NULL, NULL, NULL, NULL)
	  `;
  
	  connection.query(sql, [firebase_uid, email], (error, result) => {
		connection.end(); // Close connection after query execution
		if (error) {
		  console.error("Error inserting user:", error.message);
		  return res.status(500).json({ error: "Database insertion failed" });
		}
		res.status(201).json({ message: "User registered successfully!", userId: result.insertId });
	  });
	});
  });


app.listen(port, () => console.log(`Listening on port ${port}`)); //for the dev version
//app.listen(port, '172.31.31.77'); //for the deployed version, specify the IP address of the server
