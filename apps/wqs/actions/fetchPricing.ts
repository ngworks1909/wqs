import prisma from "@repo/db/client";

export async function fetchPricing(){
    try {
        const tests = await prisma.test.findMany({
            select: {
                name: true,
                price: true,
                description: true,
                _count: {
                    select: {
                        sampleTests: true
                    }
                }
            }
        })
        return tests;
    } catch (error) {
        console.log(error);
        return []
    }
}