import prisma from "@repo/db/client";
import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params

  const report = await prisma.testRequest.findUnique({
    where: { requestId },
    select: {
      requestId: true,
      overallResult: true,
      createdAt: true,
      location: true,
      sampleLocation: true,
      waterType: {
        select: { name: true },
      },
      sampleTests: {
        select: {
          testName: true,
          minValueUsed: true,
          maxValueUsed: true,
          unitUsed: true,
          result: true,
        },
      },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const html = `
  <html>
  <head>
    <style>
      body { font-family: Arial; padding: 30px; }
      h1 { text-align: center; }
      table { width: 100%; border-collapse: collapse; margin-top:20px;}
      th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
    </style>
  </head>
  <body>
    <h1>Water Quality Report</h1>

    <p><b>Request ID:</b> ${report.requestId}</p>
    <p><b>Location:</b> ${report.location}</p>
    <p><b>Sample Location:</b> ${report.sampleLocation}</p>
    <p><b>Water Type:</b> ${report.waterType.name}</p>
    <p><b>Overall Status:</b> ${report.overallResult ?? "Pending"}</p>

    <table>
      <tr>
        <th>Test</th>
        <th>Range</th>
        <th>Result</th>
      </tr>

      ${report.sampleTests
        .map(
          (t) => `
        <tr>
          <td>${t.testName}</td>
          <td>${t.minValueUsed}-${t.maxValueUsed} ${t.unitUsed}</td>
          <td>${t.result ?? "Pending"}</td>
        </tr>
      `
        )
        .join("")}
    </table>
  </body>
  </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=report-${requestId}.pdf`,
    },
  });
}