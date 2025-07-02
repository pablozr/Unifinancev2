'use server'

import { getCashFlowData } from "../_data/getCashFlowData"
import detectRecurringTransactions from "../_data/detectRecurringTransactions"
import { analyzeRecurringPatterns, generateProjection } from "../_utils"
import { ProjectionPoint } from "../_types/projection"

export async function createCashFlowProjection(
    userId: string,
): Promise<ProjectionPoint[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0);

    const allTransactions = await getCashFlowData(userId)

    const initialBalance = allTransactions
        .filter(tx => new Date(tx.date) <= today)
        .reduce((acc, tx) => acc + tx.amount, 0);

    const historicalData = allTransactions.filter(tx => new Date(tx.date) <= today)
    const classified = detectRecurringTransactions(historicalData)
    const recurringTransactions = classified.filter(tx => tx.isRecurring)

    const patterns = analyzeRecurringPatterns(recurringTransactions)

    return generateProjection(initialBalance, patterns)
}