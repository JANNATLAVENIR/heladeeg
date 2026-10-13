import os from 'node:os'
import net from 'node:net'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const viteCli = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js')
const expoCli = path.join(projectRoot, 'node_modules', 'expo', 'bin', 'cli')
const children = []
let stopping = false
let expoTimer

function getLanAddress() {
  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === 'IPv4' && !address.internal && !address.address.startsWith('169.254.')) {
        return address.address
      }
    }
  }
  return '127.0.0.1'
}

function canBind(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.listen(port, '0.0.0.0', () => server.close(() => resolve(true)))
  })
}

async function findWebPort() {
  for (let port = 3000; port < 3100; port += 1) {
    if (await canBind(port)) return port
  }
  throw new Error('Port bannaan lagama helin inta u dhexaysa 3000 iyo 3099.')
}

const stop = () => {
  stopping = true
  if (expoTimer) clearTimeout(expoTimer)
  for (const child of children) child.kill('SIGTERM')
}

process.on('SIGINT', stop)
process.on('SIGTERM', stop)

function watch(child) {
  child.on('exit', (code) => {
    if (!stopping && code !== 0) {
      stop()
      process.exitCode = code ?? 1
    }
  })
}

async function waitForWebServer(url, child) {
  const deadline = Date.now() + 20000
  while (Date.now() < deadline) {
    if (stopping || child.exitCode !== null) throw new Error('Vite ma bilaaban; Expo Go lama bilaabin.')
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error('HelAdeeg web app-ku waqtigii loogu talagalay kuma bilaaban.')
}

try {
  const vitePort = await findWebPort()
  const webUrl = process.env.EXPO_PUBLIC_WEB_URL || `http://${getLanAddress()}:${vitePort}`
  const env = { ...process.env, EXPO_PUBLIC_WEB_URL: webUrl }

  console.log(`HelAdeeg web app: ${webUrl}`)
  if (vitePort !== 3000) console.log(`Port 3000 waa mashquul; HelAdeeg wuxuu adeegsanayaa ${vitePort}.`)
  console.log('Ku xir taleefanka iyo kombiyuutarka isla Wi-Fi-ga, ka dib ku fur QR code-ka Expo Go.')

  const vite = spawn(process.execPath, [viteCli, '--host', '0.0.0.0', '--port', String(vitePort), '--strictPort'], { cwd: projectRoot, env, stdio: 'inherit' })
  children.push(vite)
  watch(vite)
  await waitForWebServer(`http://127.0.0.1:${vitePort}`, vite)

  if (!stopping) {
    const expoProcess = spawn(process.execPath, [expoCli, 'start', '--lan', '--port', '8082'], { cwd: projectRoot, env, stdio: 'inherit' })
    children.push(expoProcess)
    watch(expoProcess)
  }
} catch (error) {
  console.error(error.message)
  stop()
  process.exitCode = 1
}
