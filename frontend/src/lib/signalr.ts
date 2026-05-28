import * as signalR from "@microsoft/signalr";

const HUB_URL = "http://localhost:5007/hotelHub";

let connection: signalR.HubConnection | null = null;

export function getHubConnection(): signalR.HubConnection {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () =>
          localStorage.getItem("hotelos_token") ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();
  }
  return connection;
}

export async function startConnection(): Promise<signalR.HubConnection> {
  const conn = getHubConnection();
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    await conn.start();
  }
  return conn;
}

export async function stopConnection(): Promise<void> {
  if (connection?.state !== signalR.HubConnectionState.Disconnected) {
    await connection?.stop();
  }
}

export async function joinChannel(channel: string): Promise<void> {
  const conn = await startConnection();
  await conn.invoke("JoinChannel", channel);
}

export async function leaveChannel(channel: string): Promise<void> {
  const conn = getHubConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    await conn.invoke("LeaveChannel", channel);
  }
}
