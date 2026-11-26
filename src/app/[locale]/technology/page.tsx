import { docRoute } from "@/components/DocPage";
import { technology } from "@/content/pages";

const route = docRoute(technology);
export const generateMetadata = route.generateMetadata;
export default route.Page;
