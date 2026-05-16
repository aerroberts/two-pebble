/**
 * Coordinates example service work.
 */
export class ExampleService {
  public constructor(label: string) {
    this.run(label);
  }

  public static create() {
    return new ExampleService('example');
  }

  /**
   * Runs the example service.
   * Normalizes caller input.
   */
  public run(input: string) {
    return this.normalize(input.trim());
  }

  private normalize(input: string) {
    return input.toLowerCase();
  }
}

export interface ExampleServiceInput {
  value: string;
}
