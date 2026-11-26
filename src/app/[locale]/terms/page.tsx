import { docRoute } from "@/components/DocPage";
import { terms } from "@/content/company";

const route = docRoute(terms);
export const generateMetadata = route.generateMetadata;
export default route.Page;
