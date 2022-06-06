import { asyncFallbackDecorator } from './fallback.decorator';

class TestClass {
  @asyncFallbackDecorator(500)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  simulate(timeMs, callback = () => {}) {
    return new Promise((resolve) => {
      const hash = Math.round(Math.random() * 100);
      callback();
      setTimeout(() => {
        resolve({ hash, timeMs });
      }, timeMs);
    });
  }
}

describe('FEATURE: asyncFallbackDecorator', () => {
  let testClassInst;
  beforeEach(() => {
    testClassInst = new TestClass();
  });

  it('WHEN: calling a simulate that is less than 500 milisecond, THEN: it should return a result', async () => {
    const result1 = await testClassInst.simulate(100);
    const result2 = await testClassInst.simulate(200);
    const result3 = await testClassInst.simulate(300);
    const [result4, result5, result6] = await Promise.all([
      testClassInst.simulate(400),
      testClassInst.simulate(450),
      testClassInst.simulate(490),
    ]);

    expect(result1.timeMs).toEqual(100);
    expect(result2.timeMs).toEqual(200);
    expect(result3.timeMs).toEqual(300);
    expect(result4.timeMs).toEqual(400);
    expect(result5.timeMs).toEqual(450);
    expect(result6.timeMs).toEqual(490);
  });

  it('WHEN: calling a simulate with more than 500 miliseconds, THEN: it should return a fallback result', async () => {
    const result1 = await testClassInst.simulate(510);
    expect(result1).toEqual([]);

    const [result2, result3, result4] = await Promise.all([
      testClassInst.simulate(510),
      testClassInst.simulate(510),
      testClassInst.simulate(510),
    ]);

    expect(result1).toEqual([]);
    expect(result2.hash).toEqual(result3.hash);
    expect(result4.hash).toEqual(result3.hash);

    const result5 = await testClassInst.simulate(510);
    expect(result5.hash).not.toEqual(result4.hash);
  });

  it('WHEN: calling a simulate with an error, THEN: it should return a fallback result', async () => {
    let throwError = false;
    const callback = () => {
      if (throwError) throw new Error('Expected error');
    };
    const result1 = await testClassInst.simulate(100, callback);
    expect(result1.timeMs).toEqual(100);

    throwError = true;
    const result2 = await testClassInst.simulate(100, callback);
    const result3 = await testClassInst.simulate(100, callback);

    expect(result2.timeMs).toEqual(100);
    expect(result2.hash).toEqual(result1.hash);
    expect(result3.hash).toEqual(result1.hash);

    throwError = false;
    const result4 = await testClassInst.simulate(100, callback);
    expect(result4.timeMs).toEqual(100);
    expect(result4.hash).not.toEqual(result1.hash);
  });
});
