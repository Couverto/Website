import { axiosConfig } from "@/config/axiosConfig";
import { useState } from "react";
import { toast } from "sonner";
import { getColumns } from "./columns";
import { PaymentInterface } from "@/interfaces/Payment";
import { DataTable } from "@/components/customs/dataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AdminPayments = () => {
  const [payments, setPayments] = useState<PaymentInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentCount, setPaymentCount] = useState(0);

  async function fetchPayments(page: number = 0, size: number = 10) {
    setLoading(true);
    try {
      const response = await axiosConfig.get(`/admin/payments?page=${page}&size=${size}`);
      setPayments(response.data.payments);
      setPaymentCount(response.data.count);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors du chargement des paiements");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{"Historique des Paiements"}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={getColumns()}
            data={payments}
            dataCount={paymentCount}
            fetchData={fetchPayments}
            isLoading={loading}
            callback={() => {}}
            searchElement="planName"
            actions={[]}
          />
        </CardContent>
      </Card>
    </div>
  );
};
