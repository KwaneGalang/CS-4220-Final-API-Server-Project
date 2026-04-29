import fs from "fs";
import inquirer from "inquirer";

export async function showKeywordHistory() {
  try {
    // Read history file
    const data = fs.readFileSync("./search_history.json", "utf-8");
    const keywords = JSON.parse(data);

    // Build list with "Exit" as the frist choice
    const choices = ["Exit", ...keywords];

    // Prompt given to the user to see what they want to do
    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "selectedKeyword",
        message: "Select a keyword from your search history:",
        choices: choices
      }
    ]);

    // If user chooses Exit, return null so app.js can stop
    if (answer.selectedKeyword === "Exit") {
      return null;
    }

    // Return the keyword so app.js can run the search flow
    return answer.selectedKeyword;

  } catch (error) {
    console.error("Error reading search history:", error.message);
    return null;
  }
}
