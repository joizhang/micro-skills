// scan.mjs — zh-punct scanner

/**
 * Detects whether a line contains CJK (Chinese/Japanese/Korean) characters.
 * Used to decide whether a line is in Chinese context for punctuation conversion.
 */
export function isChineseContextLine(line) {
  return /[㐀-鿿豈-﫿぀-ヿ가-힯]/.test(line);
}
