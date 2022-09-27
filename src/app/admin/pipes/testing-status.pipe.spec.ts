import { TestingStatusPipe } from './testing-status.pipe';

describe('TestingStatusPipe', () => {
  it('create an instance', () => {
    const pipe = new TestingStatusPipe();
    expect(pipe).toBeTruthy();
  });
});
