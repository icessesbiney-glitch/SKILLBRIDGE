import fs from "fs";
import path from "path";

export function logTerminalTrackingError(errorDetails: string) {
  const logDirectory = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] INTERNAL TRANSMISSION FAILURE: ${errorDetails}\n`;
  fs.appendFileSync(path.join(logDirectory, "network-breaks.txt"), formattedMessage);
}
