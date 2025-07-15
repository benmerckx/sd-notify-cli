# sd-notify-cli

This project provides a minimal implementation of the `sd_notify` mechanism, allowing processes to send notifications to systemd or compatible service managers via Unix sockets. It is designed to be simple, portable, and dependency-free, making it suitable for use in containers, custom init systems, or environments where the full `libsystemd` is not available.

The binary is built as a universal executable using [ape/libcosmopolitan](https://justine.lol/cosmopolitan/) and will run on Linux, macOS, Windows, and more, making it highly cross-platform. The binary is bundled with the project so there is no need to install additional libraries or dependencies.

## Features

- Sends messages to the socket specified by the `NOTIFY_SOCKET` environment variable.
- Supports both filesystem and abstract Unix domain sockets (as used by systemd).

## Installation

Install from npm:

```sh
npm install sd-notify-cli
```

## Example

To notify systemd that your service is ready:

```sh
sd-notify-cli "READY=1"
```

To send a custom message:

```sh
sd-notify-cli "STATUS=Starting up..."
```

## Usage from JavaScript

You can also use this package directly from JavaScript:

```js
import notify from 'sd-notify-cli'

// Notify systemd that your service is ready
await notify('READY=1')

// Send a custom message
await notify('STATUS=Starting up...')
```

## Notes

- This is **not** a full replacement for `sd_notify()` from `libsystemd`. It only sends a single message to the specified socket.
- The tool does not support file descriptor passing or advanced features of the full `sd_notify` API.
- The socket path must fit within the limits of `struct sockaddr_un`.

## License

See [LICENSE](LICENSE) for details.