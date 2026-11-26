import { docRoute } from "@/components/DocPage";
import { privacy } from "@/content/company";

const route = docRoute(privacy);
export const generateMetadata = route.generateMetadata;
export default route.Page;
