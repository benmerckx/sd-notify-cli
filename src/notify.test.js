import {expect, test, describe} from 'bun:test'
import notify from './notify.js'
import {spawn} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'os'

describe('notify', () => {
  let socketPath

  if (os.platform() !== 'win32') {
    test('successful notification', async () => {
      socketPath = path.join(os.tmpdir(), `test-${Date.now()}.sock`)
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
      expect(output).toBe('READY=1')
    })
  }

  test('NOTIFY_SOCKET environment variable not set', async () => {
    delete process.env.NOTIFY_SOCKET
    try {
      await notify('READY=1')
    } catch (e) {
      expect(e.message).toContain('NOTIFY_SOCKET environment variable not set')
    }
  })

  test('invalid socket path', async () => {
    process.env.NOTIFY_SOCKET = '/invalid/socket/path'
    try {
      await notify('READY=1')
    } catch (e) {
      expect(e.message).toContain('sendto: No such file or directory')
    }
  })

  test('binary not found', async () => {
    const originalPath = path.join(process.cwd(), 'bin/notify.com')
    const renamedPath = path.join(process.cwd(), 'bin/notify.com.bak')
    fs.renameSync(originalPath, renamedPath)

    try {
      await notify('READY=1')
    } catch (e) {
      expect(e.message).toContain('not found')
    } finally {
      fs.renameSync(renamedPath, originalPath)
    }
  })
})
