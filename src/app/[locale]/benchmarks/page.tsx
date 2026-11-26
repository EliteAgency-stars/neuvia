import { docRoute } from "@/components/DocPage";
import { benchmarks } from "@/content/pages";

const route = docRoute(benchmarks);
export const generateMetadata = route.generateMetadata;
export default route.Page;
