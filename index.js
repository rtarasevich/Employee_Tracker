const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");
require("dotenv").config();

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "trapperKeeper_db",
  },
  console.log("It works and you're connected somehow!")
);

db.connect(function (err) {
  if (err) throw err;
  console.log("MySQL is connected");
  startApp();
});

const startApp = () => {
  return inquirer
    .prompt([
      {
        name: "action",
        type: "list",
        message: "Make your choice. Choose wisely.",
        choices: [
          "View Departments",
          "View Roles",
          "View Employees",
          "Add Department",
          "Add Role",
          "Add Employee",
          "Update Employee Role",
        ],
      },
    ])
    .then(function (val) {
      switch (val.action) {
        case "View Departments":
          console.log(val.action);
          viewDepartments();
          break;

        case "View Roles":
          viewRoles();
          break;

        case "View Employees":
          viewEmployees();
          break;

        case "Add Department":
          addDepartment();
          break;

        case "Add Role":
          addRole();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Update Employee Role":
          updateEmployee();
      }
    });
};

const viewDepartments = () => {
  (function (err, res) {
    if (err) {
      console.log("You screwed up...");
      console.dir(err);
      return;
    }
    console.log(res);
  });
  const query = `SELECT * FROM departments`;
  db.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    startApp();
  });
};

const viewRoles = () => {
  (function (err, res) {
    if (err) {
      console.log("You screwed up AGAIN...");
      console.dir(err);
      return;
    }
    console.log(res);
  });
  const query = `SELECT roles.id, roles.title, roles.salary, roles.department_id FROM roles`;
  db.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    startApp();
  });
};

const viewEmployees = () => {
  (function (err, res) {
    if (err) {
      console.log("You are bad at this...");
      console.dir(err);
      return;
    }
    console.log(res);
  });
  const query = `SELECT employees.id, employees.first_name, employees.last_name, departments.name, roles.title, roles.salary, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employees INNER JOIN roles on roles.id = employees.role_id INNER JOIN departments on departments.id = roles.department_id left join employees e on employees.manager_id = e.id;`;
  db.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
    startApp();
  });
};

const addDepartment = () => {
  (function (err, res) {
    if (err) {
      console.log("Seriously. Quite bad...");
      console.dir(err);
      return;
    }
    console.log(res);
  });
  return inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "You want to add a department, eh? Go on then...",
      },
    ])
    .then(function (res) {
      const query = "INSERT INTO departments SET ?";
      db.query(
        query,
        {
          name: res.name,
        },
        function (err) {
          if (err) throw err;
          console.table(res);
          startApp();
        }
      );
    });
};

let roleArray = [];
const selectRole = () => {
  const query = "SELECT * FROM roles";
  db.query(query, function (err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      roleArray.push(res[i].title);
    }
  });
  return roleArray;
};

let managerArray = [];
const selectManager = () => {
  const query = `SELECT first_name, last_name FROM employees WHERE manager_id is NULL`;
  db.query(query, function (err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      managerArray.push(res[i].first_name);
    }
  });
  return managerArray;
};

const addRole = () => {
  (function (err, res) {
    if (err) {
      console.log("Really bad. Super serial...");
      console.dir(err);
      return;
    }
    console.log(res);
  });
  const query = `SELECT roles.title, roles.salary FROM roles`;
  db.query(query, function (err, res) {
    inquirer
      .prompt([
        {
          type: "input",
          name: "title",
          message: "Title of said role, please...",
        },
        {
          type: "input",
          name: "salary",
          message: "And how much money will it be making?",
        },
      ])
      .then(function (res) {
        db.query(
          "INSERT INTO roles SET ?",
          {
            title: res.title,
            salary: res.salary,
          },
          function (err) {
            if (err) throw err;
            console.table(res);
            startApp();
          }
        );
      });
  });
};

const addEmployee = () => {
  (function (err, res) {
    if (err) {
      console.log("How are you not getting any better at this?!");
      console.dir(err);
      return;
    }
    console.log(res);
  });
  inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "So what is their surname?",
      },
      {
        type: "input",
        name: "last_name",
        message: "And their family name?",
      },
      {
        type: "list",
        name: "role",
        message: "And what job will they be doing?",
        choices: selectRole(),
      },
      {
        type: "list",
        name: "manager",
        message: "Who will be their boss?",
        choices: selectManager(),
      },
    ])
    .then(function (val) {
      const roleID = selectRole().indexOf(val.role) + 1;
      const managerID = selectManager().indexOf(val.choice) + 1;
      db.query(
        "INSERT INTO employees SET ?",
        {
          first_name: val.first_name,
          last_name: val.last_name,
          role_id: roleID,
          manager_id: managerID,
        },
        function (err) {
          if (err) throw err;
          console.table(val);
          startApp();
        }
      );
    });
};

const updateEmployee = () => {
  (function (err, res) {
    if (err) {
      console.log("You might not be the absolute worst...");
      console.dir(err);
      return;
    }
    console.log(res);
  });
  const query = `SELECT employees.last_name, roles.title FROM employees JOIN roles ON employees.role_id = roles.id`;
  db.query(query, function (err, res) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: "list",
          name: "last name",
          message: "What is the employee's family name?",
          choices: function () {
            let lastName = [];
            for (var i = 0; i < res.length; i++) {
              lastName.push(res[i].last_name);
            }
            return lastName;
          },
        },
        {
          type: "list",
          name: "role",
          message: "What about the new title for said employee?",
          choices: selectRole(),
        },
      ])
      .then(function (val) {
        let roleID = selectRole().indexOf(val.role) + 1;
        db.query(
          "UPDATE employees SET ? WHERE ?",
          [
            {
              last_name: val.lastName,
            },
            {
              role_id: roleID,
            },
          ],
          function (err) {
            if (err) throw err;
            console.table(val);
            startApp();
          }
        );
      });
  });
};
