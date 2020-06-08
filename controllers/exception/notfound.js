export default class NotFoundException extends Error {
  constructor(message) {
    super(message);
  }
}