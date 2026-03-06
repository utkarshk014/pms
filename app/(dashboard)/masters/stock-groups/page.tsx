import { SimpleMasterPage } from "@/components/SimpleMasterPage";

export default function StockGroupsPage() {
    return <SimpleMasterPage title="Stock Groups" breadcrumb={["Masters", "Stock Groups"]} entity="stock-groups" addLabel="Add Group" />;
}
