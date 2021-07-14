import { MockMatcher } from 'fetch-mock';

export function formDataMatcher(values: Record<string, FormDataEntryValue>): MockMatcher {
  return (url, req) => {
    // Check if the request body is a form data object.
    if (!(req.body instanceof FormData)) {
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
