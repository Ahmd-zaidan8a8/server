const Joi = require("joi");
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

const CLIENT_URL = process.env.ORIGIN || "http://localhost:5173";

app.use(express.json());
app.use(
  cors({
    origin: CLIENT_URL,
    methods: "GET,POST ,DELETE , PUT",
  })
);

const users = [];
const consumedMeals = [];

// TODO: add the user and validate it
app.get("/login", (req, res) => {
  // users.push()
  res.send(users);
});

app.post("/login", (req, res) => {
  const { error, value } = validateUser(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const { userName, gender, weight, height } = value;

  const newUser = {
    id: users.length + 1,
    userName: userName,
    gender: gender,
    weight: weight,
    height: height,
  };

  users.push(newUser);
  res.send(newUser);
});

// GET : Edmama API
app.get("/nutrition-data", async (req, res) => {
  console.log("get to edmama called");
  try {
    const response = await axios.get(
      "https://api.edamam.com/api/nutrition-data",
      {
        params: {
          app_id: "3c51ccf7",
          app_key: "88486511d083c33640ce0bb1971028da",
          ingr: req.query.ingr,
        },
      }
    );
    res.send(response.data);
  } catch (error) {
    console.log("Error", error.message);
    res.status(500).send("internal server error");
  }
});

// GET /summarylist - get a list of meals
app.get("/summarylist", (req, res) => {
  res.status(200).json({
    meals: consumedMeals,
  });
});

// POST /summarylist - create new meal
app.post("/summarylist", (req, res) => {
  const { dailyCalories, ingr } = req.body;

  const newMeal = {
    id: consumedMeals.length + 1,
    dailyCalories,
    ingr,
  };

  consumedMeals.push(newMeal);

  res.status(201).json({
    message: "You have successfully added a new meal in your daily plan",
    mealInfo: newMeal,
  });
  console.log("adding a new Meal");
});

// Delete
app.delete("/summarylist/:mealId", (req, res) => {
  const meal = consumedMeals.find((meal) => {
    return meal.id === parseInt(req.params.mealId);
  });

  if (!meal)
    return res.status(404).send("the meal with the given id is not found");

  const index = consumedMeals.indexOf(meal);
  consumedMeals.splice(index, 1);
  res.send(meal);
});

// Update
app.put("/summarylist/:mealId", (req, res) => {
  const meal = consumedMeals.find((meal) => {
    return meal.id === parseInt(req.params.mealId);
  });

  if (!meal)
    return res.status(404).send("the meal with the given id is not found!");

  meal.ingr = req.body.ingr;
  res.send(meal);
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`listining on port ${port}`));

function validateUser(user) {
  const schema = Joi.object({
    gender: Joi.string().valid("Male", "Female").required(),
    weight: Joi.number().min(0).max(500).required(),
    height: Joi.number().min(0).max(300).required(),
    userName: Joi.string().min(3).max(100).required(),
  });

  return schema.validate(user);
}

axios.interceptors.request.use(
  function (config) {
    console.log("Request:", config);
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  function (response) {
    console.log("Response:", response);
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);
