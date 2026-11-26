import { docRoute } from "@/components/DocPage";
import { legal } from "@/content/company";

const route = docRoute(legal);
export const generateMetadata = route.generateMetadata;
export default route.Page;
