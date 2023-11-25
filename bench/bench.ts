import { performance } from "perf_hooks";
import { toOpenAPIPath, toOpenAPIPathV2 } from "src/utils/export";

const testPerformance = (
  func: Function,
  url: string,
  iterations: number = 1000000,
) => {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    func(url);
  }

  const end = performance.now();

  console.log(`Execution time for ${func.name}: ${end - start} milliseconds`);
};

// Use the function
const url = "https://example.com/path/to/resource?query=param";
testPerformance(toOpenAPIPath, url);
testPerformance(toOpenAPIPathV2, url);
