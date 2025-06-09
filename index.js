const express = require("express");
const cors = require("cors");

const userSelections = {
  selectedGoals: [],
  primaryGoal: null,
  drinksPerDay: {Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,},  // <-- Add this to keep drinks data
  totalDrinks: 0,
  dryDays: 7,
  spendPerDrink: 8,
  weeklySpend: 0,
  totalPerWeek: 0,
  savedIdealOutcome: null,
  alcoholEffectFrequency: null,
  alcoholConcernLevel: null,
  improvementAreas: [],
};

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/goals", (req, res) => {
  const { selectedGoals } = req.body;

  if (!Array.isArray(selectedGoals) || selectedGoals.length === 0) {
    return res.status(400).json({
      success: false,
      message: "selectedGoals must be a non-empty array.",
    });
  }

  userSelections.selectedGoals = selectedGoals;
  console.log("✅ Received selected goals:", selectedGoals);

  return res.status(200).json({
    success: true,
    message: "Goals saved successfully.",
    selectedGoals,
  });
});

app.post("/api/primary-goal", (req, res) => {
  const { primaryGoal } = req.body;

  if (!primaryGoal || typeof primaryGoal !== "string") {
    return res.status(400).json({
      success: false,
      message: "primaryGoal must be a non-empty string.",
    });
  }

  userSelections.primaryGoal = primaryGoal;
  console.log("🎯 Received primary goal:", primaryGoal);

  return res.status(200).json({
    success: true,
    message: "Primary goal saved successfully.",
    primaryGoal,
  });
});

// NEW endpoint to save drinks per day
app.post("/api/save-drinks", (req, res) => {
  const drinks = req.body;
  console.log("Drinks per day in drinks perday:", drinks);
  // Basic validation: check if it's an object with all 7 days as keys
  const expectedDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  if (
    typeof drinks !== "object" ||
    !expectedDays.every((day) => day in drinks && typeof drinks[day] === "number")
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Drinks per day must be an object with all days as keys and number values.",
    });
  }

  userSelections.drinksPerDay = drinks;
  console.log("🍹 Received drinks per day:", userSelections.drinksPerDay);

  res.status(200).json({
    success: true,
    message: "Drinks per day saved successfully.",
    drinksPerDay: drinks,
  });
});

app.get("/api/drinks-per-day", (req, res) => {
  if (!userSelections.drinksPerDay || Object.keys(userSelections.drinksPerDay).length === 0) {
    return res.status(404).json({ error: "No drinks per day data found" });
  }
  res.json(userSelections.drinksPerDay);
});

app.get("/api/user-selections", (req, res) => {
  res.status(200).json(userSelections);
});

// Save ideal outcome endpoint
app.post("/api/save-ideal-outcome", (req, res) => {
  const { idealOutcomeId } = req.body;
  if (![1, 2, 3].includes(idealOutcomeId)) {
    return res.status(400).json({ error: "Invalid ideal outcome ID" });
  }
  userSelections.savedIdealOutcome = idealOutcomeId;
  console.log("Saved ideal outcome:", idealOutcomeId);
  res.json({ success: true });
});

// Example endpoint to fetch saved outcome (optional)
app.get("/api/get-ideal-outcome", (req, res) => {
  const savedIdealOutcome = userSelections.savedIdealOutcome;
  if (!savedIdealOutcome) {
    return res.status(404).json({ error: "No ideal outcome saved" });
  }
  res.json({ idealOutcomeId: userSelections.savedIdealOutcome });
});

// Compute total drinks and dry days
app.get("/api/total-drinks", (req, res) => {
  const drinks = userSelections.drinksPerDay;
  if (!drinks) return res.status(400).json({ error: "No data" });

  userSelections.totalDrinks = Object.values(drinks).reduce((sum, v) => sum + Number(v), 0);
  userSelections.dryDays = Object.values(drinks).filter((v) => Number(v) === 0).length;
  const totalDrinks = userSelections.totalDrinks;
  const dryDays = userSelections.dryDays;
  res.json({ totalDrinks, dryDays });
});

app.post("/api/save-spend", (req, res) => {
  const { spendPerDrink } = req.body;

  if (typeof spendPerDrink !== "number" || isNaN(spendPerDrink)) {
    return res.status(400).json({ error: "Invalid spendPerDrink value" });
  }

  userSelections.spendPerDrink = spendPerDrink;
  console.log("💸 Received spendPerDrink:", spendPerDrink);

  res.status(200).json({ success: true });
});

app.get("/api/weekly-spend", (req, res) => {
  console.log("Entered weekly-spend")
  const drinks = userSelections.drinksPerDay;
  const spendPerDrink = userSelections.spendPerDrink;

  console.log("Drinks per day:", drinks);
  console.log("Spend per drink:", spendPerDrink);
  if (
    !drinks ||
    Object.keys(drinks).length === 0 ||
    typeof spendPerDrink !== "number" ||
    isNaN(spendPerDrink)
  ) {
    return res.status(400).json({ error: "Missing or invalid data for calculation" });
  }
  const totalDrinks = Object.values(drinks).reduce((sum, v) => sum + Number(v), 0);
  const weeklySpend = totalDrinks * spendPerDrink;
  
  userSelections.totalPerWeek = weeklySpend;

  res.json({
    totalPerWeek: weeklySpend,
  });
});

app.post("/api/save-alcohol-frequency", (req, res) => {
  const { alcoholEffectFrequency } = req.body;

  if (!alcoholEffectFrequency) {
    return res.status(400).json({ error: "No selection provided" });
  }
  userSelections.alcoholEffectFrequency = alcoholEffectFrequency;
  console.log("Alcohol Effect Frequency:", alcoholEffectFrequency);
  res.status(200).json({ message: "Selection saved successfully" });
});

app.post("/api/save-alcohol-concern", (req, res) => {
  const { alcoholConcernLevel } = req.body;
  if (alcoholConcernLevel === undefined) {
    return res.status(400).json({ error: "Missing concern level" });
  }
  userSelections.alcoholConcernLevel = alcoholConcernLevel;
  console.log("Alcohol Concern Level:", userSelections.alcoholConcernLevel);
  res.status(200).json({ message: "Concern saved successfully" });
});

app.post("/api/save-alcohol-improvement-areas", (req, res) => {
  const { selectedAreas } = req.body;
  if (!Array.isArray(selectedAreas)) {
    return res.status(400).json({ error: "Invalid selection" });
  }
  userSelections.improvementAreas = selectedAreas;
  console.log("Selected improvement areas:", selectedAreas);
  res.status(200).json({ message: "Saved successfully" });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
