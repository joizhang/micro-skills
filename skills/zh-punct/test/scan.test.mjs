import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isChineseContextLine } from '../scripts/scan.mjs';

test('isChineseContextLine: detects lines with CJK characters', () => {
  assert.equal(isChineseContextLine('这是一行中文'), true);
  assert.equal(isChineseContextLine('pure English line'), false);
  assert.equal(isChineseContextLine(''), false);
  assert.equal(isChineseContextLine('12345'), false);
  assert.equal(isChineseContextLine('   '), false);
  assert.equal(isChineseContextLine('mixed 中 and english'), true);
  assert.equal(isChineseContextLine('日本語のテキスト'), true);  // Japanese kanji too
});
