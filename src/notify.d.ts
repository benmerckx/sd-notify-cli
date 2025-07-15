
/**
 * Sends a status notification to the systemd service manager using the 'notify' binary.
 *
 * This function executes the compiled 'notify' binary as a child process,
 * passing the provided status string as an argument.
 *
 * @param statusMessage The status string to send (e.g., "READY=1", "STATUS=Initializing...").
 * @returns A Promise that resolves if the notification is sent successfully,
 * or rejects if the binary execution fails.
 */
export default function notify(statusMessage: string): Promise<void>
