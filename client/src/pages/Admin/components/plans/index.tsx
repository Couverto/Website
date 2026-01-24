import { DataTable } from "@/components/customs/dataTable";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useColumns } from "./columns";
import { axiosConfig } from "@/config/axiosConfig";
import { Plan } from "@/interfaces/Plan";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlanForm } from "./planForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AdminPlans = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [dataCount, setDataCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>(undefined);
  const [action, setAction] = useState("");

  const fetchPlans = async (pageIndex: number, pageSize: number) => {
    setLoading(true);
    try {
      const response = await axiosConfig.get(`/plans?page=${pageIndex}&size=${pageSize}`);
      setPlans(response.data.plans);
      setDataCount(response.data.count);
    } catch (error) {
      console.error(error);
      toast.error(t("server.admin.errors.log_not_found")); // fallback error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans(0, 10);
  }, []);

  const openCreateDialog = () => {
    setSelectedPlan(undefined);
    setAction("create");
    setIsDialogOpen(true);
  };

  const openEditDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setAction("update");
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setAction("delete");
    setIsDialogOpen(true);
  };

  const columns = useColumns(openEditDialog, openDeleteDialog);

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t("pages.admin.plans_page.plans")}</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<Plan, any>
              columns={columns}
              data={plans}
              dataCount={dataCount}
              fetchData={fetchPlans}
              searchElement="name"
              isLoading={loading}
              actions={["create"]}
              callback={(action) => {
                if (action === "create") {
                  openCreateDialog();
                }
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t(`pages.admin.plans_page.actions_type.${action}`)} {t("pages.admin.plans_page.a_plan")}
            </DialogTitle>
          </DialogHeader>
          <PlanForm dialog={setIsDialogOpen} refresh={() => fetchPlans(0, 10)} action={action} plan={selectedPlan} />
        </DialogContent>
      </Dialog>
    </>
  );
};
