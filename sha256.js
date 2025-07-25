// https://geraintluff.github.io/sha256/
function sha256(ascii) {
    // ... (use a small library/minified code, or import from CDN) ...
    // For brevity, see https://geraintluff.github.io/sha256/
    // Or use SubtleCrypto if you want:
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(ascii)).then(buf => {
        return Array.prototype.map.call(new Uint8Array(buf), x => ('00'+x.toString(16)).slice(-2)).join('');
    });
}
