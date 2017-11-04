import {auditItem} from './auditActions';

function identity(value) {
  return value;
}

function prepareElement(editedElement, originalElement, format = identity) {
  const element = {...editedElement};
  if (originalElement.id !== undefined) {
    element.id = originalElement.id;
  }

  const formatedElement = format(element);
  return auditItem(formatedElement);
}

function logFailedSubmit(error, element) {
  console.error('Cannot save', element, error);
}

function submitElement(editedElement, doSave, onElementSaved, afterSave, onFailure = logFailedSubmit) {
  return doSave(editedElement);
  // FIXME cannot do the then/catch part as there is no promise
    // .then(result => onElementSaved(result))
    // .then(result => afterSave(result))
    // .catch(err => onFailure(err, editedElement));
}

export {
  prepareElement,
  submitElement,
  logFailedSubmit
};
