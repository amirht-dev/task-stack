export class NotFoundException extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
  }
}
