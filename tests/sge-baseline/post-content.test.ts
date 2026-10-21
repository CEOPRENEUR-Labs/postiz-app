import { describe, expect, it } from 'vitest';
import {
  postContentPlainText,
  sanitizePostContent,
} from '../../libraries/helpers/src/utils/sanitize.post.content';

describe('server-side post sanitization', () => {
  it.each([undefined, null, 42, '', {}])(
    'returns empty text for unusable content %s',
    (value) => {
      expect(sanitizePostContent(value)).toBe('');
      expect(postContentPlainText(value)).toBe('');
    }
  );

  it('preserves Unicode and decodes entities for review text', () => {
    const html = '<p>Grüezi 👋 &amp; merci</p>';
    expect(sanitizePostContent(html)).toBe(html);
    expect(postContentPlainText(html)).toBe('Grüezi 👋 & merci');
  });

  it('removes executable markup, handlers and unsafe image/link schemes', () => {
    const html =
      '<p onclick="alert(1)">Hello <script>alert(1)</script>' +
      '<img src="data:image/png;base64,AA" onerror="alert(1)">' +
      '<a href="javascript:alert(1)">world</a></p>';
    expect(sanitizePostContent(html)).toBe('<p>Hello <a>world</a></p>');
    expect(postContentPlainText(html)).toBe('Hello world');
  });

  it('preserves the paragraph boundaries of imported block content', () => {
    expect(sanitizePostContent('<div>First</div><section>Second</section>')).toBe(
      '<p>First</p><p>Second</p>'
    );
  });

  it('keeps editor mention metadata and HTTPS images', () => {
    const html =
      '<span data-mention-id="123" data-mention-label="Müller">Müller</span>' +
      '<img src="https://media.example.test/image.png" alt="Example">';
    expect(sanitizePostContent(html)).toBe(html);
    expect(postContentPlainText(html)).toBe('Müller');
  });
});
