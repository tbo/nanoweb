import { performance } from 'perf_hooks';
import { Readable, Stream } from 'stream';
import current from './current';
import reactBenchmark from './react';

const SAMPLES = 1000;

const toString = (stream: Readable) => {
  let buffer = '';
  stream.on('data', (data: string) => (buffer += data.toString()));
  return new Promise(resolve => stream.on('end', () => resolve(buffer)));
};

const formatLatency = (input: number) => String(input.toFixed(3)).padStart(6);
const formatSize = (input: number) => `${Math.round(input / 1024 / 1024)} MB`.padStart(6);

const printStats = (label: string, timings: number[], format: (input: number) => string) => {
  const min = format(Math.min(...timings));
  const max = format(Math.max(...timings));
  const mean = format(timings.reduce((sum, cur) => sum + cur, 0) / SAMPLES);
  console.log(`${label}\t mean:${mean}\t min:${min}\t max:${max}`);
};

const executeBenchmark = async (label: string, benchmark: () => Promise<Readable> | Readable | Promise<string>) => {
  const timeToFirstByte: number[] = [];
  const timeToLastByte: number[] = [];
  const memoryUsed: number[] = [];
  global.gc();

  const baseConsumption = process.memoryUsage().heapUsed;

  // Warmup
  for (let i = 1; i <= 100; i++) {
    await benchmark();
  }
  global.gc();
  for (let i = 1; i <= SAMPLES; i++) {
    const start = performance.now();
    const response = await benchmark();
    if (response instanceof Stream) {
      response.once('data', () => timeToFirstByte.push(performance.now() - start));
      await new Promise(resolve => response.on('end', resolve));
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
  await executeBenchmark('React', reactBenchmark);
  await executeBenchmark('current', current);
};

// function streamToString(stream) {
//   const chunks = [];
//   return new Promise((resolve, reject) => {
//     stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
//     stream.on('error', err => reject(err));
//     stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
//   });
// }
// (async () => {
//   console.log(await streamToString(await advancedStreamingTemplateTagBenchmark()));
// })();
executeBenchmarks();
