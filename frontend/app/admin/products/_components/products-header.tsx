import { Plus } from "lucide-react";
import { Button } from "@/app/_components/button";

interface ProductsHeaderProps {
    onCreate: () => void;
}

export function ProductsHeader({ onCreate }: ProductsHeaderProps) {
    return (
        <div className="mb-8 flex items-center justify-between gap-4">
            <div>
                <p className="eyebrow mb-2">Catalog</p>
                <h1 className="h1">Products</h1>
            </div>
            <Button onClick={onCreate}>
                <Plus size={16} /> New product
            </Button>
        </div>
    );
}
