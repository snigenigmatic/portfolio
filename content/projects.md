---
title: "Projects"
date: 2026-03-14
description: "Selected projects by C Kaustubh — systems, ML, and infrastructure."
---

# Projects

A selection of things I have built. Full source at [github.com/snigenigmatic](https://github.com/snigenigmatic).

---

## [cluster-simulator](https://github.com/snigenigmatic/rust_cluster_simulator)
`rust` `distributed-systems`

Memory-safe distributed system simulator in Rust implementing core Kubernetes cluster management: node registration, pod scheduling, health monitoring, and leader-follower control plane logic. CI via GitHub Actions.

---

## [MediChain-FL](https://github.com/snigenigmatic/MediChain-FL)
`python` `federated-learning` `cryptography`

HIPAA-compliant federated learning system for medical imaging using PyTorch and Flower. Integrated CKKS homomorphic encryption (TenSEAL) and an Ethereum smart contract audit trail. Achieved 93% accuracy on pneumonia detection without exposing raw patient data. CI via GitHub Actions.

---

## [redis-from-scratch](https://github.com/snigenigmatic/redis-from-scratch)
`go` `systems`

Redis-compatible in-memory key-value store in Go with full RESP3 protocol support and Pub-Sub. Deployed as the backing store for a REST API-based Kafka clone. CI via GitHub Actions.

---

## [YAK](https://github.com/snigenigmatic/YAK)
`python` `distributed-systems`

Kafka-clone in Python implementing Pub-Sub, log replication, leader-follower architecture, and offset-based message delivery. CI via GitHub Actions.

---

## [orderbook](https://github.com/snigenigmatic/orderbook)
`c++` `high-performance`

High-performance financial order book in C++20. Benchmarked `std::map` vs `std::vector` matching engines achieving nanosecond-level latencies across x64 and ARM using custom timing utilities.

---

## [code-ronin](https://github.com/snigenigmatic/code-ronin)
`python` `ai-agents`

AI-powered Python debugging game where an agent injects realistic bugs to build library fluency and debugging skill. *Agentathon '26 Winner.*

---

## [InsightInvest](https://github.com/snigenigmatic/InsightInvest)
`python` `ai-agents`

Agentic investment research chatbot performing multi-source analysis on publicly traded companies to generate structured investment outlook reports.
