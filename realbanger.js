const axios = require("axios");

(async () => {
  try {
    // Get command-line argument
    const noBangerTweet = process.argv[2];
    if (!noBangerTweet) {
      console.error("Please provide a tweet as a command-line argument.");
      process.exit(1);
    }

    const response = await axios({
      url: "http://localhost:3000/api",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        noBangerTweet
      }),
      responseType: "stream",
    });

    response.data
      .on("data", (chunk) => {
        const lines = chunk
          .toString()
          .split("\n")
          .filter((line) => line.trim() !== "");
        for (const line of lines) {
          const message = line.replace(/^data: /, "");
          if (message === "[DONE]") {
            console.log("\nStream completed.");
            return;
          }
          try {
            const parsed = JSON.parse(message);
            if (parsed.choices && parsed.choices[0].delta.content) {
              process.stdout.write(parsed.choices[0].delta.content);
            }
          } catch (error) {
            console.error("Error in streaming:", error);
          }
        }
      })
      .on("error", (error) => {
        console.error("Error in streaming:", error);
      });
  } catch (error) {
    console.error("An error occurred during the request:", error);
  }
})();
