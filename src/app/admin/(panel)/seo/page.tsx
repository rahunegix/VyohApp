import { SeoAdminPanel } from "@/components/admin/seo-admin-panel";
import { getAllSeoPagesAdmin } from "@/lib/seo/service";

export default async function AdminSeoPage() {
  const pages = await getAllSeoPagesAdmin();
  return <SeoAdminPanel initialPages={pages} />;
}
