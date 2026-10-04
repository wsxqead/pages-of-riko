// data/*.js (ESM `export const`) 를 Node 스크립트에서 읽기 위한 작은 로더.
// 프로젝트 package.json 에 "type": "module" 이 없어서 직접 import 할 수 없기 때문.
import fs from 'node:fs';
import vm from 'node:vm';

export function loadEsmData(file) {
  let src = fs.readFileSync(file, 'utf8');
  src = src.replace(/^import .*$/gm, ''); // 데이터 파일 간 import 는 무시 (필요한 값은 각각 읽는다)
  const names = [...src.matchAll(/export\s+(?:const|function)\s+(\w+)/g)].map((m) => m[1]);
  src = src.replace(/export\s+(const|function)\s+/g, '$1 ');
  src += `\n;module.exports = { ${names.join(', ')} };`;
  const ctx = {module: {exports: {}}, newsroomIds: []};
  vm.runInNewContext(src, ctx, {filename: file});
  return ctx.module.exports;
}
