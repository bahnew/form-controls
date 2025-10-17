import { TranslationKeyGenerator } from 'src/services/TranslationKeyService';

describe('TranslationKeyService', () => {
  it('should generate a translation key', () => {
    const transKeyGenerator = new TranslationKeyGenerator('label', '1');
    expect(transKeyGenerator.build()).toBe('LABEL_1');
  });

  it('should generate a translation key by replacing spaces', () => {
    const transKeyGenerator = new TranslationKeyGenerator('some dummy label', '1');
    expect(transKeyGenerator.build()).toBe('SOME_DUMMY_LABEL_1');
  });

  it('should handle empty string input', () => {
    const transKeyGenerator = new TranslationKeyGenerator('', '1');
    expect(transKeyGenerator.build()).toBe('_1');
  });

  it('should use default id of 0 when not provided', () => {
    const generator = new TranslationKeyGenerator('label');
    expect(generator.build()).toBe('LABEL_0');
  });
});
