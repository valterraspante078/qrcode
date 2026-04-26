const DOMPurify = require('isomorphic-dompurify');

try {
    const clean = DOMPurify.sanitize('<h1>Hello</h1>');
    console.log('Sanitization worked:', clean);
    const cleanNull = DOMPurify.sanitize(null);
    console.log('Sanitization with null:', cleanNull);
} catch (e) {
    console.error('Sanitization failed:', e.message);
}
