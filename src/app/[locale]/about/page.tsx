import { docRoute } from "@/components/DocPage";
import { about } from "@/content/company";

const route = docRoute(about);
export const generateMetadata = route.generateMetadata;
export default route.Page;
