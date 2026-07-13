# Release and smoke proof

Release SHA: `04196921264d9897e8e547a8e0a2cef1ad43f8fb`  
Result: PASS

PR #2 merged the ProofBook tree to `main`. GitHub Actions run [29226016156](https://github.com/ryanholtschneider2/soloco-product-build-v2-dogfood/actions/runs/29226016156) completed CI, Pages deployment, and post-deploy smoke successfully. The live identity route returned `product_id=proofbook` and the full release SHA. A fresh browser then completed the customer journey and same-browser restore against that deployment.

The implementation source, squash-integration, and squash-release commits are not ancestors because both PRs used squash merge. Their Git trees are byte-identical at `c74f8c45c62c422f2269b59d17478a03bdfa967e`; this is recorded explicitly instead of claiming false ancestry.
