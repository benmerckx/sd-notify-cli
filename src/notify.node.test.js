import { test, describe } from 'node:test'
import assert from 'node:assert'
import notify from './notify.js'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

describe('notify node tests', () => {
  let socketPath

  if (os.platform() !== 'win32') {
    test('successful notification', async () => {
      socketPath = path.join(os.tmpdir(), `test-node-${Date.now()}.sock`)
      process.env.NOTIFY_SOCKET = socketPath

      const socat = spawn('socat', [
        '-u',
        `UNIX-RECV:${socketPath}`,
        'STDOUT'
      ])

      let output = ''
      socat.stdout.on('data', data => {
        output += data.toString()
      })

      await new Promise(resolve => setTimeout(resolve, 100))
      await notify('READY=1')
      await new Promise(resolve => setTimeout(resolve, 100))

      socat.kill()
      assert.strictEqual(output, 'READY=1')
    })
  }

  test('NOTIFY_SOCKET environment variable not set', async () => {
    delete process.env.NOTIFY_SOCKET
    try {
      await notify('READY=1')
      assert.fail('Should have thrown an error')
    } catch (e) {
      assert.match(e.message, /NOTIFY_SOCKET environment variable not set/)
    }
  })

  test('invalid socket path', async () => {
    process.env.NOTIFY_SOCKET = '/invalid/socket/path'
    try {
      await notify('READY=1')
      assert.fail('Should have thrown an error')
    } catch (e) {
      assert.match(e.message, /sendto: No such file or directory/)
    }
  })

  test('binary not found', async () => {
    const originalPath = path.join(process.cwd(), 'bin/notify.com')
    const renamedPath = path.join(process.cwd(), 'bin/notify.com.bak')
    fs.renameSync(originalPath, renamedPath)

    try {
      await notify('READY=1')
      assert.fail('Should have thrown an error')
    } catch (e) {
      const msg = e.message.toLowerCase()
      const hasNotFoundError = msg.includes('not found') || msg.includes('no such file') || msg.includes('cannot open')
      assert.strictEqual(hasNotFoundError, true, `Expected error message to indicate file not found, got: ${e.message}`)
    } finally {
      fs.renameSync(renamedPath, originalPath)
    }
  })
})
