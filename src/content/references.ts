import type { Ref } from "./types";

/**
 * Published external research referenced on the site.
 * Only well-established works with stable identifiers are listed.
 * NOTE: live re-verification of each link must be repeated before launch
 * (see docs/VERIFICATION.md) — arXiv was not reachable from the build environment.
 */
export const REFS: Record<string, Ref> = {
  truthfulqa: { authors: "Lin, S., Hilton, J., Evans, O.", title: "TruthfulQA: Measuring How Models Mimic Human Falsehoods", venue: "ACL 2022 · arXiv:2109.07958", year: "2022", url: "https://arxiv.org/abs/2109.07958" },
  helm: { authors: "Liang, P., Bommasani, R., Lee, T., et al.", title: "Holistic Evaluation of Language Models", venue: "TMLR · arXiv:2211.09110", year: "2023", url: "https://arxiv.org/abs/2211.09110" },
  longbench: { authors: "Bai, Y., Lv, X., Zhang, J., et al.", title: "LongBench: A Bilingual, Multitask Benchmark for Long Context Understanding", venue: "arXiv:2308.14508", year: "2023", url: "https://arxiv.org/abs/2308.14508" },
  lostmiddle: { authors: "Liu, N. F., Lin, K., Hewitt, J., et al.", title: "Lost in the Middle: How Language Models Use Long Contexts", venue: "TACL · arXiv:2307.03172", year: "2024", url: "https://arxiv.org/abs/2307.03172" },
  calibration: { authors: "Guo, C., Pleiss, G., Sun, Y., Weinberger, K. Q.", title: "On Calibration of Modern Neural Networks", venue: "ICML 2017 · arXiv:1706.04599", year: "2017", url: "https://arxiv.org/abs/1706.04599" },
  brier: { authors: "Brier, G. W.", title: "Verification of Forecasts Expressed in Terms of Probability", venue: "Monthly Weather Review 78(1)", year: "1950", url: "https://doi.org/10.1175/1520-0493(1950)078%3C0001:VOFEIT%3E2.0.CO;2" },
  knowwhat: { authors: "Kadavath, S., Conerly, T., Askell, A., et al.", title: "Language Models (Mostly) Know What They Know", venue: "arXiv:2207.05221", year: "2022", url: "https://arxiv.org/abs/2207.05221" },
  judge: { authors: "Zheng, L., Chiang, W.-L., Sheng, Y., et al.", title: "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena", venue: "NeurIPS 2023 Datasets & Benchmarks · arXiv:2306.05685", year: "2023", url: "https://arxiv.org/abs/2306.05685" },
  selfcorrect: { authors: "Huang, J., Chen, X., Mishra, S., et al.", title: "Large Language Models Cannot Self-Correct Reasoning Yet", venue: "ICLR 2024 · arXiv:2310.01798", year: "2024", url: "https://arxiv.org/abs/2310.01798" },
  selfcheck: { authors: "Manakul, P., Liusie, A., Gales, M. J. F.", title: "SelfCheckGPT: Zero-Resource Black-Box Hallucination Detection for Generative Large Language Models", venue: "EMNLP 2023 · arXiv:2303.08896", year: "2023", url: "https://arxiv.org/abs/2303.08896" },
  semantic: { authors: "Farquhar, S., Kossen, J., Kuhn, L., Gal, Y.", title: "Detecting hallucinations in large language models using semantic entropy", venue: "Nature 630", year: "2024", url: "https://doi.org/10.1038/s41586-024-07421-0" },
  concrete: { authors: "Amodei, D., Olah, C., Steinhardt, J., et al.", title: "Concrete Problems in AI Safety", venue: "arXiv:1606.06565", year: "2016", url: "https://arxiv.org/abs/1606.06565" },
  latent: { authors: "Burns, C., Ye, H., Klein, D., Steinhardt, J.", title: "Discovering Latent Knowledge in Language Models Without Supervision", venue: "ICLR 2023 · arXiv:2212.03827", year: "2023", url: "https://arxiv.org/abs/2212.03827" },
  circuits: { authors: "Olah, C., Cammarata, N., Schubert, L., et al.", title: "Zoom In: An Introduction to Circuits", venue: "Distill", year: "2020", url: "https://distill.pub/2020/circuits/zoom-in/" },
  monosemanticity: { authors: "Templeton, A., Conerly, T., Marcus, J., et al.", title: "Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet", venue: "Transformer Circuits Thread", year: "2024", url: "https://transformer-circuits.pub/2024/scaling-monosemanticity/" },
  nistrmf: { authors: "National Institute of Standards and Technology", title: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)", venue: "NIST AI 100-1", year: "2023", url: "https://doi.org/10.6028/NIST.AI.100-1" },
};

export const refs = (...keys: (keyof typeof REFS)[]) => keys.map((k) => REFS[k]);
