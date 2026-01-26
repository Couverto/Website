import { DataTable } from "@/components/customs/dataTable";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useColumns } from "./columns";
import { axiosConfig } from "@/config/axiosConfig";
import { Feature } from "@/interfaces/Feature";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FeatureForm } from "./featureForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AdminFeatures = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [dataCount, setDataCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | undefined>(undefined);
  const [action, setAction] = useState("");

  const fetchFeatures = async (pageIndex: number, pageSize: number) => {
    setLoading(true);
    try {
      const response = await axiosConfig.get(`/features?page=${pageIndex}&size=${pageSize}`);
      setFeatures(response.data.features);
      setDataCount(response.data.count);
    } catch (error: any) {
      toast.error(error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures(0, 10);
  }, []);

  const openCreateDialog = () => {
    setSelectedFeature(undefined);
    setAction("create");
    setIsDialogOpen(true);
  };

  const openEditDialog = (feature: Feature) => {
    setSelectedFeature(feature);
    setAction("update");
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (feature: Feature) => {
    setSelectedFeature(feature);
    setAction("delete");
    setIsDialogOpen(true);
  };

  const columns = useColumns(openEditDialog, openDeleteDialog);

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{"Fonctionnalités"}</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<Feature, any>
              columns={columns}
              data={features}
              dataCount={dataCount}
              fetchData={fetchFeatures}
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
              {action === "create" ? "Créer" : action === "update" ? "Modifier" : "Supprimer"} {"une fonctionnalité"}
            </DialogTitle>
          </DialogHeader>
          <FeatureForm dialog={setIsDialogOpen} refresh={() => fetchFeatures(0, 10)} action={action} feature={selectedFeature} />
        </DialogContent>
      </Dialog>
    </>
  );
};
