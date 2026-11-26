---
title: Black-box and white-box approaches to AI diagnostics
description: What can be learned from observable behavior alone, what requires operational telemetry, and what only internal access makes possible.
category: Mechanistic Interpretability
date: 2026-11-26
readingTime: 5
---

How much can you learn about an AI system without looking inside it? It depends on the question — and on the access its operator grants.

## Black-box: behavior only

With access only to inputs and outputs, it is still possible to measure a great deal: factual accuracy on verifiable tasks, consistency across rephrasings, contradiction rates, robustness to perturbation, latency and response patterns. Sampling-based consistency methods can flag likely hallucinations without internal access.

The limit: black-box methods detect *that* something is wrong far more easily than *why*.

## Grey-box: operational telemetry

Logs, tool-call traces, token-level probabilities and performance metrics add attribution. With probabilities, calibration can be measured directly using metrics such as Expected Calibration Error (Guo et al., 2017) or the Brier score (Brier, 1950). With execution traces, a silent tool failure can be distinguished from a reasoning error.

## White-box: internal representations

Mechanistic interpretability studies the internal computations of neural networks — features, circuits and representations (Olah et al., 2020; Templeton et al., 2024). Work such as Burns et al. (2022) showed that latent structure in activations can carry information about truthfulness that is not always reflected in outputs.

White-box access makes it possible, in principle, to connect a behavioral anomaly to an internal mechanism. It is also the most demanding level: it requires model weights or activation access, significant compute and careful methodology.

## NEUVIA's position

NEUVIA is designed to work at all three levels, but **only at the level the operator authorizes**. It cannot obtain internal access by conversing with a model, and it does not try. For most proprietary systems, black- and grey-box methods will be the realistic starting point; white-box research is best pursued with open models and research partners.
