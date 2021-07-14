import { MockMatcher } from 'fetch-mock';

export function formDataMatcher(values: Record<string, FormDataEntryValue>): MockMatcher {
  return (url, req) => {
    // Check if the request body is a form data object.
    if (!(req.body instanceof FormData)) {
      return false;
    }
    // Check if the values has the same amount of entries as the body.
    if (Object.keys(values).length !== Array.from(req.body.keys()).length) {
      return false;
    }
    // Check if all values match the values in the body.
    for (const key in values) {
      if (values.hasOwnProperty(key) && req.body.get(key) !== values[key]) {
        return false;
      }
    }
    return true;
  };
}
