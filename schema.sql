CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid VARCHAR(255), 
  name VARCHAR(255),
  skill VARCHAR(255),
  location VARCHAR(255),
  time_availability VARCHAR(255),
  years_of_experience INT,
  email VARCHAR(255),
  password VARCHAR(255)
);

INSERT INTO users (firebase_uid, name, skill, location, time_availability, years_of_experience, email, password)  
VALUES ('abc123', 'John Doe', 'Software Developer', 'New York, USA', '11', 5, 'johndoe@example.com', 'hashedpassword');



-- Skill swap requests table
CREATE TABLE IF NOT EXISTS skill_swap_requests (
  id VARCHAR(36) PRIMARY KEY,
  sender_id INT NOT NULL,
  recipient_id INT NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  sender_skill VARCHAR(255) NOT NULL,
  requested_skill VARCHAR(255) NOT NULL,
  time_availability VARCHAR(255) NOT NULL,
  status ENUM('pending', 'accepted', 'declined', 'withdrawn') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Successful matches table
CREATE TABLE IF NOT EXISTS successful_matches (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  skill VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  time_availability VARCHAR(255) NOT NULL,
  years_of_experience INT DEFAULT 0,
  email VARCHAR(255) NOT NULL,
  sessions_completed INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Invites table
CREATE TABLE IF NOT EXISTS invites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);






CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tag VARCHAR(50) NOT NULL,
    author VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    post_id INT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);

ALTER TABLE comments DROP FOREIGN KEY comments_ibfk_1; -- Remove the foreign key constraint
ALTER TABLE comments DROP COLUMN user_id;
ALTER TABLE comments ADD COLUMN name VARCHAR(255) AFTER post_id;




CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tag_name VARCHAR(100)
);

CREATE TABLE postTags (
    post_id INT,
    tag_id INT,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tag VARCHAR(50) NOT NULL,
    author VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    post_id INT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);

CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tag_name VARCHAR(100)
);

CREATE TABLE postTags (
    post_id INT,
    tag_id INT,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

INSERT INTO posts (user_id, title, content, tag, author)
VALUES
(1, 'Understanding React Hooks', 'This post explains the use of React hooks in functional components.', 'JavaScript', 'Alice Johnson'),
(2, 'Introduction to Django REST Framework', 'Learn how to build APIs with Django.', 'Python', 'Bob Smith'),
(3, 'Building a Spring Boot Application', 'Step-by-step guide to building a microservice with Spring Boot.', 'Java', 'Charlie Davis'),
(4, 'Optimizing C++ Code for Performance', 'Tips and tricks for writing high-performance C++ code.', 'C++', 'David Lee'),
(5, 'Machine Learning for Beginners', 'An introduction to machine learning concepts.', 'AI', 'Emma Wilson');

INSERT INTO users (firebase_uid, name, skill, location, time_availability, years_of_experience, email, password)  
VALUES  
('uid_123abc', 'Alice Johnson', 'React, Node.js', 'New York, USA', 40, 3, 'alice@example.com', 'password123'),  

('uid_456def', 'Bob Smith', 'Python, Django', 'Toronto, Canada', 20, 5, 'bob@example.com', 'securepass456'),  
('uid_789ghi', 'Charlie Lee', 'Java, Spring Boot', 'San Francisco, USA', 15, 4, 'charlie@example.com', 'javaRocks!'),  
('uid_101jkl', 'David Kim', 'C++, Embedded Systems', 'Seoul, South Korea', 50, 7, 'david@example.com', 'cppMaster2024'),  
('uid_112mno', 'Emma Williams', 'UX/UI Design, Figma', 'Berlin, Germany', 30, 2, 'emma@example.com', 'designPro99');  

