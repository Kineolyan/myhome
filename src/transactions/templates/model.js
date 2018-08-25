const TemplateType = {
	FREQUENCY: 'frequency',
	PREFILL: 'pre-fill'
};

const Frequency = {
	MONTHLY: 'monthly'
};

const detectType = (template) => {
	if (template === undefined) {
		return undefined;
	} else if (template.frequency) {
		return TemplateType.FREQUENCY;
	} else {
		return TemplateType.PREFILL;
	}
}

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
  const transaction = {...base, ...template};
  if (id !== undefined) {
    // Restore id if any
    transaction.id = id;
  }
  transaction.templateId = template.id;

  const type = detectType(template);
  if (type === TemplateType.FREQUENCY) {
    // Remove the frequency attribute and change the date
    transaction.date = computeDateByFrequency(template.date, template.frequency);
    Reflect.deleteProperty(transaction, 'frequency');
  } else {
    transaction.date = transaction.date !== undefined ?
      new Date(transaction.date) : new Date();
  }

  return transaction;
}

export {
  TemplateType,
  Frequency,
  applyTemplate,
  detectType
};
