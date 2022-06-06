export function asyncFallbackDecorator(
  responseTimeoutMs: number,
  defaultResponse = [],
  cacheTimeoutMs: number = 60 * 60 * 1000,
) {
  const cache = new Map();

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    let invalidateCacheTimer;

    descriptor.value = function (...args) {
      const cacheKey: string = propertyKey + JSON.stringify(args);

      return new Promise((resolve) => {
        let currentResult;
        const timer = setTimeout(() => {
          // TODO add logger here console.log('use fallback after timeout', { currentResult, cache: cache.get(cacheKey), result: currentResult || cache.get(cacheKey) || [] });
          resolve(currentResult || cache.get(cacheKey) || defaultResponse);
        }, responseTimeoutMs);

        method
          .apply(this, args)
          .then((res) => {
            currentResult = res;
            cache.set(cacheKey, res);
            clearTimeout(timer);
            resolve(currentResult);

            clearTimeout(invalidateCacheTimer);
            invalidateCacheTimer = setTimeout(() => {
              cache.delete(cacheKey);
            }, cacheTimeoutMs);
          })
          .catch(() => {
            // TODO add logger here console.warn(err);
          });
      });
    };
  };
}
