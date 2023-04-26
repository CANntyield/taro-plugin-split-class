import postcss from 'postcss'
import {describe,expect,it} from "vitest"
import { compileString } from 'sass';
import fs from 'fs'
import path from 'path'

import HandleCssPostcssPlugin from '../src/handleCssPostcssPlugin'

const PostcssCaseDir = 'postcssCases'

function getPostcssCases (file: string): string {
  return path.resolve(__dirname, PostcssCaseDir, file)
}

describe("#postcssPlugin",()=>{
  it("开发中常用的选择器",()=>{
    const inputFile = 'p1.module.scss'
    const outputFile = 'p1_out.module.scss'
    const expectFile = 'p1_expect.module.scss'

    const inputFilePath = getPostcssCases(inputFile)
    const outputFilePath = getPostcssCases(outputFile)
    const expectFilePath = getPostcssCases(expectFile)

    const input = fs.readFileSync(inputFilePath, 'utf8');
    const fileOldClassNameMap = {}
    const result = postcss([HandleCssPostcssPlugin({
      fileOldClassNameMap,
    })]).process(compileString(input).css, { from: inputFilePath, to: outputFilePath });
    fs.writeFileSync(outputFilePath, result.css);
    const output = fs.readFileSync(expectFilePath, 'utf8');
    expect(result.css).toBe(output)
  })
  it("各种选择器2",()=>{
    const inputFile = 'p2.module.scss'
    const outputFile = 'p2_out.module.scss'
    const expectFile = 'p2_expect.module.scss'

    const inputFilePath = getPostcssCases(inputFile)
    const outputFilePath = getPostcssCases(outputFile)
    const expectFilePath = getPostcssCases(expectFile)

    const input = fs.readFileSync(inputFilePath, 'utf8');
    const fileOldClassNameMap = {}
    const result = postcss([HandleCssPostcssPlugin({
      fileOldClassNameMap,
    })]).process(compileString(input).css, { from: inputFilePath, to: outputFilePath });
    fs.writeFileSync(outputFilePath, result.css);
    const output = fs.readFileSync(expectFilePath, 'utf8');
    expect(result.css).toBe(output)
  })
  it("各种选择器组合的复杂语法",()=>{
    const inputFile = 'p3.module.scss'
    const outputFile = 'p3_out.module.scss'
    const expectFile = 'p3_expect.module.scss'

    const inputFilePath = getPostcssCases(inputFile)
    const outputFilePath = getPostcssCases(outputFile)
    const expectFilePath = getPostcssCases(expectFile)

    const input = fs.readFileSync(inputFilePath, 'utf8');
    const fileOldClassNameMap = {}
    const result = postcss([HandleCssPostcssPlugin({
      fileOldClassNameMap,
    })]).process(compileString(input).css, { from: inputFilePath, to: outputFilePath });
    fs.writeFileSync(outputFilePath, result.css);
    const output = fs.readFileSync(expectFilePath, 'utf8');
    expect(result.css).toBe(output)
  })
})
