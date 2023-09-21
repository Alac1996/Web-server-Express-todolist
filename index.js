const express = require("express");
const mysql2 = require("mysql2/promise");

const app = express();

const database = mysql2.createPool({
  host: "localhost",
  user: "root",
  password: "M0meepooh",
  database: "mysql_todo_list",
  connectionLimit: 20,
});

app.use(express.json());

// validate exist email
// app.get('/validate-email',(req,res,next) => {} => {

// })

// login
// Method: post, path: /login
// Data: username, password(REQUEST BODY)
app.post("/login", async (req, res, next) => {
  try {
    // READ BOY
    const { username, password } = req.body;
    // find user with username and password
    const result = await database.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    );
    if (result[0].length === 0) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    res.status(200).json({ message: "Success Login" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// BODY , QUERY, PARAMETER
// register
// Method: post, Path: /register
// Data: username, password (REQUEST BODY)
app.post("/register", async (req, res, next) => {
  try {
    // READ BODY
    const { username, password } = req.body;
    // VALIDATE DATA eg. PASSWORD must contain at least one uppercase
    // find exist username
    // [el1,el2]
    // el1 [{id:7, username: "leo", password: "123456"}]
    const result = await database.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    console.log(result);
    // [[{id: , username: }], []]
    if (result[0].length > 0) {
      return res.status(400).json({ message: "The username already exist" });
    }
    //  VALIDATE FAIL
    //   res.status(400).json({ message: "PASSWORD must contain at least one uppercase" });
    // END VALIDATE

    //   SAVE DATA TO DATABASE
    //   MySQL2 connect to MySQL server and persist data to user table

    await database.query(
      "INSERT INTO users (username , password) VALUES (?,?)",
      [username, password]
    );
    res.status(201).json({ message: "Registration Success!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Sever Error" });
  }
});

// change password
// Method: put, path /change-password
// Data: username , newPassword (REQUEST BODY)

app.put("/change-password", async (req, res, next) => {
  try {
    // READ BODY
    const { username, newPassword } = req.body;
    //   VALIDATE username exist
    const result = await database.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (result[0].length === 0) {
      return res.status(400).json({ message: "Username not found" });
    }

    await database.query("UPDATE users SET password = ? WHERE username = ?", [
      newPassword,
      username,
    ]);
    res.status(200).json({ message: "Success Updated Password" });
  } catch (error) {
    res.status(500).json({ message: "Internal Sever Error" });
  }
});

// create todo
// Method: post, path: /create-todo
// Data: title, userId, completed
app.post("/create-todo", async (req, res, next) => {
  try {
    // READ BODY
    const { title, userId, completed } = req.body;
    // VALIDATE userId exist ??
    const result = await database.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (result[0].length === 0) {
      return res.status(400).json({ message: "User ID is not found" });
    }
    await database.query(
      "INSERT INTO todos (title , completed , user_id) VALUES(? , ? , ?)",
      [title, completed, userId]
    );
    res.status(200).json({ message: "Create todo successfully!!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// get todo
// Method: get, Path: /get-todo
// Data: searchTitle, userId (QUERY)
app.get("/get-todo", async (req, res, next) => {
  try {
    // READ QUERY
    const { searchTitle, userId } = req.query;
    if (searchTitle !== undefined && userId !== undefined) {
      const result = await database.query(
        "SELECT * FROM todos WHERE title = ? AND user_id = ?",
        [searchTitle, userId]
      );
      res.status(200).json({ resultTodo: result[0] });
    }
    if (searchTitle !== undefined) {
      const result = await database.query(
        "SELECT * FROM todos WHERE title = ?",
        [searchTitle]
      );
      res.status(200).json({ resultTodo: result[0] });
    }
    if (userId !== undefined) {
      const result = await database.query(
        "SELECT * FROM todos WHERE user_id = ?",
        [userId]
      );
      return res.status(200).json({ resultTodo: result[0] });
    }

    const result = await database.query("SELECT * FROM todos");
    res.status(200).json({ resultTodo: result[0] });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// delete todo
// Method: delete, path: /delete-todo/:idToDelete
// Data: idToDelete
app.delete("/delete-todo/:idToDelete", async (req, res, next) => {
  try {
    // READ PATH PARAMETER
    const { idToDelete } = req.params; // {idToDelete: value}
    // find todo exist ??
    const result = await database.query("SELECT * FROM todos WHERE id = ?", [
      idToDelete,
    ]);
    if (result[0].length === 0) {
      return res.status(400).json({ message: "TODO WITH THIS ID NOT FOUND" });
    }
    await database.query("DELETE FROM todos WHERE id = ?", [idToDelete]);
    res.status(200).json({ message: "DELETE SUCCESSFULLY" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(8888, () => console.log("server running on port 8888"));
