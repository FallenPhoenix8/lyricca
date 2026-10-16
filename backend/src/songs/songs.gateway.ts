import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"

const frontendURL = process.env.FRONTEND_URL
if (!frontendURL) {
  throw new Error("FRONTEND_URL environment variable is not set.")
}

/**
 * Gateway handling real-time song synchronization events for connected clients.
 * Broadcasts sync signals to specific user rooms when data changes.
 *
 * @example
 * Client connects with a userId in handshake auth and automatically joins their user room.
 */
@WebSocketGateway({
  namespace: "songs",
  cors: { origin: [frontendURL] },
})
export class SongsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  /**
   * Handles client connection and assigns them to a user-specific room based on authentication.
   *
   * @param client - The connected socket client instance.
   */
  handleConnection(client: Socket): void {
    // Extract userId from auth payload or handshake query
    const userId =
      client.handshake.auth?.userId || client.handshake.query?.userId

    if (userId) {
      client.join(`user_${userId}`)
    } else {
      // Disconnect unauthenticated clients
      client.disconnect()
    }
  }

  /**
   * Handles client disconnection cleanup.
   *
   * @param client - The disconnected socket client instance.
   */
  handleDisconnect(_: Socket): void {
    // Socket.io automatically removes clients from rooms on disconnect
    // No additional cleanup needed
    return
  }

  /**
   * Sends a sync notification event to all active connections belonging to a specific user.
   *
   * @param userId - UUID of the user whose songs changed.
   */
  notifyUserSync(userId: string): void {
    console.log(`Notifying user ${userId} of song sync.`)
    this.server.to(`user_${userId}`).emit("sync-now")
  }
}
