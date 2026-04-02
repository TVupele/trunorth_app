import { create } from 'zustand';
import api from '@/lib/api';
import { devtools } from 'zustand/middleware';
import type { Transaction } from '@/lib/index';

interface WalletData {
  id: string;
  balance: number;
  currency: string;
  updated_at: string;
}

interface WalletState {
  wallet: WalletData | null;
  balance: number;
  currency: string;
  transactions: Transaction[];
  monthlySpending: { month: string; spending: number }[];
  isLoading: boolean;
  error: string | null;
  fetchWalletData: () => Promise<void>;
  getTransactionHistory: () => Transaction[];
  topUp: (amount: number) => void;
  sendMoney: (recipient: string, amount: number, description: string) => void;
  requestMoney: (recipient: string, amount: number, description: string) => void;
  clearError: () => void;
  addTransaction: (txn: Transaction) => void;
}

export const useWallet = create<WalletState>()(
  devtools(
    (set, get) => ({
      wallet: null,
      balance: 0,
      currency: 'NGN',
      transactions: [],
      monthlySpending: [],
      isLoading: false,
      error: null,

      fetchWalletData: async () => {
        set({ isLoading: true, error: null });
        try {
          const [walletRes, transactionsRes, monthlySpendingRes] = await Promise.all([
            api.get('/wallet'),
            api.get('/wallet/transactions'),
            api.get('/wallet/monthly-spending'),
          ]);

          const wallet = walletRes.data;
          set({
            wallet,
            balance: wallet.balance,
            currency: wallet.currency,
            transactions: transactionsRes.data,
            monthlySpending: monthlySpendingRes.data,
            isLoading: false,
          });
        } catch (err: any) {
          set({
            error: err.response?.data?.error || 'Failed to fetch wallet data.',
            isLoading: false,
          });
        }
      },

      getTransactionHistory: () => {
        return get().transactions;
      },

      topUp: (amount: number) => {
        const state = get();
        const newTransaction: Transaction = {
          id: `txn-${Date.now()}`,
          type: 'top-up',
          amount,
          currency: state.currency,
          description: 'Wallet top-up',
          status: 'completed',
          timestamp: new Date().toISOString(),
        };
        set({
          balance: state.balance + amount,
          transactions: [newTransaction, ...state.transactions],
          wallet: state.wallet
            ? { ...state.wallet, balance: state.balance + amount }
            : null,
        });
      },

      sendMoney: (recipient: string, amount: number, description: string) => {
        const state = get();
        if (amount > state.balance) {
          set({ error: 'Insufficient balance.' });
          return;
        }
        const newTransaction: Transaction = {
          id: `txn-${Date.now()}`,
          type: 'send',
          amount,
          currency: state.currency,
          recipient,
          description: description || `Sent to ${recipient}`,
          status: 'completed',
          timestamp: new Date().toISOString(),
        };
        set({
          balance: state.balance - amount,
          transactions: [newTransaction, ...state.transactions],
          wallet: state.wallet
            ? { ...state.wallet, balance: state.balance - amount }
            : null,
        });
      },

      requestMoney: (recipient: string, amount: number, description: string) => {
        const state = get();
        const newTransaction: Transaction = {
          id: `txn-${Date.now()}`,
          type: 'request',
          amount,
          currency: state.currency,
          recipient,
          description: description || `Requested from ${recipient}`,
          status: 'requested',
          timestamp: new Date().toISOString(),
        };
        set({
          transactions: [newTransaction, ...state.transactions],
        });
      },

      clearError: () => {
        set({ error: null });
      },

      addTransaction: (txn: Transaction) => {
        set((state) => ({
          transactions: [txn, ...state.transactions],
        }));
      },
    }),
    { name: 'wallet-storage' }
  )
);
