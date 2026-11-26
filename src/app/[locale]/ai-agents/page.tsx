import { docRoute } from "@/components/DocPage";
import { aiAgents } from "@/content/pages";

const route = docRoute(aiAgents);
export const generateMetadata = route.generateMetadata;
export default route.Page;
