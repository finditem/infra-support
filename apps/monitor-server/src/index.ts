import { runMonitoring } from "./services/monitoring.service";

runMonitoring()
  .then(() => {
    console.log("monitoring job completed");
  })
  .catch((error) => {
    console.error("monitoring job failed:", error);
    process.exit(1);
  });
