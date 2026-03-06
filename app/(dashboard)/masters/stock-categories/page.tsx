import { SimpleMasterPage } from "@/components/SimpleMasterPage";

export default function StockCategoriesPage() {
    return <SimpleMasterPage title="Stock Categories" breadcrumb={["Masters", "Stock Categories"]} entity="stock-categories" addLabel="Add Category" />;
}
