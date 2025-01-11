[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/WKF7bdtB)
# MSci 245 - Project Deliverable 2

## Due: July 17, 2024, 6:00PM

## GitHub Classroom link: https://classroom.github.com/a/8f6WY7bt

## Summary: 
Implement reading/writing of the data from/to MySQL database in your React/NodeJS app.

## Development Tips:
- Use CodeSpaces for this project.
- In VSCode terminal on CodeSpaces start a new branch:
```git checkout -b d2```
- As you code, push daily changes to your GitHub repo's `d2` branch:
```
git add .
git commit -m "done feature xyz"
git push origin d2
```

## Initialize the Private Key in CodeSpaces

1. Open GitHub in the browser. Go to Settings > Codespaces. Click on the `Edit` icon for the key `STUDENT`. Under `Repository Access`, select your D2 repository name. Click `Save changes`.
2. Do Steps 2-9 from Lab 9 - Part 1 section in README.md. ***Tip: Stop and Restart your Codespace if you don't see the Private key when you do `echo "${STUDENT}"`.***
3. The database name in Line 6 in `config.js` file should be changed to your UW username. Your database has the same name as your UW username, and contains a copy of the `imdb` database.

## Deliverable 2 Guidelines

### Part 1: Augment your database

1. Open MySQL Workbench
2. Select the database that has the same name as your UW username:

```
USE yourUserName;
```
Tip: Click on the icon highlighted in the figure below to only run the query with the cursor.

![image](/img/screen1.png)

3. List all the tables visible to you.

```
SHOW TABLES;
```

Click on the same icon again to run this query.

You should see the following result:

![image](/img/screen3.png)

4. Create two tables listed below. In addition to the given attributes, add Foreign Keys required to join (a) User with Review and (b) Review with Movie. 

```
Table name: User
Attributes: userID (Primary Key), firstName, lastName, email, phone, dateOfBirth
```

```
Table name: Review 
Attributes: reviewID (Primary Key), reviewTitle, reviewContent (200 characters maximum), reviewScore [values: 1-5] 
```

***Important: name the tables and attributes exactly as shown above with the same capitalization. This is important to pass the autograding script***

### Part 2: Implement the following functionalities in your React/NodeJS app

1.	For this deliverable, you will need to extend the React code that you wrote for D1. Copy the components under `client/src/components/App` in your D1 repository into the current D2 repository. ***Important: If you had any errors in your D1 code, make sure that you correct them in D2. Do not make any changes to your D1 GitHub repository.***

2.	Read the list of movies from MySQL 

i. Upon the first render, the React code should send a request to the NodeJS POST API `getMovies` in `server.js` to retrieve the list of all movie records from the `movies` table in your database. 

ii. When the React code receives the list of movies, it should assign the received movies list to a stateful list `movies`. 

iii. Write code to populate the MUI Select element (created in D1) with the values from the stateful list. 

iv. In NodeJS (file `server.js`) create a POST API `getMovies` that will receive a POST request from React and retrieve all records of movies from the `movies` table in your database. For each movie, it must retrieve all fields (id, name, year, quality). Finally, the API must send the list of records as a JSON object to React.

3.	Write the user-created movie review to MySQL 

i. When the user clicks the `Submit` button, the React should send all review data (movieID, userID, reviewTitle, reviewContent, reviewScore) to the POST API `addReview` in `server.js`. 

ii. In `server.js` implement a POST API `addReview`, which receives user-created review from React, and inserts the review data into the appropriate table(s) in your database. 

### Notes:
- You must use Express middleware to send data between React and NodeJS.
- Make sure that the D1 validation checks and all other React UI requirements still work correctly in your code.
- Declare `userID` as a stateful variable in your React code and set it to '1'.
- You are not required to create the MySQL record for the user with userID='1' in User table upon each review submission. Instead, create it once directly in MySQL Workbench. 

4.	After you finish development, make sure that the app renders in the browser and functions according to the specifications.

5.	Push changes to the GitHub:

```
git add .
git commit -m "completed"
git push origin d2
```

6.	In your GitHub repo, create new pull request and merge `d2` branch with the `main` branch.
