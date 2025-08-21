const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length; // On your machine = 12
  console.log(`Master ${process.pid} is running`);
  console.log(`Spawning ${numCPUs} workers...`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Respawn dead workers
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

} else {
  // Worker processes
  console.log("Requiring app...");
  const app = require('./src/app');

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} running on port ${PORT}`);
  });

  // Boot the CRON task ONLY in one worker (avoid duplication)
  if (cluster.worker.id === 1) {
    require('./src/schedulers/conflictCron')();
  }
}

// This code initializes the server by importing the app from the src/app module
// and starting it on the specified port. It logs a message to the console when the server
// is successfully running. The port defaults to 5000 if not specified in the environment variables