"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateIncomeProfile(data: {
  basicPay: number;
  allowances: { label: string; amount: number }[];
  nightDiff: number;
  nightDiffHours: number;
  sss: number;
  pagibig: number;
  philhealth: number;
  tax: number;
}) {
  const profile = await prisma.incomeProfile.findFirst();

  const { allowances, ...rest } = data;

  if (profile) {
    await prisma.$transaction(async (tx) => {
      await tx.incomeProfile.update({
        where: { id: profile.id },
        data: rest,
      });

      await tx.allowance.deleteMany({
        where: { incomeProfileId: profile.id },
      });

      if (allowances.length > 0) {
        await tx.allowance.createMany({
          data: allowances.map((a) => ({
            ...a,
            incomeProfileId: profile.id,
          })),
        });
      }
    });
  } else {
    await prisma.incomeProfile.create({
      data: {
        ...rest,
        allowances: {
          create: allowances,
        },
      },
    });
  }

  revalidatePath("/income");
  revalidatePath("/");
}

export async function getIncomeProfile() {
  return await prisma.incomeProfile.findFirst({
    include: {
      allowances: true,
    },
  });
}
