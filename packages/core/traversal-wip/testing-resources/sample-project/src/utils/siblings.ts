const siblingVersion = '1';

function siblingHelper() {
  return siblingVersion;
}

class SiblingHolder {
  public read() {
    return siblingHelper();
  }
}

interface SiblingShape {
  value: string;
}

export { SiblingHolder, type SiblingShape };
