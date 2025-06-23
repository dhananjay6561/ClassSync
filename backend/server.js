const app = require('./src/app');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// This code initializes the server by importing the app from the src/app module
// and starting it on the specified port. It logs a message to the console when the server
// is successfully running. The port defaults to 5000 if not specified in the environment variables