"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { Socket } from "socket.io-client";
import { connectSocket } from "@/lib/socket";
import { MessageType, UpdatePaymentFailureEvent, UpdatePaymentSuccessEvent, UpdateRequestCountEvent, UserSignupEvent } from "@repo/datatypes";
import { useSession } from "next-auth/react";
import { Role, TestRequestStatus } from "@prisma/client";
import { useDashboardState } from "@/atoms/DashboardStata";


const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();

  const [socket, setSocket] = useState<Socket | null>(null);
  const {setData} = useDashboardState();

  const user = session?.user as any;

  useEffect(() => {

    console.log("user token: ",user);
    if (status !== "authenticated") return;
    if (!user?.token) return;
    if (user.role !== Role.admin) return;

    const sock = connectSocket(user.token);

    sock.on(MessageType.connection, () => {
      console.log("✅ Connected to WS");
    });

    sock.on(MessageType.disconnect, () => {
      console.log("❌ Disconnected");
    });

    sock.on(MessageType.connect_error, (err) => {
      console.log("🚨 WS Error:", err.message);
    });

    sock.on(MessageType.update_request_count, (data: string) => {
        const payload: UpdateRequestCountEvent = JSON.parse(data);
        if(payload.action === MessageType.update_request_count){
            const data = payload.data;
            if(data.previousStatus === null && data.status === TestRequestStatus.Pending){
                const count = data.count;
                setData((prev) => ({
                    ...prev,
                    kpi: {
                        ...prev.kpi,
                        testRequests: {
                            ...prev.kpi.testRequests,
                            currentMonthTestRequestsCount: prev.kpi.testRequests.currentMonthTestRequestsCount + count
                        }
                    },
                    testRequestByStatus: {
                        ...prev.testRequestByStatus,
                        Pending: prev.testRequestByStatus.Pending + count
                    }
                }))
            }
            else{
                const count = data.count;
                const prevStatus: TestRequestStatus = data.previousStatus as TestRequestStatus;
                const status: TestRequestStatus = data.status
                setData((prev) => ({
                    ...prev,
                    testRequestByStatus: {
                        ...prev.testRequestByStatus,
                        [prevStatus]: prev.testRequestByStatus[prevStatus] - count,
                        [status]: prev.testRequestByStatus[status] + count
                    }
                }))
            }
        }
    });

    sock.on(MessageType.user_signup, (data: string) => {
        const payload: UserSignupEvent = JSON.parse(data);
        if(payload.action === MessageType.user_signup){
            setData((prev) => ({
                ...prev,
                kpi: {
                    ...prev.kpi,
                    users: {
                        ...prev.kpi.users,
                        currentMonthNewUsersCount: prev.kpi.users.currentMonthNewUsersCount + 1
                    }
                }
            }))
        }
    });

    sock.on(MessageType.update_payment_success, (data: string) => {
        const payload: UpdatePaymentSuccessEvent = JSON.parse(data);
        if(payload.action === MessageType.update_payment_success){
            const amount = payload.data.amount
            setData((prev) => ({
                ...prev,
                kpi: {
                    ...prev.kpi,
                    payments: {
                        ...prev.kpi.payments,
                        currentMonthRevenue: prev.kpi.payments.currentMonthRevenue + amount
                    }
                }
            }))
        }
    })

    sock.on(MessageType.update_payment_failure, (data: string) => {
        const payload: UpdatePaymentFailureEvent = JSON.parse(data);
        if(payload.action === MessageType.update_payment_failure){
            setData((prev) => ({
                ...prev,
                paymentsByStatus: {
                    ...prev.paymentsByStatus,
                    Failed: prev.paymentsByStatus.Failed + 1
                }
            }))
        }
    });

    setSocket(sock);

    return () => {
      sock.disconnect();
    };
  }, [session, status]);

  return (
    <SocketContext.Provider value={ socket }>
      {children}
    </SocketContext.Provider>
  );
};