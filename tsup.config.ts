// tsup.config.ts
export default {
  entry: ["src/index.ts"],
  format: ["esm"], // 保持 ESModule 格式
  dts: true, // 生成类型声明文件
  external: ["mitt"],
  //   minify: true, // 可选：如果需要压缩代码
};
