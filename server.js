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
const db = mysql.createConnection(config);

db.connect((err) => {
	if (err) {
	  console.error('Error connecting to the database:', err.stack);
	  return;
	}
	console.log('Connected to the MySQL database');
  });
  
  // Initialize router
const router = express.Router();
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

  // Send an invite
app.post("/api/invites/send", (req, res) => {
	const { sender_id, receiver_id } = req.body;
  
	if (!sender_id || !receiver_id) {
	  return res.status(400).json({ error: "Missing sender or receiver ID" });
	}
  
	const sql = "INSERT INTO invites (sender_id, receiver_id, status) VALUES (?, ?, 'pending')";
	connection.query(sql, [sender_id, receiver_id], (err, result) => {
	  if (err) {
		console.error("Error sending invite:", err.message);
		return res.status(500).json({ error: "Database error" });
	  }
	  res.status(201).json({ message: "Invite sent successfully!" });
	});
  });
  
  // Fetch all matches (pending & accepted)
  app.get("/api/matches", (req, res) => {
	const { user_id } = req.query;
  
	if (!user_id) {
	  return res.status(400).json({ error: "Missing user ID" });
	}
  
	const sql = `
	  SELECT i.id, u.name AS sender_name, u.skill, u.time_availability, i.status
	  FROM invites i
	  JOIN users u ON i.sender_id = u.id
	  WHERE i.receiver_id = ? AND (i.status = 'pending' OR i.status = 'accepted')
	`;
  
	connection.query(sql, [user_id], (err, results) => {
	  if (err) {
		console.error("Error fetching matches:", err.message);
		return res.status(500).json({ error: "Database error" });
	  }
  
	  const pending = results.filter((invite) => invite.status === "pending");
	  const accepted = results.filter((invite) => invite.status === "accepted");
  
	  res.json({ pending, accepted });
	});
  });
  
  // Accept an invite
  app.post("/api/matches/accept", (req, res) => {
	const { inviteId } = req.body;
  
	if (!inviteId) {
	  return res.status(400).json({ error: "Missing invite ID" });
	}
  
	const sql = "UPDATE invites SET status = 'accepted' WHERE id = ?";
	connection.query(sql, [inviteId], (err) => {
	  if (err) {
		console.error("Error accepting invite:", err.message);
		return res.status(500).json({ error: "Database error" });
	  }
	  res.json({ message: "Invite accepted successfully!" });
	});
  });
  
  // Reject an invite
  app.post("/api/matches/reject", (req, res) => {
	const { inviteId } = req.body;
  
	if (!inviteId) {
	  return res.status(400).json({ error: "Missing invite ID" });
	}
  
	const sql = "DELETE FROM invites WHERE id = ?";
	connection.query(sql, [inviteId], (err) => {
	  if (err) {
		console.error("Error rejecting invite:", err.message);
		return res.status(500).json({ error: "Database error" });
	  }
	  res.json({ message: "Invite rejected successfully!" });
	});
  });


  // GET all posts (most recent first)
router.get('/api/posts', (req, res) => {
	const sql = 'SELECT * FROM posts ORDER BY created_at DESC';
	db.query(sql, (err, results) => {
	  if (err) return res.status(500).json({ error: 'Error fetching posts' });
	  res.json(results);
	});
  });
  
  app.post('/api/posts', (req, res) => {
    let connection = mysql.createConnection(config);
    const { user_id, title, content, tag, name } = req.body;
    
    let sql = 'INSERT INTO posts (user_id, title, content, tag, author) VALUES (?, ?, ?, ?, ?)';
    let data = [user_id, title, content, tag, name];

    connection.query(sql, data, (error) => {
        if (error) {
            console.error('Error adding post:', error);
            res.status(500).send('Error adding post');
        } else {
            res.status(200).send('Post added successfully');
        }
        connection.end();  // Ensure connection closes properly
    });
});

router.get('/api/posts', (req, res) => {
    const sql = 'SELECT id, user_id, title, content, tag, name, created_at FROM posts ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching posts' });
        res.json(results);
    });
});
  
  app.post('/api/loadUserSettings', (req, res) => {
    const userID = req.body.userID; // Get userID from request body

    const sql = `SELECT mode FROM user WHERE userID = ?`;
    const data = [userID];

    db.query(sql, data, (error, results) => {
        if (error) {
            console.error('Error fetching user settings:', error.message);
            return res.status(500).json({ error: 'Error fetching user settings' });
        }

        res.json(results);
    });
});

app.use(router);

app.listen(port, () => console.log(`Listening on port ${port}`)); //for the dev version
//app.listen(port, '172.31.31.77'); //for the deployed version, specify the IP address of the server
