"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addExpense(data: {
  title: string;
  amount: number;
  type: string;
  frequency: string;
  date: Date;
}) {
  await prisma.expense.create({
    data,
  });
  revalidatePath("/expenses");
  revalidatePath("/");
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({
    where: { id },
  });
  revalidatePath("/expenses");
  revalidatePath("/");
}

export async function getExpenses() {
  return await prisma.expense.findMany({
    orderBy: { date: "desc" },
  });
}
