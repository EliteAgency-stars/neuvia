import { docRoute } from "@/components/DocPage";
import { solutions } from "@/content/pages";

const route = docRoute(solutions);
export const generateMetadata = route.generateMetadata;
export default route.Page;
