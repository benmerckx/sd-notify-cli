import {spawn} from 'node:child_process'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))

/**
 * Sends a status notification to the systemd service manager using the 'notify' binary.
 *
 * This function executes the compiled 'notify' binary as a child process,
 * passing the provided status string as an argument.
 *
 * @param {string} statusMessage The status string to send (e.g., "READY=1", "STATUS=Initializing...").
 * @returns {Promise<void>} A Promise that resolves if the notification is sent successfully,
 * or rejects if the binary execution fails.
 */
export default function notify(statusMessage) {
  return new Promise((resolve, reject) => {
    let stderrOutput = ''
    const binaryPath = path.join(dir, '../bin/notify.com')
    const notifyProcess = spawn(binaryPath, [statusMessage], {
      shell: true
    })
    notifyProcess.stderr.on('data', data => {
      stderrOutput += data.toString()
    })
    notifyProcess.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(stderrOutput))
    })
    notifyProcess.on('error', cause => {
      reject(new Error(
        `Failed to spawn binary at '${binaryPath}': ${cause.message}`,
        {cause}
      ))
    })
  })
}
