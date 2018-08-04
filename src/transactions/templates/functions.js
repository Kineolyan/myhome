const computeDateByFrequency = (input, {type}) => {
  // Set the current month and year for the date
  const date = new Date(input)
  const now = new Date();
  if (type === 'monthly') {
    date.setFullYear(now.getFullYear());
    date.setMonth(now.getMonth());
    if (now < date) {
      // Set a template for end of month at a beginnning of a month
      date.setMonth(date.getMonth() - 1);
    }
  } else {
    throw new Error(`Unsupported frequency ${type}`);
  }
  return date;
};

const applyTemplate = (base, template) => {
  const id = base.id;
  const element = {...base, ...template};
  if (id !== undefined) {
    // Restore id if any
    element.id = id;
  }
  element.templateId = template.id;

  if (template.frequency) {
    // Remove the frequency attribute and change the date
    element.date = computeDateByFrequency(template.date, template.frequency);
    Reflect.deleteProperty(element, 'frequency');
  } else {
    element.date = element.date !== undefined ?
      new Date(element.date) : new Date();
  }

  return element;
}

export {
  applyTemplate
};
