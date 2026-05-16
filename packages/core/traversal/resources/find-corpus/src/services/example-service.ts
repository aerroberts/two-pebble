/**
 * Coordinates example service work.
 */
export class ExampleService {
  public static create() {
    return new ExampleService();
  }

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
