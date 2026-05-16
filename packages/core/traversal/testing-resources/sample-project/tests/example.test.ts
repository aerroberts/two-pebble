function describe(_name: string, run: () => void) {
  run();
}

function test(_name: string, _run: () => void) {}

function it(_name: string, _run: () => void) {}

describe('feature: sample test extraction', () => {
  test('happy: extracts direct test titles', () => {
    return true;
  });

  it(`snapshot: extracts template literal titles ${Date.now()}`, () => {
    return { ok: true };
  });
});
