import mysql from 'mysql';
import config from './config.js';
import fetch from 'node-fetch';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url'
import bodyParser from 'body-parser';

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

// Get user ID based on Firebase UID
app.get('/api/getUserId', (req, res) => {
  const { firebase_uid } = req.query;
  if (!firebase_uid) {
      return res.status(400).json({ error: "Missing Firebase UID" });
  }

  const sql = "SELECT id FROM users WHERE firebase_uid = ?";
  db.query(sql, [firebase_uid], (error, results) => {
      if (error) {
          console.error("Error fetching user ID:", error);
          return res.status(500).json({ error: "Database error" });
      }

      if (results.length > 0) {
          res.json({ user_id: results[0].id });
      } else {
          res.status(404).json({ error: "User not found" });
      }
  });
});


  
// POSTS
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

// MATCHES 
// Fetch Pending & Accepted Matches
router.get("/api/matches", (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
      return res.status(400).json({ error: "Missing user ID" });
  }

  const pendingSql = `
      SELECT id, sender_name, sender_skill, requested_skill, time_availability, status 
      FROM skill_swap_requests 
      WHERE recipient_name = ? AND status = 'pending';
  `;
  
  const acceptedSql = `
      SELECT id, name, skill, location, time_availability, sessions_completed 
      FROM successful_matches 
      WHERE name = ?;
  `;

  db.query(pendingSql, [user_id], (err, pendingResults) => {
      if (err) {
          console.error("Error fetching pending matches:", err.message);
          return res.status(500).json({ error: "Database error" });
      }

      db.query(acceptedSql, [user_id], (err, acceptedResults) => {
          if (err) {
              console.error("Error fetching accepted matches:", err.message);
              return res.status(500).json({ error: "Database error" });
          }

          res.json({ pending: pendingResults, accepted: acceptedResults });
      });
  });
});

// Send a Match Request
router.post("/api/matches/request", (req, res) => {
  const { sender_name, recipient_name, sender_skill, requested_skill, time_availability } = req.body;

  const sql = `
      INSERT INTO skill_swap_requests 
      (id, sender_name, recipient_name, sender_skill, requested_skill, time_availability, status) 
      VALUES (UUID(), ?, ?, ?, ?, ?, 'pending')
  `;

  db.query(sql, [sender_name, recipient_name, sender_skill, requested_skill, time_availability], (error, result) => {
      if (error) {
          console.error("Error creating request:", error);
          return res.status(500).json({ message: "Error creating skill swap request" });
      }
      res.status(201).json({ message: "Request sent successfully!" });
  });
});

// Accept a Match Request
router.post("/api/matches/accept/:id", (req, res) => {
  const { id } = req.params;

  db.beginTransaction(err => {
      if (err) {
          console.error("Error starting transaction:", err);
          return res.status(500).json({ message: "Error accepting request" });
      }

      const fetchSql = "SELECT * FROM skill_swap_requests WHERE id = ? AND status = 'pending'";
      db.query(fetchSql, [id], (error, requests) => {
          if (error || requests.length === 0) {
              db.rollback();
              return res.status(404).json({ message: "Request not found or already processed" });
          }

          const request = requests[0];
          const createMatchSql = `
              INSERT INTO successful_matches 
              (id, name, skill, location, time_availability, years_of_experience, email, status)
              VALUES (UUID(), ?, ?, 'Online', ?, 0, ?, 'active')
          `;

          db.query(createMatchSql, [request.sender_name, request.sender_skill, request.time_availability, `${request.sender_name.toLowerCase().replace(' ', '.')}@example.com`], (error) => {
              if (error) {
                  db.rollback();
                  return res.status(500).json({ message: "Error creating match" });
              }

              const updateSql = "UPDATE skill_swap_requests SET status = 'accepted' WHERE id = ?";
              db.query(updateSql, [id], (error) => {
                  if (error) {
                      db.rollback();
                      return res.status(500).json({ message: "Error updating request status" });
                  }

                  db.commit(err => {
                      if (err) {
                          db.rollback();
                          return res.status(500).json({ message: "Error finalizing match" });
                      }
                      res.json({ message: "Skill swap request accepted successfully!" });
                  });
              });
          });
      });
  });
});

// Reject a Match Request
router.post("/api/matches/reject/:id", (req, res) => {
  const { id } = req.params;

  const sql = "UPDATE skill_swap_requests SET status = 'declined' WHERE id = ? AND status = 'pending'";
  db.query(sql, [id], (error, result) => {
      if (error) {
          console.error("Error rejecting request:", error);
          return res.status(500).json({ message: "Error rejecting request" });
      }
      res.json({ message: "Skill swap request rejected successfully!" });
  });
});

// Withdraw a Match Request
router.post("/api/matches/withdraw/:id", (req, res) => {
  const { id } = req.params;

  const sql = "UPDATE skill_swap_requests SET status = 'withdrawn' WHERE id = ? AND status = 'pending'";
  db.query(sql, [id], (error, result) => {
      if (error) {
          console.error("Error withdrawing request:", error);
          return res.status(500).json({ message: "Error withdrawing request" });
      }
      res.json({ message: "Skill swap request withdrawn successfully!" });
  });
});

// Update Match Progress
router.put("/api/matches/progress/:id", (req, res) => {
  const { id } = req.params;
  const { sessions_completed } = req.body;

  const sql = `
      UPDATE successful_matches 
      SET sessions_completed = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND status = 'active'
  `;

  db.query(sql, [sessions_completed, id], (error, result) => {
      if (error) {
          console.error("Error updating progress:", error);
          return res.status(500).json({ message: "Error updating progress" });
      }
      res.json({ message: "Progress updated successfully!" });
  });
});

// Send an Invite
app.post("/api/invites/send", (req, res) => {
  const { sender_id, receiver_id } = req.body;

  if (!sender_id || !receiver_id) {
      return res.status(400).json({ error: "Missing sender or receiver ID" });
  }

  // Ensure both users exist before inserting invite
  const checkUsersSql = "SELECT id FROM users WHERE id IN (?, ?)";
  db.query(checkUsersSql, [sender_id, receiver_id], (err, results) => {
      if (err) {
          console.error("Database error:", err.message);
          return res.status(500).json({ error: "Database error" });
      }
      if (results.length !== 2) {
          return res.status(400).json({ error: "Sender or Receiver does not exist" });
      }

      const sql = "INSERT INTO invites (sender_id, receiver_id, status) VALUES (?, ?, 'pending')";
      db.query(sql, [sender_id, receiver_id], (err, result) => {
          if (err) {
              console.error("Error sending invite:", err.message);
              return res.status(500).json({ error: "Database error" });
          }
          res.status(201).json({ message: "Invite sent successfully!", inviteId: result.insertId });
      });
  });
});


// Fetch all pending invites for a user
app.get("/api/invites/pending/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
      SELECT i.id, u.name AS sender_name, u.skill AS sender_skill, i.status, i.time_availability 
      FROM invites i
      JOIN users u ON i.sender_id = u.id
      WHERE i.receiver_id = ? AND i.status = 'pending'
  `;

  db.query(sql, [userId], (err, results) => {
      if (err) {
          console.error("Error fetching pending invites:", err.message);
          return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
  });
});

// Accept an Invite
app.post("/api/invites/accept/:inviteId", (req, res) => {
  const { inviteId } = req.params;

  const sql = "UPDATE invites SET status = 'accepted' WHERE id = ? AND status = 'pending'";
  db.query(sql, [inviteId], (err, result) => {
      if (err) {
          console.error("Error accepting invite:", err.message);
          return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Invite accepted successfully!" });
  });
});

// Reject an Invite
app.post("/api/invites/reject/:inviteId", (req, res) => {
  const { inviteId } = req.params;

  const sql = "UPDATE invites SET status = 'rejected' WHERE id = ? AND status = 'pending'";
  db.query(sql, [inviteId], (err, result) => {
      if (err) {
          console.error("Error rejecting invite:", err.message);
          return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Invite rejected successfully!" });
  });
});


app.use(router);
app.listen(port, () => console.log(`Listening on port ${port}`));


// const createTables = `
//   -- Skill swap requests table
//   CREATE TABLE IF NOT EXISTS skill_swap_requests (
//     id VARCHAR(36) PRIMARY KEY,
//     sender_name VARCHAR(255) NOT NULL,
//     recipient_name VARCHAR(255) NOT NULL,
//     sender_skill VARCHAR(255) NOT NULL,
//     requested_skill VARCHAR(255) NOT NULL,
//     time_availability VARCHAR(255) NOT NULL,
//     status ENUM('pending', 'accepted', 'declined', 'withdrawn') NOT NULL DEFAULT 'pending',
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   );

//   -- Successful matches table
//   CREATE TABLE IF NOT EXISTS successful_matches (
//     id VARCHAR(36) PRIMARY KEY,
//     name VARCHAR(255) NOT NULL,
//     skill VARCHAR(255) NOT NULL,
//     location VARCHAR(255) NOT NULL,
//     time_availability VARCHAR(255) NOT NULL,
//     years_of_experience INT NOT NULL,
//     email VARCHAR(255) NOT NULL,
//     sessions_completed INT DEFAULT 0,
//     status VARCHAR(50) DEFAULT 'active',
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   );

//   -- Users table (if not exists)
//   CREATE TABLE IF NOT EXISTS users (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     name VARCHAR(255) NOT NULL,
//     location VARCHAR(255),
//     skills JSON,
//     seeking JSON,
//     availability VARCHAR(255),
//     email VARCHAR(255) UNIQUE NOT NULL
//   );
// `;

// // Insert mock data
// const insertMockData = `
//   -- Insert pending invites
//   INSERT INTO skill_swap_requests (id, sender_name, sender_skill, requested_skill, time_availability, status, created_at)
//   VALUES 
//     ('inv1', 'Alice Johnson', 'Python Programming', 'Spanish Language', 'Weekends', 'pending', '2024-03-15 10:00:00'),
//     ('inv2', 'Bob Smith', 'Guitar', 'Digital Marketing', 'Weekday Evenings', 'pending', '2024-03-14 15:30:00');

//   -- Insert sent requests
//   INSERT INTO skill_swap_requests (id, sender_name, recipient_name, sender_skill, requested_skill, time_availability, status, created_at)
//   VALUES 
//     ('req1', 'Current User', 'Carol White', 'JavaScript', 'Photography', 'Monday/Wednesday Evenings', 'pending', '2024-03-13 09:15:00'),
//     ('req2', 'Current User', 'David Brown', 'Yoga', 'Data Analysis', 'Tuesday/Thursday Mornings', 'pending', '2024-03-12 14:45:00');

//   -- Insert successful matches
//   INSERT INTO successful_matches (id, name, skill, location, time_availability, years_of_experience, email, sessions_completed, status, created_at)
//   VALUES 
//     ('match1', 'Eva Martinez', 'French Language', 'Online', 'Weekends', 5, 'eva.martinez@example.com', 3, 'active', '2024-03-10 08:00:00'),
//     ('match2', 'Frank Wilson', 'Web Design', 'Online', 'Weekday Evenings', 3, 'frank.wilson@example.com', 2, 'active', '2024-03-09 16:20:00'),
//     ('match3', 'Tom Brown', 'Chinese Language', 'New York', 'Monday/Wednesday/Friday mornings', 8, 'tom.brown@example.com', 12, 'active', NOW()),
//     ('match4', 'Maria Garcia', 'Marketing', 'Miami', 'Weekday afternoons', 6, 'maria.garcia@example.com', 8, 'active', NOW()),
//     ('match5', 'James Wilson', 'Business Strategy', 'Chicago', 'Flexible hours', 10, 'james.wilson@example.com', 16, 'active', NOW());

//   -- Insert mock users for search
//   INSERT INTO users (name, location, skills, seeking, availability, email)
//   VALUES 
//     ('John Doe', 'New York', '["JavaScript", "React", "Node.js"]', '["Python", "Data Analysis"]', 'Weekday evenings', 'john.doe@example.com'),
//     ('Jane Smith', 'San Francisco', '["Python", "Machine Learning", "Data Science"]', '["Web Development", "UI/UX Design"]', 'Weekends', 'jane.smith@example.com'),
//     ('Mike Johnson', 'Chicago', '["Guitar", "Piano", "Music Theory"]', '["Spanish", "French"]', 'Flexible', 'mike.johnson@example.com');
// `;