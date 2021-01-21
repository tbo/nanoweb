import Page from './page';

const executeBenchmark = () => Page().then((next) => next({}));
export default executeBenchmark;
