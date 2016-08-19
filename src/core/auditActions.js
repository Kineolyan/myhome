function auditItem(item) {
  const now = Date.now();

  if (item.id === undefined) {
    item.createdAt = now;
  }
  item.updatedAt = now;

  return item;
}

export {
  auditItem
};
