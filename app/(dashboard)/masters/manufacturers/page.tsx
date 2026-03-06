import { SimpleMasterPage } from "@/components/SimpleMasterPage";

export default function ManufacturersPage() {
    return <SimpleMasterPage title="Manufacturers" breadcrumb={["Masters", "Manufacturers"]} entity="manufacturers" addLabel="Add Manufacturer" />;
}
