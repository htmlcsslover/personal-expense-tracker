"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSavingsGoals() {
  return await prisma.savingsGoal.findMany({
    orderBy: [
      { priority: "asc" },
      { createdAt: "desc" }
    ],
  });
}

export async function addSavingsGoal(data: {
  title: string;
  target: number;
  priority: string;
}) {
  await prisma.savingsGoal.create({
    data: {
      ...data,
      current: 0,
    },
  });
  revalidatePath("/savings");
  revalidatePath("/");
}

import { addExpense } from "../expenses/actions";

export async function updateSavingsBalance(id: string, amount: number, type: "DEPOSIT" | "WITHDRAWAL") {
  const goal = await prisma.savingsGoal.findUnique({
    where: { id },
  });

  if (!goal) throw new Error("Goal not found");

  const newBalance = type === "DEPOSIT" 
    ? goal.current + amount 
    : Math.max(0, goal.current - amount);

  await prisma.savingsGoal.update({
    where: { id },
    data: { current: newBalance },
  });

  // Log as a background transaction to sync with budget
  await addExpense({
    title: `${type === "DEPOSIT" ? "Savings" : "Withdrawal"}: ${goal.title}`,
    amount: type === "DEPOSIT" ? amount : -amount,
    type: "SAVINGS",
    frequency: "ONCE",
    date: new Date(),
  });

  revalidatePath("/savings");
  revalidatePath("/");
}

export async function deleteSavingsGoal(id: string) {
  await prisma.savingsGoal.delete({
    where: { id },
  });
  revalidatePath("/savings");
  revalidatePath("/");
}
