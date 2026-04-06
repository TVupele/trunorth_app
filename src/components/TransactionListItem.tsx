import { ArrowUpRight, ArrowDownLeft, Plus, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Transaction, formatCurrency, formatDate, getStatusBadgeVariant } from '@/lib/index';

interface TransactionListItemProps {
  transaction: Transaction;
}

export function TransactionListItem({ transaction }: TransactionListItemProps) {
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'send':
        return <ArrowUpRight className="w-5 h-5 text-destructive" />;
      case 'receive':
        return <ArrowDownLeft className="w-5 h-5 text-chart-2" />;
      case 'request':
        return <ArrowDownLeft className="w-5 h-5 text-blue-500" />;
      case 'top-up':
        return <Plus className="w-5 h-5 text-primary" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-accent" />;
      default:
        return <CreditCard className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getAmountColor = () => {
    switch (transaction.type) {
      case 'send':
      case 'payment':
        return 'text-destructive';
      case 'receive':
      case 'top-up':
        return 'text-chart-2';
      case 'request':
        return 'text-blue-500';
      default:
        return 'text-foreground';
    }
  };

  const getAmountPrefix = () => {
    switch (transaction.type) {
      case 'send':
      case 'payment':
        return '-';
      case 'receive':
      case 'top-up':
      case 'request':
        return '+';
      default:
        return '';
    }
  };

  const getTransactionLabel = () => {
    if (transaction.type === 'send' && transaction.recipient) {
      return `To: ${transaction.recipient}`;
    }
    if (transaction.type === 'receive' && transaction.sender) {
      return `From: ${transaction.sender}`;
    }
    if (transaction.type === 'request' && transaction.sender) {
      return `Request from ${transaction.sender}`;
    }
    return transaction.description;
  };

  return (
    <li className="p-4 hover:bg-muted/50 rounded-lg transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            {getTransactionIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {getTransactionLabel()}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">
                {transaction.timestamp && !isNaN(Date.parse(transaction.timestamp)) 
                  ? formatDate(transaction.timestamp) 
                  : 'Pending'}
              </p>
              <Badge variant={getStatusBadgeVariant(transaction.status)} className="text-xs">
                {transaction.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`font-mono font-semibold text-base ${getAmountColor()}`}>
            {getAmountPrefix()}{formatCurrency(transaction.amount, transaction.currency)}
          </p>
        </div>
      </div>
    </li>
  );
}
