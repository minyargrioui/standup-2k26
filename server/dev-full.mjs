import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(name, command, args) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${name} exited with code ${code}`);
      process.exitCode = code;
    }
  });

  return child;
}

const api = run('api', npmCommand, ['run', 'api']);
const web = run('web', npmCommand, ['run', 'dev']);

function stop() {
  api.kill();
  web.kill();
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
