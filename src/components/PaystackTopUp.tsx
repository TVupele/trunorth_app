import { usePaystackPayment } from 'react-paystack';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PaystackTopUpProps {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

const PaystackTopUp = ({ amount, onSuccess, onClose }: PaystackTopUpProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const config = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || '',
    amount: amount,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxx',
  };

  const initializePayment = usePaystackPayment(config);

  const handlePayment = () => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'Please log in to make a payment.',
        variant: 'destructive',
      });
      return;
    }
    initializePayment(onSuccess, onClose);
  };

  return (
    <Button onClick={handlePayment} disabled={!amount || amount <= 0}>
      Top Up with Paystack
    </Button>
  );
};

export default PaystackTopUp;
