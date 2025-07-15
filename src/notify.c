#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <unistd.h>
#include <errno.h>

// A very basic implementation of sd_notify behavior for Unix sockets
// Note: This is NOT the full sd_notify() function from libsystemd,
// but rather sends a message to the socket defined by NOTIFY_SOCKET env var.
int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <message>\n", argv[0]);
        return 1;
    }

    const char *notify_socket_path = getenv("NOTIFY_SOCKET");
    if (!notify_socket_path) {
        fprintf(stderr, "NOTIFY_SOCKET environment variable not set.\n");
        return 1;
    }

    int fd = socket(AF_UNIX, SOCK_DGRAM, 0); // DGRAM for sd_notify
    if (fd == -1) {
        perror("socket");
        return 1;
    }

    struct sockaddr_un addr;
    memset(&addr, 0, sizeof(addr));
    addr.sun_family = AF_UNIX;

    // Handle abstract socket names (starting with '@')
    if (notify_socket_path[0] == '@') {
        // Abstract sockets need the null byte at the start of the path buffer
        // and the actual length includes the null byte but not the '@' prefix.
        addr.sun_path[0] = '\0';
        strncpy(addr.sun_path + 1, notify_socket_path + 1, sizeof(addr.sun_path) - 2);
        // Calculate length including the initial null byte
        size_t path_len = strlen(notify_socket_path + 1) + 1;
        if (path_len > sizeof(addr.sun_path) -1) {
             fprintf(stderr, "Socket path too long for abstract socket: %s\n", notify_socket_path);
             close(fd);
             return 1;
        }
        addr.sun_path[path_len] = '\0'; // Ensure null termination
    } else {
        if (strlen(notify_socket_path) >= sizeof(addr.sun_path)) {
            fprintf(stderr, "Socket path too long: %s\n", notify_socket_path);
            close(fd);
            return 1;
        }
        strncpy(addr.sun_path, notify_socket_path, sizeof(addr.sun_path) - 1);
        addr.sun_path[sizeof(addr.sun_path) - 1] = '\0';
    }

    // Determine the actual address length for sendto.
    // For filesystem sockets: offsetof(struct sockaddr_un, sun_path) + strlen(addr.sun_path) + 1
    // For abstract sockets: offsetof(struct sockaddr_un, sun_path) + path_len
    socklen_t addr_len;
    if (notify_socket_path[0] == '@') {
        addr_len = offsetof(struct sockaddr_un, sun_path) + strlen(notify_socket_path + 1) + 1;
    } else {
        addr_len = offsetof(struct sockaddr_un, sun_path) + strlen(addr.sun_path) + 1;
    }


    const char *message = argv[1];
    if (sendto(fd, message, strlen(message), 0, (struct sockaddr *)&addr, addr_len) == -1) {
        perror("sendto");
        close(fd);
        return 1;
    }

    close(fd);
    return 0;
}