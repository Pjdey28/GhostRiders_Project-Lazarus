import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const API = "http://127.0.0.1:5000";

export default function useIcuStream(handlers) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const socket = io(API, {
      transports: ["websocket"],
      withCredentials: true,
    });

    handlersRef.current.onStatus?.("connecting");

    socket.on("connect", () => {
      handlersRef.current.onStatus?.("live");
    });

    socket.on("disconnect", () => {
      handlersRef.current.onStatus?.("offline");
    });

    socket.on("connect_error", () => {
      handlersRef.current.onStatus?.("offline");
    });

    socket.on("icu_snapshot", (payload) => {
      handlersRef.current.onSnapshot?.(payload);
    });

    socket.on("icu_packet", (payload) => {
      handlersRef.current.onPacket?.(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
}