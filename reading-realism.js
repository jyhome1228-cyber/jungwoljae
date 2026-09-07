(() => {
  // Legacy cleanup only. The previous generic enhancer could place the same
  // work/research examples inside unrelated reports such as relationship.
  // Never inject new interpretation text here; only remove stale blocks.
  document.querySelectorAll('.realism-note').forEach(node=>node.remove());
})();
