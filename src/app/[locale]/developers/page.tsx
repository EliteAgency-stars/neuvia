import { docRoute } from "@/components/DocPage";
import { developers } from "@/content/pages";

const route = docRoute(developers);
export const generateMetadata = route.generateMetadata;
export default route.Page;
