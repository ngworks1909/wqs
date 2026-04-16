"use client";
import { SessionProvider } from "next-auth/react";
import React from 'react';
import WaterProvider from "./DataProvider";
import { SocketProvider } from "./SocketProvider";

export function Providers({children}: {children: React.ReactNode}): React.JSX.Element {
  return (
      <WaterProvider>
        <SessionProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </SessionProvider>
      </WaterProvider>
  );
}