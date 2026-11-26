import { docRoute } from "@/components/DocPage";
import { security } from "@/content/company";

const route = docRoute(security);
export const generateMetadata = route.generateMetadata;
export default route.Page;
