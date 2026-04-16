import { NextResponse } from "next/server";
import prisma from "@repo/db/client";

export async function POST() {
  try {
    const waterTypes = [
  { name: "Rainwater" },
  { name: "Tap Water" },
  { name: "Groundwater" },
  { name: "River Water" },
  { name: "Well Water" },
  { name: "Lake Water" },
  { name: "Seawater" },
  { name: "Borewell Water" },
];

const tests = [
  {
    name: "pH",
    description: "Measures acidity or alkalinity of water",
    price: 50,
    minValue: 6.5,
    maxValue: 8.5,
    unit: "pH",
  },
  {
    name: "Turbidity",
    description: "Measures clarity of water",
    price: 40,
    minValue: 0,
    maxValue: 5,
    unit: "NTU",
  },
  {
    name: "Total Dissolved Solids (TDS)",
    description: "Measures dissolved substances in water",
    price: 60,
    minValue: 50,
    maxValue: 300,
    unit: "mg/L",
  },
  {
    name: "Hardness",
    description: "Measures calcium and magnesium content",
    price: 70,
    minValue: 60,
    maxValue: 200,
    unit: "mg/L",
  },
  {
    name: "Chlorine",
    description: "Measures chlorine level in water",
    price: 50,
    minValue: 0.2,
    maxValue: 0.5,
    unit: "mg/L",
  },
  {
    name: "Dissolved Oxygen",
    description: "Measures oxygen level in water",
    price: 80,
    minValue: 5,
    maxValue: 14,
    unit: "mg/L",
  },
  {
    name: "Nitrate",
    description: "Measures nitrate contamination",
    price: 65,
    minValue: 0,
    maxValue: 45,
    unit: "mg/L",
  },
  {
    name: "Fluoride",
    description: "Measures fluoride level in water",
    price: 55,
    minValue: 0.5,
    maxValue: 1.5,
    unit: "mg/L",
  },
];

    // Insert only if not already present
    const created = [];

    for (const type of waterTypes) {
      const exists = await prisma.waterType.findUnique({
        where: { name: type.name },
      });

      if (!exists) {
        const newType = await prisma.waterType.create({
          data: type,
        });
        created.push(newType);
      }
    }

    for(const test of tests){
        const exists = await prisma.test.findUnique({
            where: {
                name: test.name
            }
        })
        if(!exists){
            await prisma.test.create({
                data: test
            })
        }
    }

    return NextResponse.json({
      message: "Water types seeded successfully",
      data: created,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to seed water types" },
      { status: 500 }
    );
  }
}