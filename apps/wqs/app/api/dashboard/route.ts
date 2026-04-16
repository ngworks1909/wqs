import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import prisma from "@repo/db/client";
import { PaymentStatus, ReportStatus, Role, TestRequestStatus, TestResultStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

function getMonthRange(monthOffset = 0) {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0, 23, 59, 59);
  return { start: firstDay, end: lastDay };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    if (!session || !session.user || !session.user.id || session.user.role !== Role.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { start: currentMonthStart, end: currentMonthEnd } = getMonthRange(0);
    const { start: prevMonthStart, end: prevMonthEnd } = getMonthRange(-1);

    /** -------------------- Test Requests -------------------- **/
    const testRequestsThisMonth = await prisma.testRequest.findMany({
      where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } },
      select: { status: true, overallResult: true, waterType: { select: { name: true } } },
    });

    const prevMonthCount = await prisma.testRequest.count({
      where: { createdAt: { gte: prevMonthStart, lte: prevMonthEnd } },
    });

    const testRequestByStatus: Record<TestRequestStatus, number> = Object.fromEntries(
      Object.values(TestRequestStatus).map(status => [
        status,
        testRequestsThisMonth.filter(r => r.status === status).length,
      ])
    ) as Record<TestRequestStatus, number>;

    /** -------------------- Payments -------------------- **/
    const paymentsThisMonth = await prisma.payment.findMany({
      where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } },
      select: { amount: true, status: true },
    });

    const lastMonthPaymentSumAggregation = await prisma.payment.aggregate({
      where: { createdAt: { gte: prevMonthStart, lte: prevMonthEnd } },
      _sum: { amount: true },
    })

    const lastMonthPaymentTotal = lastMonthPaymentSumAggregation._sum.amount ?? 0;

    const totalRevenueThisMonth = paymentsThisMonth.reduce((acc, p) => acc + p.amount, 0);
    const paymentsByStatus = Object.fromEntries(
      Object.values(PaymentStatus).map(status => [
        status,
        paymentsThisMonth.filter(p => p.status === status).length,
      ])
    ) as Record<PaymentStatus, number>;

    const newUsersThisMonth = await prisma.user.count({
      where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd }, role: Role.user },
    });

    const userCount = await prisma.user.count();

    /** -------------------- Top Users & Technicians -------------------- **/
    const mostActiveUsers = await prisma.testRequest.groupBy({
      by: ["userId"],
      _count: { userId: true },
      where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } },
      orderBy: { _count: { userId: "desc" } },
      take: 2,
    });

    const mostActiveUsersWithDetails = await Promise.all(
      mostActiveUsers.map(async u => {
        const user = await prisma.user.findUnique({ where: { userId: u.userId }, select: { username: true, email: true } });
        return { userId: u.userId, username: user?.username as string, email: user?.email as string, requestCount: u._count.userId };
      })
    );

    const topTechnicians = await prisma.testRequest.groupBy({
      by: ["testerId"],
      _count: { testerId: true },
      where: {
        createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
        status: TestRequestStatus.Completed,
        testerId: { not: null },
      },
      orderBy: { _count: { testerId: "desc" } },
      take: 2,
    });

    const topTechniciansWithDetails = await Promise.all(
      topTechnicians.map(async t => {
        const tech = await prisma.user.findUnique({ where: { userId: t.testerId! }, select: { username: true, email: true } });
        return { userId: t.testerId!, username: tech?.username as string, email: tech?.email as string, solvedRequestCount: t._count.testerId };
      })
    );



    /** -------------------- Final Response -------------------- **/
    const response = {
      kpi: {
        testRequests: {
          currentMonthTestRequestsCount: testRequestsThisMonth.length,
          prevMonthCount
        },
        users: {
          currentMonthNewUsersCount: newUsersThisMonth,
          userCount,
        },
        payments: {
          currentMonthRevenue: totalRevenueThisMonth,
          lastMonthPaymentTotal,
        }
      },
      testRequestByStatus,
      paymentsByStatus,
      topTechnicians: topTechniciansWithDetails,
      mostActiveUsers: mostActiveUsersWithDetails,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}