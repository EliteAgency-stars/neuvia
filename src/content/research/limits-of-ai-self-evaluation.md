---
title: The limits of AI self-evaluation
description: Language models can sometimes estimate their own correctness, but self-assessment has documented limits. That is why NEUVIA relies on independent evaluators.
category: Artificial Metacognition
date: 2026-11-26
readingTime: 6
---

Can a model tell when it is wrong? The answer from current research is nuanced: *sometimes, partially, and not reliably enough to stand alone.*

## Evidence that models know something about what they know

Kadavath et al. (2022) found that large language models can be reasonably well calibrated on certain multiple-choice formats and can be trained to predict whether they will answer a question correctly. Related work has explored detecting hallucinations by measuring the consistency of multiple sampled answers — for example SelfCheckGPT (Manakul et al., 2023) and semantic-entropy methods (Farquhar et al., 2024).

These results suggest that useful signals about correctness exist, and can be extracted.

## Evidence of the limits

Other work urges caution. Huang et al. (2023) reported that, without external feedback, large language models struggled to self-correct their reasoning, and that performance could even degrade after self-correction attempts. Calibration measured on one distribution does not necessarily transfer to another, and verbal expressions of confidence do not always track accuracy.

## Implications for NEUVIA's design

1. **Independent evaluators, not self-report alone.** NEUVIA Reflect treats a system's self-assessment as one signal among several, combined with evaluators that do not share the same weights or context.
2. **Disagreement is information.** When evaluators disagree, the right response is often to surface uncertainty or escalate to a human, not to pick a winner silently.
3. **No access to private reasoning is assumed.** NEUVIA does not presume access to hidden chains of thought or internal states of proprietary models. Where white-box access is authorized — typically with open models — internal signals can complement behavioral ones.
4. **Evaluators must be evaluated.** Every evaluator has its own error rate, which must be measured and reported.

Self-evaluation is a promising ingredient of artificial metacognition. It is not, on its own, oversight.
