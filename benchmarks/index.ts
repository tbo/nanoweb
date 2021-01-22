import { performance } from 'perf_hooks';
import { Readable, Stream } from 'stream';
import jsxRev1Benchmark from './jsx-rev1';
import reactBenchmark from './react';
import simpleTemplateTagBenchmark from './simple-template-tag';
import advancedTemplateTagBenchmark from './advanced-template-tag';
import streamingTemplateTagBenchmark from './streaming-template-tag';
import currentVersionBenchmark from './current-version';
import currentStreamVersionBenchmark from './current-stream-version';
import publishedVersionBenchmark from './published-version';

const SAMPLES = 1000;

const toString = (stream: Readable) => {
  let buffer = '';
  stream.on('data', (data: string) => (buffer += data.toString()));
  return new Promise(resolve => stream.on('end', () => resolve(buffer)));
};

const formatLatency = (input: number) => String(input.toFixed(2)).padStart(6);
const formatSize = (input: number) => `${Math.round(input / 1024 / 1024)} MB`.padStart(6);

const printStats = (label: string, timings: number[], format: (input: number) => string) => {
  const min = format(Math.min(...timings));
  const max = format(Math.max(...timings));
  const mean = format(timings.reduce((sum, cur) => sum + cur, 0) / SAMPLES);
  console.log(`${label}\t mean:${mean}\t min:${min}\t max:${max}`);
};

const executeBenchmark = async (label: string, benchmark: () => Promise<Readable> | Readable | Promise<string>) => {
  const timeToFirstByte = [];
  const timeToLastByte = [];
  const memoryUsed = [];
  global.gc();

  const baseConsumption = process.memoryUsage().heapUsed;

  // Warmup
  await benchmark();
  global.gc();
  for (let i = 1; i <= SAMPLES; i++) {
    const start = performance.now();
    const response = await benchmark();
    if (response instanceof Stream) {
      response.once('data', () => timeToFirstByte.push(performance.now() - start));
      await new Promise(resolve => response.on('end', resolve));
      // console.log(await toString(response));
    } else {
      timeToFirstByte.push(performance.now() - start);
    }
    timeToLastByte.push(performance.now() - start);
    memoryUsed.push(process.memoryUsage().heapUsed - baseConsumption);
  }
  console.log(`==== ${label} `.padEnd(51, '='));
  printStats('TTFB', timeToFirstByte, formatLatency);
  printStats('TTLB', timeToLastByte, formatLatency);
  printStats('MEM', memoryUsed, formatSize);
};

const executeBenchmarks = async () => {
  await executeBenchmark('JSX Rev. 1', jsxRev1Benchmark);
  await executeBenchmark('React', reactBenchmark);
  await executeBenchmark('Simple Template Tag', simpleTemplateTagBenchmark);
  await executeBenchmark('Advanced Template Tag', advancedTemplateTagBenchmark);
  await executeBenchmark('Streaming Template Tag', streamingTemplateTagBenchmark);
  await executeBenchmark('@nanoweb/template (published)', publishedVersionBenchmark);
  await executeBenchmark('@nanoweb/template String (current)', currentVersionBenchmark);
  await executeBenchmark('@nanoweb/template Stream (current)', currentStreamVersionBenchmark);
};

executeBenchmarks();
