import { TypeSystem } from "@sinclair/typebox/system";

function addValidationFormat(
  format: string,
  check: (value: string) => boolean,
) {
  try {
    TypeSystem.Format(format, check);
  } catch (error) {
    // Already registered
  }
}

export function addValidationFormats() {
  addValidationFormat("email", (value) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(value);
  });

  addValidationFormat("uuid", (value) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  });

  addValidationFormat("time", (value) => {
    return !Number.isNaN(new Date(`1970-01-01T${value}`).getTime());
  });

  addValidationFormat("date", (value) => {
    return !Number.isNaN(new Date(value).getTime());
  });

  addValidationFormat("date-time", (value) => {
    return !Number.isNaN(new Date(value).getTime());
  });

  addValidationFormat("url", (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  });

  addValidationFormat("uri", (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  });

  addValidationFormat("ipv4", (value) => {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(value);
  });

  addValidationFormat("ipv6", (value) => {
    return /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/.test(value);
  });

  addValidationFormat("emoji", (value) => {
    return /^[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u.test(
      value,
    );
  });

  addValidationFormat("cuid", (value) => {
    return /^c[0-9a-z]{7}$/.test(value);
  });

  addValidationFormat("slug", (value) => {
    return /^[a-z0-9-]+$/.test(value);
  });

  addValidationFormat("alpha", (value) => {
    return /^[a-z]+$/i.test(value);
  });

  addValidationFormat("alphanumeric", (value) => {
    return /^[a-z0-9]+$/i.test(value);
  });

  addValidationFormat("numeric", (value) => {
    return /^[0-9]+$/.test(value);
  });

  addValidationFormat("ip", (value) => {
    return (
      /^(\d{1,3}\.){3}\d{1,3}$/.test(value) ||
      /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/.test(value)
    );
  });
}
