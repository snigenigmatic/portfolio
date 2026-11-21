---
title: "Adding a write-ahead log to a toy database"
date: 2026-12-04
updated: 2026-12-06
summary: "Crash safety from first principles: what fsync promises, and what it doesn't."
track: technical
visibility: public
tags: [databases, storage]
project: qwen-cuda
---

A test post. It has [an internal link](/contact.html) and [an external one](https://example.com).

## Why a log

Writes go to the log first.[^fsync] Then the page.

```cpp
void commit(Txn& t) { wal.append(t.records()); wal.fsync(); }
```

## Why a log

Duplicate heading to check unique anchors. Inline `code` too.

![A diagram](images/diagram.png "The WAL sits in front of the pages")

> A quote that mentions `</script>` and <b>bold</b> raw HTML.

| Step | Cost |
|---|---|
| append | cheap |

[^fsync]: fsync is where the time goes.
